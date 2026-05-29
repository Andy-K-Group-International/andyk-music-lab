"use client";

import { useState } from "react";
import WaitlistForm, { type WaitlistPlan } from "./WaitlistForm";

interface Props {
  toolName: string;
  toolDesc: string;
  defaultPlan?: WaitlistPlan;
}

export default function ToolGate({ toolName, toolDesc, defaultPlan = "studio" }: Props) {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<WaitlistPlan>(defaultPlan);

  const openWith = (p: WaitlistPlan) => { setPlan(p); setOpen(true); };

  return (
    <div className="tool-page-bg" style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "calc(100vh - 64px)", padding: "40px 24px",
    }}>
      {open && <WaitlistForm initialPlan={plan} onClose={() => setOpen(false)} />}

      <div style={{ textAlign: "center", maxWidth: 520 }}>
        {/* Lock icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 20, margin: "0 auto 24px",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "var(--color-grid-300)", border: "1px solid var(--color-grid-500)",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="1.6" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        <p style={{ fontSize: 11, fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-muted-2)", marginBottom: 12 }}>
          Access Required
        </p>

        <h1 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 800, letterSpacing: "-0.04em", color: "var(--color-foreground)", marginBottom: 14, lineHeight: 1.1 }}>
          {toolName}
        </h1>

        <p style={{ fontSize: 15, color: "var(--color-muted)", lineHeight: 1.7, marginBottom: 32, maxWidth: 420, margin: "0 auto 32px" }}>
          {toolDesc}
        </p>

        <button
          onClick={() => openWith(defaultPlan)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "14px 32px", borderRadius: 12,
            background: "#111111", color: "#ffffff",
            fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer",
            marginBottom: 20,
          }}
        >
          Join Waitlist
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
          {([["single","£49 one-time"],["studio","£19/mo"],["pro","£149/yr"]] as [WaitlistPlan, string][]).map(([p, label]) => (
            <button
              key={p} onClick={() => openWith(p)}
              style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                border: "1px solid var(--color-grid-500)",
                background: "transparent", color: "var(--color-muted-2)",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
