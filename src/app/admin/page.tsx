"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_KEY = "andyk_lab_admin";
const ADMIN_EMAIL = "ceo@andykgroup.com";

export default function AdminPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "ANDYK2026";

    if (email === ADMIN_EMAIL && password === correctPassword) {
      try { localStorage.setItem(ADMIN_KEY, "true"); } catch {}
      router.push("/dashboard");
    } else {
      setError("Invalid credentials");
      setPassword("");
      setLoading(false);
    }
  };

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    background: "#1a1a1a",
    border: `1px solid ${hasError ? "#ef4444" : "#333333"}`,
    color: "#ffffff",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  });

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 10,
    fontWeight: 700,
    color: "rgba(255,255,255,0.4)",
    marginBottom: 6,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    fontFamily: "var(--font-mono, monospace)",
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ marginBottom: 36 }}>
          <span style={{
            fontFamily: "var(--font-mono, monospace)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)",
            display: "block",
            marginBottom: 12,
          }}>
            Andy&apos;K Music Lab
          </span>
          <h1 style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#ffffff",
            letterSpacing: "-0.03em",
            marginBottom: 6,
          }}>
            Admin Login
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
            Restricted access — authorised personnel only.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              autoComplete="email"
              onChange={e => { setEmail(e.target.value); setError(""); }}
              required
              style={inputStyle(!!error)}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              autoComplete="current-password"
              onChange={e => { setPassword(e.target.value); setError(""); }}
              required
              style={inputStyle(!!error)}
            />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: "#ef4444", margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: "12px",
              borderRadius: 10,
              background: "#ffffff",
              color: "#111111",
              fontSize: 14,
              fontWeight: 700,
              border: "none",
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
          <a href="/" style={{ color: "inherit", textDecoration: "none" }}>← Back to Lab</a>
        </p>
      </div>
    </main>
  );
}
