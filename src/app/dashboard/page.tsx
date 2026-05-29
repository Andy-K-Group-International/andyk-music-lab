"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_KEY = "andyk_lab_admin";

const TOOLS = [
  {
    name: "BPM + Key Detector",
    desc: "Instant BPM via autocorrelation, musical key, Camelot wheel code, and danceability score.",
    href: "/bpm",
  },
  {
    name: "Mastering Tool",
    desc: "Normalize to −14 LUFS, precision EQ, stereo widening, and true-peak limiting.",
    href: "/mastering",
  },
  {
    name: "DJ Set Planner",
    desc: "Build harmonically perfect sets using the Camelot Wheel with transition analysis.",
    href: "/planner",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(ADMIN_KEY) !== "true") {
        router.replace("/admin");
        return;
      }
    } catch {}
    setReady(true);
  }, [router]);

  function logout() {
    try { localStorage.removeItem(ADMIN_KEY); } catch {}
    router.replace("/admin");
  }

  if (!ready) return null;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#ffffff",
      fontFamily: "var(--font-sans, sans-serif)",
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid #e5e5e5",
        padding: "20px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <span style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase" as const,
            color: "#8a8a8a",
          }}>
            Andy&apos;K Music Lab
          </span>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111111", margin: "4px 0 0", letterSpacing: "-0.02em" }}>
            Lab Dashboard
          </h1>
        </div>
        <button
          onClick={logout}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "1px solid #e5e5e5",
            background: "transparent",
            color: "#525252",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Log out
        </button>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 32px" }}>
        <p style={{ fontSize: 13, color: "#8a8a8a", marginBottom: 32, fontFamily: "var(--font-mono, monospace)", letterSpacing: "0.05em" }}>
          Internal Tools
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {TOOLS.map((tool) => (
            <a
              key={tool.href}
              href={tool.href}
              style={{
                display: "block",
                padding: "20px 24px",
                border: "1px solid #e5e5e5",
                borderRadius: 12,
                textDecoration: "none",
                background: "#ffffff",
                transition: "border-color 0.15s ease, box-shadow 0.15s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#111111";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#e5e5e5";
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: "#111111" }}>{tool.name}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
              <p style={{ fontSize: 13, color: "#737373", lineHeight: 1.5, margin: 0 }}>{tool.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
