"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "#fafafa",
  border: "1px solid #e5e5e5",
  borderRadius: 0,
  color: "#111111",
  fontSize: 14,
  fontFamily: "var(--font-sans)",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontFamily: "var(--font-mono)",
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#8a8a8a",
  marginBottom: 6,
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gdpr) { setError("You must accept the privacy policy to continue."); return; }
    setLoading(true);
    setError("");

    // Create user + profile via API route (uses service role)
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password, full_name: fullName.trim(), gdpr_consent: true }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(res.status === 409 ? "An account with this email already exists." : (data.error || "Something went wrong. Please try again."));
      setLoading(false);
      return;
    }

    // Sign in after successful registration
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signInError) {
      setError("Account created. Please sign in.");
      router.push("/login");
    } else {
      const next = searchParams.get("next") ?? "/client";
      router.push(next);
      router.refresh();
    }
  };

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      background: "#ffffff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "48px 24px",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8a8a", marginBottom: 20 }}>
          Andy&apos;K Music Lab
        </p>

        <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.4rem)", fontWeight: 700, color: "#111111", lineHeight: 1.15, margin: "0 0 40px", fontFamily: "var(--font-sans)" }}>
          Create Account
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={labelStyle}>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your name"
              style={inputStyle}
              autoComplete="name"
            />
          </div>

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
              autoComplete="email"
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              style={inputStyle}
              autoComplete="new-password"
            />
          </div>

          {/* GDPR */}
          <div>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={gdpr}
                onChange={e => { setGdpr(e.target.checked); if (error) setError(""); }}
                style={{ marginTop: 3, width: 14, height: 14, flexShrink: 0, accentColor: "#111111", cursor: "pointer", borderRadius: 0 }}
              />
              <span style={{ fontSize: 11, color: "#525252", lineHeight: 1.65, fontFamily: "var(--font-mono)" }}>
                I confirm that I have read and understood the{" "}
                <Link href="/privacy-policy" style={{ color: "#111111", textDecoration: "underline" }}>Privacy Policy</Link>
                {" "}and agree that my personal data may be processed for the purpose of creating and managing my Andy&apos;K Music Lab account, payment access, tool access and related support. I have also read the{" "}
                <Link href="/pricing-terms" style={{ color: "#111111", textDecoration: "underline" }}>Pricing &amp; Access Terms</Link>.
              </span>
            </label>
            <p style={{ fontSize: 11, color: "#8a8a8a", fontFamily: "var(--font-mono)", lineHeight: 1.6, margin: "10px 0 0", paddingLeft: 26 }}>
              Your account access is linked to the email address used during checkout. Please register with the same email used for payment.
            </p>
          </div>

          {error && (
            <p style={{ fontSize: 13, color: "#ef4444", margin: 0 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#525252" : "#111111",
              color: "#ffffff",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              border: "none",
              borderRadius: 0,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s ease",
            }}
          >
            {loading ? "Creating account…" : "Create Account →"}
          </button>
        </form>

        <div style={{ height: 1, background: "#e5e5e5", margin: "32px 0" }} />

        <p style={{ fontSize: 13, color: "#8a8a8a", fontFamily: "var(--font-sans)", margin: 0 }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#111111", fontWeight: 600, textDecoration: "underline" }}>
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
