'use client';

import { useState } from "react";
import { useSession } from "@/lib/contexts/SessionContext";
import { trpc } from "@/lib/trpc";

export default function AdminPage() {
  const { t } = useSession();
  const [activeTab, setActiveTab] = useState<"sessions" | "telegram">("sessions");

  const sessionsQuery = trpc.admin.listSessions.useQuery(undefined, { enabled: activeTab === "sessions" });

  return (
    <div style={{ backgroundColor: "#141414", minHeight: "100vh", color: "white", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "28px" }}>Admin Panel</h1>

        <div style={{ display: "flex", gap: "16px", marginBottom: "28px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "16px" }}>
          <button
            onClick={() => setActiveTab("sessions")}
            style={{
              background: activeTab === "sessions" ? "#E50914" : "transparent",
              color: "white",
              border: "none",
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Live Sessions
          </button>
          <button
            onClick={() => setActiveTab("telegram")}
            style={{
              background: activeTab === "telegram" ? "#E50914" : "transparent",
              color: "white",
              border: "none",
              padding: "8px 16px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Telegram Config
          </button>
        </div>

        {activeTab === "sessions" && (
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>Active Sessions</h2>
            {sessionsQuery.isLoading && <p>Loading sessions...</p>}
            {sessionsQuery.data && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                      <th style={{ textAlign: "left", padding: "12px", fontWeight: 600 }}>Session ID</th>
                      <th style={{ textAlign: "left", padding: "12px", fontWeight: 600 }}>IP</th>
                      <th style={{ textAlign: "left", padding: "12px", fontWeight: 600 }}>Country</th>
                      <th style={{ textAlign: "left", padding: "12px", fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionsQuery.data.map((session) => (
                      <tr key={session.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <td style={{ padding: "12px", fontSize: "12px" }}>{session.id.substring(0, 8)}...</td>
                        <td style={{ padding: "12px", fontSize: "12px" }}>{session.ip}</td>
                        <td style={{ padding: "12px", fontSize: "12px" }}>{session.country}</td>
                        <td style={{ padding: "12px", fontSize: "12px" }}>{session.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
