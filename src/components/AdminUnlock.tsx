"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const ADMIN_KEY = "andyk_lab_admin";
const CLICKS_NEEDED = 5;
const CLICK_WINDOW = 3000;
const ADMIN_PASSWORD = "ANDYK2026";

export default function AdminUnlock({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const times = useRef<number[]>([]);

  useEffect(() => {
    try { setIsAdmin(localStorage.getItem(ADMIN_KEY) === "true"); } catch {}
  }, []);

  const handleClick = useCallback(() => {
    if (isAdmin) return;
    const now = Date.now();
    times.current = [...times.current.filter(t => now - t < CLICK_WINDOW), now];
    if (times.current.length >= CLICKS_NEEDED) {
      times.current = [];
      setShowPrompt(true);
    }
  }, [isAdmin]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.trim() === ADMIN_PASSWORD) {
      try { localStorage.setItem(ADMIN_KEY, "true"); } catch {}
      setIsAdmin(true);
      setShowPrompt(false);
      setPw("");
      setError(false);
    } else {
      setError(true);
      setPw("");
    }
  };

  return (
    <>
      <span onClick={handleClick} style={{ cursor: "default" }}>{children}</span>

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

      {showPrompt && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 10000,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
        }}>
          <form onSubmit={submit} style={{
            background: "#ffffff", borderRadius: 16, padding: 32,
            width: "100%", maxWidth: 360,
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          }}>
            <p style={{
              fontSize: 11, fontFamily: "var(--font-mono, monospace)", fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase", color: "#8b93a8", marginBottom: 20,
            }}>
              Admin Access
            </p>
            <input
              autoFocus
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(false); }}
              placeholder="Password"
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                border: `1px solid ${error ? "#ef4444" : "#e2e4ea"}`,
                fontSize: 14, marginBottom: error ? 8 : 16, outline: "none",
                fontFamily: "var(--font-mono, monospace)", boxSizing: "border-box",
              }}
            />
            {error && <p style={{ fontSize: 12, color: "#ef4444", marginBottom: 12 }}>Incorrect password</p>}
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" style={{
                flex: 1, padding: "10px", borderRadius: 10,
                background: "#111111", color: "#ffffff",
                fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer",
              }}>
                Unlock
              </button>
              <button type="button" onClick={() => { setShowPrompt(false); setPw(""); setError(false); }} style={{
                padding: "10px 16px", borderRadius: 10,
                background: "transparent", border: "1px solid #e2e4ea",
                fontSize: 13, color: "#525a70", cursor: "pointer",
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
