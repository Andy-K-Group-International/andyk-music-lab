"use client";

import { useState, useEffect } from "react";

const ADMIN_KEY = "andyk_lab_admin";

export default function AdminUnlock({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    try { setIsAdmin(localStorage.getItem(ADMIN_KEY) === "true"); } catch {}
  }, []);

  return (
    <>
      <span>{children}</span>
      {isAdmin && (
        <div style={{
          position: "fixed", bottom: 16, left: 16, zIndex: 9999,
          background: "#111111", color: "#ffffff",
          fontSize: 11, fontFamily: "var(--font-mono, monospace)", fontWeight: 700,
          padding: "5px 10px", borderRadius: 8, letterSpacing: "0.06em",
          pointerEvents: "none", userSelect: "none",
          boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
        }}>
          Admin Mode ✓
        </div>
      )}
    </>
  );
}
