"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const ADMIN_KEY = "andyk_lab_admin";

const TOOLS = [
  { name: "BPM + Key Detector",  desc: "Instant BPM via autocorrelation, musical key, Camelot wheel code, and danceability score.", href: "/bpm" },
  { name: "Mastering Tool",      desc: "Normalize to −14 LUFS, precision EQ, stereo widening, and true-peak limiting.",            href: "/mastering" },
  { name: "DJ Set Planner",      desc: "Build harmonically perfect sets using the Camelot Wheel with transition analysis.",         href: "/planner" },
  { name: "Track Comparator",    desc: "Compare two tracks side-by-side: LUFS, peak, DR, BPM, key, and Camelot.",                  href: "/track-comparator" },
  { name: "Chord Generator",     desc: "Generate chord progressions for Trance, House, Pop, and Cinematic with piano voicings.",   href: "/chord-generator" },
  { name: "Metronome",           desc: "Web Audio API metronome with tap tempo, time signatures, and subdivisions.",               href: "/metronome" },
  { name: "Loudness Meter",      desc: "Real-time LUFS from microphone or file. Momentary, short-term, and integrated readings.",  href: "/loudness-meter" },
  { name: "Stem Splitter",       desc: "Frequency-band stem splitting — Bass, Mids, Highs — each downloadable as WAV.",            href: "/stem-splitter" },
];

const PLAN_LABEL: Record<string, string> = {
  single: "One-time",
  studio: "Monthly",
  pro:    "Yearly",
};

type Entry = {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  created_at: string;
  notified: boolean;
};

type Filter = "all" | "single" | "studio" | "pro";

type EdRequest = {
  id: string;
  name: string;
  email: string;
  website: string | null;
  students_count: number | null;
  type: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

const ED_STATUS_COLOR: Record<string, string> = {
  new:      "#111111",
  reviewed: "#737373",
  accepted: "#16a34a",
  rejected: "#ef4444",
};

type DiscountCode = {
  id: string;
  code: string;
  discount_percent: number;
  used: boolean;
  used_by_email: string | null;
  expires_at: string | null;
  plan_restriction: string | null;
  created_for_email: string | null;
  created_at: string;
};

const PLAN_OPTIONS = [
  { value: "all",       label: "All Plans" },
  { value: "studio",    label: "Studio Pass" },
  { value: "pro",       label: "Pro Pass" },
  { value: "single",    label: "Single Session" },
  { value: "mastering", label: "Mastering Tool" },
  { value: "bpm",       label: "BPM + Key" },
  { value: "planner",   label: "DJ Set Planner" },
];

function codeStatus(c: DiscountCode): { label: string; color: string } {
  if (c.used) return { label: "Used", color: "#8a8a8a" };
  if (c.expires_at && new Date(c.expires_at) < new Date()) return { label: "Expired", color: "#ef4444" };
  return { label: "Active", color: "#16a34a" };
}

// ── Styles ────────────────────────────────────────────────────────────────────

const S = {
  btn: (variant: "primary" | "ghost"): React.CSSProperties => ({
    padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
    border: variant === "primary" ? "none" : "1px solid #e5e5e5",
    background: variant === "primary" ? "#111111" : "transparent",
    color: variant === "primary" ? "#ffffff" : "#525252",
    fontFamily: "inherit", transition: "opacity 0.15s ease",
  }),
  tag: (notified: boolean): React.CSSProperties => ({
    display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600,
    background: notified ? "#f5f5f5" : "#111111",
    color: notified ? "#8a8a8a" : "#ffffff",
  }),
};

export default function DashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Waitlist state
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [notifyingId, setNotifyingId] = useState<string | null>(null);
  const [notifyingAll, setNotifyingAll] = useState(false);
  const [notifyAllResult, setNotifyAllResult] = useState<string | null>(null);

  // Education requests state
  const [edRequests, setEdRequests] = useState<EdRequest[]>([]);
  const [edLoading, setEdLoading] = useState(false);

  // Discount generator state
  const [genEmail, setGenEmail] = useState("");
  const [genPercent, setGenPercent] = useState(40);
  const [genPlan, setGenPlan] = useState("all");
  const [genExpiry, setGenExpiry] = useState(72);
  const [genLoading, setGenLoading] = useState(false);
  const [genResult, setGenResult] = useState<{ code: string; email: string } | { error: string } | null>(null);
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [codesLoading, setCodesLoading] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(ADMIN_KEY) !== "true") { router.replace("/admin"); return; }
    } catch {}
    setReady(true);
  }, [router]);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/waitlist");
      if (res.ok) { const { entries: e } = await res.json(); setEntries(e ?? []); }
    } finally { setLoading(false); }
  }, []);

  const fetchEdRequests = useCallback(async () => {
    setEdLoading(true);
    try {
      const res = await fetch("/api/admin/education");
      if (res.ok) { const { requests } = await res.json(); setEdRequests(requests ?? []); }
    } finally { setEdLoading(false); }
  }, []);

  const fetchCodes = useCallback(async () => {
    setCodesLoading(true);
    try {
      const res = await fetch("/api/admin/discount/generate");
      if (res.ok) { const { codes: c } = await res.json(); setCodes(c ?? []); }
    } finally { setCodesLoading(false); }
  }, []);

  useEffect(() => { if (ready) { fetchEntries(); fetchCodes(); fetchEdRequests(); } }, [ready, fetchEntries, fetchCodes, fetchEdRequests]);

  async function logout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch { /* ignore */ }
    try { localStorage.removeItem(ADMIN_KEY); } catch {}
    router.replace("/admin");
  }

  async function generateDiscount(e: React.FormEvent) {
    e.preventDefault();
    setGenLoading(true);
    setGenResult(null);
    try {
      const res = await fetch("/api/admin/discount/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: genEmail.trim().toLowerCase(),
          discount_percent: genPercent,
          plan_restriction: genPlan,
          expiry_hours: genExpiry,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setGenResult({ code: data.code, email: genEmail.trim().toLowerCase() });
        setGenEmail("");
        fetchCodes();
      } else {
        setGenResult({ error: data.error ?? "Something went wrong" });
      }
    } catch {
      setGenResult({ error: "Network error" });
    } finally {
      setGenLoading(false);
    }
  }

  async function notifyOne(id: string) {
    setNotifyingId(id);
    try {
      const res = await fetch(`/api/admin/waitlist/${id}`, { method: "POST" });
      if (res.ok) setEntries(prev => prev.map(e => e.id === id ? { ...e, notified: true } : e));
    } finally { setNotifyingId(null); }
  }

  async function notifyAll() {
    setNotifyingAll(true);
    setNotifyAllResult(null);
    try {
      const res = await fetch("/api/admin/waitlist/notify-all", { method: "POST" });
      if (res.ok) {
        const { count } = await res.json();
        setNotifyAllResult(`Sent to ${count} people`);
        await fetchEntries();
      }
    } finally { setNotifyingAll(false); }
  }

  const filtered = filter === "all" ? entries : entries.filter(e => e.plan === filter);
  const unnotifiedCount = entries.filter(e => !e.notified).length;

  if (!ready) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "var(--font-sans, sans-serif)" }}>

      {/* Header */}
      <div style={{ borderBottom: "1px solid #e5e5e5", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase" as const, color: "#8a8a8a" }}>
            Andy&apos;K Music Lab
          </span>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#111111", margin: "4px 0 0", letterSpacing: "-0.02em" }}>Lab Dashboard</h1>
        </div>
        <button onClick={logout} style={S.btn("ghost")}>Log out</button>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 32px" }}>

        {/* Tools */}
        <p style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#8a8a8a", marginBottom: 16 }}>
          Internal Tools
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12, marginBottom: 48 }}>
          {TOOLS.map(tool => (
            <a key={tool.href} href={tool.href} style={{ display: "block", padding: "18px 20px", border: "1px solid #e5e5e5", borderRadius: 10, textDecoration: "none", background: "#ffffff" }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#111111"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "#e5e5e5"; }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#111111" }}>{tool.name}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
              <p style={{ fontSize: 12, color: "#737373", lineHeight: 1.5, margin: 0 }}>{tool.desc}</p>
            </a>
          ))}
        </div>

        {/* Waitlist */}
        <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: 40 }}>
          {/* Waitlist header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 12, marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#8a8a8a", margin: "0 0 4px" }}>
                Waitlist
              </p>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111111", margin: 0 }}>
                {loading ? "Loading…" : `${entries.length} ${entries.length === 1 ? "person" : "people"} waiting`}
                {!loading && unnotifiedCount > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 400, color: "#8a8a8a", marginLeft: 10 }}>
                    {unnotifiedCount} unnotified
                  </span>
                )}
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {notifyAllResult && (
                <span style={{ fontSize: 12, color: "#525252" }}>{notifyAllResult}</span>
              )}
              <button
                onClick={notifyAll}
                disabled={notifyingAll || unnotifiedCount === 0}
                style={{ ...S.btn("primary"), opacity: (notifyingAll || unnotifiedCount === 0) ? 0.5 : 1 }}
              >
                {notifyingAll ? "Sending…" : `Notify All (${unnotifiedCount})`}
              </button>
              <button onClick={fetchEntries} style={S.btn("ghost")}>↻</button>
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
            {(["all", "single", "studio", "pro"] as Filter[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 500,
                  border: "1px solid " + (filter === f ? "#111111" : "#e5e5e5"),
                  background: filter === f ? "#111111" : "transparent",
                  color: filter === f ? "#ffffff" : "#525252",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {f === "all" ? "All" : PLAN_LABEL[f]}
                {f !== "all" && (
                  <span style={{ marginLeft: 5, opacity: 0.6 }}>
                    {entries.filter(e => e.plan === f).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Table */}
          {loading ? (
            <p style={{ fontSize: 13, color: "#8a8a8a", padding: "24px 0" }}>Loading waitlist…</p>
          ) : filtered.length === 0 ? (
            <p style={{ fontSize: 13, color: "#8a8a8a", padding: "24px 0" }}>No entries.</p>
          ) : (
            <div style={{ border: "1px solid #e5e5e5", borderRadius: 10, overflow: "hidden" }}>
              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr 100px 120px 80px 90px", gap: 0, background: "#f5f5f5", borderBottom: "1px solid #e5e5e5", padding: "8px 16px" }}>
                {["Name", "Email", "Plan", "Date", "Status", ""].map(h => (
                  <span key={h} style={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#8a8a8a" }}>{h}</span>
                ))}
              </div>

              {/* Rows */}
              {filtered.map((entry, i) => (
                <div
                  key={entry.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1.6fr 100px 120px 80px 90px",
                    gap: 0,
                    padding: "10px 16px",
                    borderBottom: i < filtered.length - 1 ? "1px solid #f0f0f0" : "none",
                    alignItems: "center",
                    background: entry.notified ? "#fafafa" : "#ffffff",
                  }}
                >
                  <span style={{ fontSize: 13, color: "#111111", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                    {entry.name || "—"}
                  </span>
                  <span style={{ fontSize: 12, color: "#525252", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                    {entry.email}
                  </span>
                  <span style={{ fontSize: 12, color: "#525252" }}>
                    {PLAN_LABEL[entry.plan] ?? entry.plan}
                  </span>
                  <span style={{ fontSize: 11, color: "#8a8a8a", fontFamily: "var(--font-mono, monospace)" }}>
                    {new Date(entry.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
                  </span>
                  <span style={S.tag(entry.notified)}>
                    {entry.notified ? "Sent" : "Pending"}
                  </span>
                  <div style={{ textAlign: "right" as const }}>
                    {!entry.notified && (
                      <button
                        onClick={() => notifyOne(entry.id)}
                        disabled={notifyingId === entry.id}
                        style={{ ...S.btn("primary"), fontSize: 11, padding: "5px 10px", opacity: notifyingId === entry.id ? 0.5 : 1 }}
                      >
                        {notifyingId === entry.id ? "…" : "Send"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discount Generator */}
        <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: 40, marginTop: 48 }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#8a8a8a", margin: "0 0 4px" }}>
              Discount Generator
            </p>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111111", margin: 0 }}>
              Generate &amp; send a personalized discount code
            </h2>
          </div>

          <form onSubmit={generateDiscount} style={{ display: "flex", flexDirection: "column" as const, gap: 12, maxWidth: 580, marginBottom: 32 }}>
            {/* Email */}
            <div>
              <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono, monospace)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#8a8a8a", marginBottom: 5 }}>
                Send to email
              </label>
              <input
                type="email"
                required
                value={genEmail}
                onChange={e => setGenEmail(e.target.value)}
                placeholder="name@example.com"
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e5e5", borderRadius: 0, fontSize: 13, fontFamily: "var(--font-mono, monospace)", outline: "none", boxSizing: "border-box" as const, color: "#111111" }}
              />
            </div>

            {/* Discount %, Plan, Expiry — row */}
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 120px", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono, monospace)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#8a8a8a", marginBottom: 5 }}>
                  Discount %
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={100}
                  value={genPercent}
                  onChange={e => setGenPercent(Number(e.target.value))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e5e5", borderRadius: 0, fontSize: 13, fontFamily: "var(--font-mono, monospace)", outline: "none", boxSizing: "border-box" as const, color: "#111111" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono, monospace)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#8a8a8a", marginBottom: 5 }}>
                  Plan
                </label>
                <select
                  value={genPlan}
                  onChange={e => setGenPlan(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e5e5", borderRadius: 0, fontSize: 13, fontFamily: "var(--font-mono, monospace)", outline: "none", boxSizing: "border-box" as const, color: "#111111", background: "#ffffff", cursor: "pointer" }}
                >
                  {PLAN_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, fontFamily: "var(--font-mono, monospace)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: "#8a8a8a", marginBottom: 5 }}>
                  Expires (hrs)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={genExpiry}
                  onChange={e => setGenExpiry(Number(e.target.value))}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e5e5", borderRadius: 0, fontSize: 13, fontFamily: "var(--font-mono, monospace)", outline: "none", boxSizing: "border-box" as const, color: "#111111" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={genLoading}
              style={{
                alignSelf: "flex-start",
                padding: "10px 22px",
                background: "#111111",
                color: "#ffffff",
                border: "none",
                borderRadius: 0,
                fontSize: 12,
                fontWeight: 700,
                fontFamily: "var(--font-mono, monospace)",
                letterSpacing: "0.08em",
                textTransform: "uppercase" as const,
                cursor: genLoading ? "wait" : "pointer",
                opacity: genLoading ? 0.6 : 1,
              }}
            >
              {genLoading ? "Sending…" : "Generate & Send →"}
            </button>

            {/* Result */}
            {genResult && "error" in genResult && (
              <p style={{ fontSize: 12, color: "#ef4444", margin: 0, fontFamily: "var(--font-mono, monospace)" }}>
                ✕ {genResult.error}
              </p>
            )}
            {genResult && "code" in genResult && (
              <div style={{ padding: "16px 20px", border: "1px solid #e5e5e5", background: "#fafafa" }}>
                <p style={{ margin: "0 0 6px", fontSize: 11, fontFamily: "var(--font-mono, monospace)", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#16a34a" }}>
                  ✓ Discount sent to {genResult.email}
                </p>
                <p style={{ margin: 0, fontSize: 20, fontFamily: "var(--font-mono, monospace)", fontWeight: 700, color: "#111111", letterSpacing: "0.06em" }}>
                  {genResult.code}
                </p>
              </div>
            )}
          </form>

          {/* Recent codes table */}
          <p style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#8a8a8a", marginBottom: 12 }}>
            Recent Codes
          </p>
          {codesLoading ? (
            <p style={{ fontSize: 13, color: "#8a8a8a" }}>Loading…</p>
          ) : codes.length === 0 ? (
            <p style={{ fontSize: 13, color: "#8a8a8a" }}>No codes yet.</p>
          ) : (
            <div style={{ border: "1px solid #e5e5e5", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.8fr 50px 100px 1.5fr 140px 70px", gap: 0, background: "#f5f5f5", borderBottom: "1px solid #e5e5e5", padding: "7px 14px" }}>
                {["Code", "%", "Plan", "Sent To", "Expires", "Status"].map(h => (
                  <span key={h} style={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#8a8a8a" }}>{h}</span>
                ))}
              </div>
              {codes.map((c, i) => {
                const st = codeStatus(c);
                return (
                  <div
                    key={c.id}
                    style={{ display: "grid", gridTemplateColumns: "1.8fr 50px 100px 1.5fr 140px 70px", gap: 0, padding: "9px 14px", borderBottom: i < codes.length - 1 ? "1px solid #f0f0f0" : "none", alignItems: "center" }}
                  >
                    <span style={{ fontSize: 12, fontFamily: "var(--font-mono, monospace)", fontWeight: 700, color: "#111111" }}>{c.code}</span>
                    <span style={{ fontSize: 12, fontFamily: "var(--font-mono, monospace)", color: "#525252" }}>{c.discount_percent}%</span>
                    <span style={{ fontSize: 11, color: "#737373" }}>{c.plan_restriction ?? "All"}</span>
                    <span style={{ fontSize: 12, color: "#525252", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{c.created_for_email ?? "—"}</span>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", color: "#8a8a8a" }}>
                      {c.expires_at ? new Date(c.expires_at).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </span>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", fontWeight: 700, color: st.color }}>{st.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>


        {/* Education Access Requests */}
        <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: 40, marginTop: 48 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <div>
              <p style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" as const, color: "#8a8a8a", margin: "0 0 4px" }}>
                Education Access
              </p>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111111", margin: 0 }}>
                {edLoading ? "Loading…" : `${edRequests.length} request${edRequests.length !== 1 ? "s" : ""}`}
              </h2>
            </div>
            <button onClick={fetchEdRequests} style={S.btn("ghost")}>↻</button>
          </div>

          {edLoading ? (
            <p style={{ fontSize: 13, color: "#8a8a8a" }}>Loading…</p>
          ) : edRequests.length === 0 ? (
            <p style={{ fontSize: 13, color: "#8a8a8a" }}>No requests yet.</p>
          ) : (
            <div style={{ border: "1px solid #e5e5e5", overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 100px 1.4fr 70px 80px 110px", gap: 0, background: "#f5f5f5", borderBottom: "1px solid #e5e5e5", padding: "7px 14px" }}>
                {["Name", "Type", "Email", "Students", "Status", "Date"].map(h => (
                  <span key={h} style={{ fontSize: 10, fontFamily: "var(--font-mono, monospace)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "#8a8a8a" }}>{h}</span>
                ))}
              </div>
              {edRequests.map((r, i) => (
                <div
                  key={r.id}
                  title={r.message ?? undefined}
                  style={{ display: "grid", gridTemplateColumns: "1.4fr 100px 1.4fr 70px 80px 110px", gap: 0, padding: "10px 14px", borderBottom: i < edRequests.length - 1 ? "1px solid #f0f0f0" : "none", alignItems: "center" }}
                >
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                    {r.name}
                  </span>
                  <span style={{ fontSize: 11, color: "#737373" }}>{r.type ?? "—"}</span>
                  <span style={{ fontSize: 12, color: "#525252", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{r.email}</span>
                  <span style={{ fontSize: 12, fontFamily: "var(--font-mono, monospace)", color: "#525252" }}>{r.students_count ?? "—"}</span>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", fontWeight: 700, color: ED_STATUS_COLOR[r.status] ?? "#111111", textTransform: "capitalize" as const }}>
                    {r.status}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono, monospace)", color: "#8a8a8a" }}>
                    {new Date(r.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
