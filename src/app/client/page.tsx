import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const ALL_TOOLS = [
  { href: "/mastering",        name: "Mastering Tool",     toolName: "mastering" },
  { href: "/bpm",              name: "BPM + Key Detector", toolName: "bpm" },
  { href: "/planner",          name: "DJ Set Planner",     toolName: "planner" },
  { href: "/track-comparator", name: "Track Comparator",   toolName: "track-comparator" },
  { href: "/chord-generator",  name: "Chord Generator",    toolName: "chord-generator" },
  { href: "/metronome",        name: "Metronome",          toolName: "metronome" },
  { href: "/loudness-meter",   name: "Loudness Meter",     toolName: "loudness-meter" },
  { href: "/stem-splitter",    name: "Stem Splitter",      toolName: "stem-splitter" },
];

const PLAN_LABEL: Record<string, string> = {
  single:          "Single Session",
  studio:          "Studio Pass",
  pro:             "Pro Pass",
  tool_mastering:  "Mastering Access",
  tool_bpm:        "BPM + Key Access",
  tool_planner:    "DJ Planner Access",
  tool_comparator: "Track Comparator Access",
  tool_chord:      "Chord Generator Access",
  tool_metronome:  "Metronome Access",
  tool_loudness:   "Loudness Meter Access",
  tool_stems:      "Stem Splitter Access",
};

export default async function ClientPage({
  searchParams,
}: {
  searchParams: Promise<{ upgrade?: string; expired?: string; payment?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profileResult, toolAccessResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, plan, plan_expires_at, subscription_status")
      .eq("id", user.id)
      .single(),
    supabase
      .from("tool_access")
      .select("tool_name, expires_at")
      .eq("user_id", user.id),
  ]);

  const profile = profileResult.data;
  const plan = profile?.plan as string | null;
  const displayName = profile?.full_name || user.email?.split("@")[0] || "there";
  const initials = (profile?.full_name || user.email || "?")
    .split(/\s+/)
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Derive accessible tools from tool_access table — works for all plan types
  const now = new Date().toISOString();
  const isAdmin = user.email === "ceo@andykgroup.com";
  const activeToolNames = new Set(
    isAdmin
      ? ALL_TOOLS.map(t => t.toolName)
      : (toolAccessResult.data ?? [])
          .filter(t => !t.expires_at || t.expires_at > now)
          .map(t => t.tool_name)
  );
  const accessibleTools = ALL_TOOLS.filter(t => activeToolNames.has(t.toolName));

  // Plan badge: use profile plan, falling back to number of active tools for display
  const planBadge = plan ? (PLAN_LABEL[plan] ?? plan) : null;

  async function logout() {
    "use server";
    const { createClient: serverCreate } = await import("@/lib/supabase/server");
    const sb = await serverCreate();
    await sb.auth.signOut();
    redirect("/");
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#f5f5f5" }}>
      {/* Header strip */}
      <div style={{ background: "#111111", padding: "32px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700, color: "#111111" }}>{initials}</span>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", margin: "0 0 4px" }}>
                My Lab
              </p>
              <h1 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(1.1rem,2.5vw,1.4rem)", fontWeight: 700, color: "#ffffff", margin: 0, lineHeight: 1.2 }}>
                Welcome, {displayName}
              </h1>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {planBadge ? (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#111111", background: "#ffffff", padding: "4px 10px" }}>
                {planBadge}
              </span>
            ) : activeToolNames.size > 0 ? (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#111111", background: "#ffffff", padding: "4px 10px" }}>
                {activeToolNames.size} {activeToolNames.size === 1 ? "Tool" : "Tools"} Active
              </span>
            ) : (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.15)", padding: "4px 10px" }}>
                No Active Plan
              </span>
            )}
            <form action={logout}>
              <button type="submit" style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", background: "none", border: "1px solid rgba(255,255,255,0.15)", padding: "5px 12px", cursor: "pointer" }}>
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
        {/* Status banners */}
        {params.upgrade === "1" && (
          <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", padding: "14px 20px", marginBottom: 24, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#111111" }}>
            This tool requires an upgraded plan.{" "}
            <Link href="/#pricing" style={{ color: "#111111", textDecoration: "underline" }}>View plans →</Link>
          </div>
        )}
        {params.expired === "1" && (
          <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", padding: "14px 20px", marginBottom: 24, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#111111" }}>
            Your plan has expired.{" "}
            <Link href="/#pricing" style={{ color: "#111111", textDecoration: "underline" }}>Renew →</Link>
          </div>
        )}
        {params.payment === "success" && (
          <div style={{ background: "#111111", padding: "14px 20px", marginBottom: 24, fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#ffffff" }}>
            Payment received — your access is now active. Welcome to Andy&apos;K Music Lab.
          </div>
        )}

        {/* Tools section */}
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#8a8a8a", marginBottom: 20 }}>
          Your Tools
        </p>

        {accessibleTools.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 1, background: "#e5e5e5" }}>
            {accessibleTools.map(tool => (
              <Link
                key={tool.href}
                href={tool.href}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 24px", background: "#ffffff", textDecoration: "none", gap: 12 }}
              >
                <span style={{ fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "#111111" }}>
                  {tool.name}
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8a8a8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", padding: "40px 24px", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, color: "#525252", marginBottom: 8 }}>
              No active plan — get access to start using the tools.
            </p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#a3a3a3", marginBottom: 24 }}>
              Already paid? Make sure you registered with the same email used at checkout.
            </p>
            <Link
              href="/#pricing"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", background: "#111111", color: "#ffffff", fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}
            >
              Get Access →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
