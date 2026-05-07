"use client";

import { useState } from "react";

interface Step {
  text: string;
  warning?: boolean;
}

interface Props {
  title: string;
  steps: Step[];
  privacyNote: string;
}

export default function HowItWorks({ title, steps, privacyNote }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="how-it-works-accordion" style={{ marginBottom: 20 }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="hiw-trigger"
        aria-expanded={open}
      >
        <span className="hiw-icon">ℹ</span>
        <span className="hiw-label">How does this work?</span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          className="hiw-chevron"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease", marginLeft: "auto", flexShrink: 0 }}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="hiw-body">
          <h3 className="hiw-title">{title}</h3>
          <ol className="hiw-steps">
            {(() => {
              let n = 0;
              return steps.map((step, i) => {
                if (!step.warning) n++;
                return (
                  <li key={i} className={`hiw-step ${step.warning ? "hiw-step-warning" : ""}`}>
                    {step.warning
                      ? <span className="hiw-step-warn-icon">⚠</span>
                      : <span className="hiw-step-num">{n}</span>
                    }
                    <span className="hiw-step-text">{step.text}</span>
                  </li>
                );
              });
            })()}
          </ol>
          <div className="hiw-privacy">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            {privacyNote}
          </div>
        </div>
      )}
    </div>
  );
}
