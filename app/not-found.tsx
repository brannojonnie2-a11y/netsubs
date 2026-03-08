'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{ backgroundColor: "#141414", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ backgroundColor: "rgba(0,0,0,0.75)", borderRadius: "4px", padding: "60px", maxWidth: "460px", textAlign: "center" }}>
        <h1 style={{ color: "#E50914", fontSize: "48px", fontWeight: 700, marginBottom: "16px" }}>404</h1>
        <p style={{ color: "white", fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>Page Not Found</p>
        <p style={{ color: "#8c8c8c", marginBottom: "28px" }}>The page you are looking for does not exist.</p>
        <Link href="/" style={{
          display: "inline-block",
          backgroundColor: "#E50914",
          color: "white",
          padding: "10px 24px",
          textDecoration: "none",
          borderRadius: "4px",
          fontWeight: 700,
        }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
