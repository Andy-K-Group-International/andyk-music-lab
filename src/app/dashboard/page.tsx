"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

const ADMIN_KEY = "andyk_lab_admin";

const TOOLS = [
  { name: "BPM + Key Detector", desc: "Instant BPM via autocorrelation, musical key, Camelot wheel code, and danceability score.", href: "/bpm" },
  { name: "Mastering Tool",      desc: "Normalize to −14 LUFS, precision EQ, stereo widening, and true-peak limiting.",           href: "/mastering" },
  { name: "DJ Set Planner",      desc: "Build harmonically perfect sets using the Camelot Wheel with transition analysis.",        href: "/planner" },
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

  useEffect(() => {
    try {
      if (localStorage.getItem(ADMIN_KEY) !== "true") { router.replace("/admin"); return; }
    } catch {}
    setReady(true);
  }, [router]);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist");
      if (res.ok) { const { entries: e } = await res.json(); setEntries(e ?? []); }
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (ready) fetchEntries(); }, [ready, fetchEntries]);

  function logout() {
    try { localStorage.removeItem(ADMIN_KEY); } catch {}
    router.replace("/admin");
  }

  async function notifyOne(id: string) {
    setNotifyingId(id);
    try {
      const res = await fetch(`/api/waitlist/${id}`, { method: "POST" });
      if (res.ok) setEntries(prev => prev.map(e => e.id === id ? { ...e, notified: true } : e));
    } finally { setNotifyingId(null); }
  }

  async function notifyAll() {
    setNotifyingAll(true);
    setNotifyAllResult(null);
    try {
      const res = await fetch("/api/waitlist/notify-all", { method: "POST" });
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
      </div>
    </div>
  );
}
