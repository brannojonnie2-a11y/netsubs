'use client';

import { useRouter } from "next/navigation";
import { useSession } from "@/lib/contexts/SessionContext";

export default function DeclinedPage() {
  const router = useRouter();
  const { t } = useSession();

  return (
    <div style={{ backgroundColor: "#141414", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.75)", borderRadius: "4px", padding: "60px", maxWidth: "460px", textAlign: "center" }}>
        <h1 style={{ color: "#E50914", fontSize: "28px", fontWeight: 700, marginBottom: "16px" }}>{t("paymentDeclined")}</h1>
        <p style={{ color: "#8c8c8c", marginBottom: "28px" }}>{t("declinedMessage")}</p>
        <button onClick={() => router.push("/payment")} style={{ width: "100%", backgroundColor: "#E50914", color: "white", border: "none", borderRadius: "4px", padding: "10px", fontSize: "16px", fontWeight: 700, cursor: "pointer" }}>
          {t("tryAgain")}
        </button>
      </div>
    </div>
  );
}
