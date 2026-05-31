"use client";

import { useState } from "react";
import type { Metadata } from "next";

// Note: metadata must be in a server component; this page uses client state so metadata is in layout
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  background: "#fafafa",
  border: "1px solid #e5e5e5",
  borderRadius: 0,
  color: "#111111",
  fontSize: 14,
  fontFamily: "var(--font-sans, sans-serif)",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontFamily: "var(--font-mono, monospace)",
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#8a8a8a",
  marginBottom: 6,
};

const TYPES = [
  "Music School",
  "DJ Course",
  "Producer Community",
  "Online Course",
  "Other",
];

export default function EducationAccessPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [students, setStudents] = useState("");
  const [type, setType] = useState("Music School");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/education-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        website: website.trim() || null,
        students_count: students ? parseInt(students, 10) : null,
        type,
        message: message.trim() || null,
      }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "var(--font-sans, sans-serif)" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "80px 24px 64px" }}>

        <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(0,0,0,0.38)", margin: "0 0 20px" }}>
          Education Access
        </p>

        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 700, color: "#111111", letterSpacing: "-0.02em", lineHeight: 1.2, margin: "0 0 20px" }}>
          Limited Education Access
        </h1>

        <p style={{ fontSize: 15, color: "#525252", lineHeight: 1.75, margin: "0 0 48px", maxWidth: 520 }}>
          Music schools, DJ courses and producer communities can apply for free or discounted access to Andy&apos;K Music Lab for their students. We review each request individually.
        </p>

        {submitted ? (
          <div style={{ border: "1px solid #e5e5e5", padding: "32px", background: "#fafafa" }}>
            <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#16a34a", margin: "0 0 12px" }}>
              Request Received
            </p>
            <p style={{ fontSize: 15, color: "#111111", lineHeight: 1.75, margin: 0 }}>
              Thank you. Your education access request has been received. We will review it and contact you if selected.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            <div>
              <label style={labelStyle}>School / Course / Community Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. London DJ Academy"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Contact Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@school.com"
                style={inputStyle}
                autoComplete="email"
              />
            </div>

            <div>
              <label style={labelStyle}>Website or Social Link</label>
              <input
                type="text"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://yourschool.com or @handle"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Number of Students</label>
                <input
                  type="number"
                  min={1}
                  value={students}
                  onChange={e => setStudents(e.target.value)}
                  placeholder="e.g. 40"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Type</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Short Message (optional)</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Tell us about your school or course and how your students would use the tools."
                rows={4}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
              />
            </div>

            {error && (
              <p style={{ fontSize: 13, color: "#ef4444", margin: 0 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "14px 28px",
                background: loading ? "#525252" : "#111111",
                color: "#ffffff",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                border: "none",
                borderRadius: 0,
                cursor: loading ? "not-allowed" : "pointer",
                alignSelf: "flex-start",
                transition: "background 0.15s ease",
              }}
            >
              {loading ? "Submitting…" : "Submit Request →"}
            </button>

          </form>
        )}

        <div style={{ height: 1, background: "#e5e5e5", margin: "56px 0 24px" }} />
        <p style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10, color: "#a3a3a3", letterSpacing: "0.06em", lineHeight: 1.7 }}>
          All requests are reviewed manually. We will contact you at the email provided if your application is a good fit.
        </p>

      </div>
    </div>
  );
}
