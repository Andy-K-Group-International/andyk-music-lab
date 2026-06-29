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
  { href: "/audio-converter",  name: "Audio Converter",    toolName: "audio-converter" },
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

const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
const sans: React.CSSProperties = { fontFamily: "var(--font-sans)" };
const label10: React.CSSProperties = { ...mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#a3a3a3", margin: 0 };

function MasteringPreview() {
  const bars = [35, 60, 25, 75, 45, 80, 30, 90, 50, 65, 40, 70];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 48 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}%`, background: "#111111", minWidth: 0 }} />
        ))}
      </div>
      <p style={{ ...label10, marginTop: 8 }}>WAVEFORM</p>
    </div>
  );
}

function BPMPreview() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ ...mono, fontSize: 28, fontWeight: 700, color: "#111111", lineHeight: 1 }}>124.00</span>
        <span style={{ ...label10 }}>BPM</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
        <span style={{ ...label10 }}>KEY</span>
        <span style={{ ...mono, fontSize: 11, fontWeight: 700, color: "#111111" }}>7A F#m</span>
      </div>
      <div style={{ position: "relative", width: 24, height: 24, border: "1.5px solid #e5e5e5", borderRadius: "50%", marginTop: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", top: 3, right: 3, width: 5, height: 5, background: "#111111", borderRadius: "50%" }} />
      </div>
    </div>
  );
}

function PlannerPreview() {
  return (
    <div>
      <p style={{ ...label10, marginBottom: 14 }}>TRANSITION</p>
      <div style={{ position: "relative", height: 2, background: "#e5e5e5" }}>
        <div style={{ position: "absolute", left: "40%", top: "50%", transform: "translate(-50%, -50%)", width: 10, height: 10, background: "#111111" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        <span style={{ ...mono, fontSize: 8, color: "#a3a3a3" }}>A</span>
        <span style={{ ...mono, fontSize: 8, color: "#a3a3a3" }}>B</span>
      </div>
    </div>
  );
}

function ComparatorPreview() {
  const barsA = [30, 70, 40, 85, 50, 60, 35, 75];
  const barsB = [50, 40, 80, 35, 65, 75, 45, 60];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div>
        <span style={{ ...label10 }}>TRACK A</span>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2.5, height: 20, marginTop: 4 }}>
          {barsA.map((h, i) => <div key={i} style={{ width: 5, height: `${h}%`, background: "#111111" }} />)}
        </div>
      </div>
      <div>
        <span style={{ ...label10 }}>TRACK B</span>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2.5, height: 20, marginTop: 4 }}>
          {barsB.map((h, i) => <div key={i} style={{ width: 5, height: `${h}%`, background: "#a3a3a3" }} />)}
        </div>
      </div>
    </div>
  );
}

function ChordPreview() {
  const blackKeyPositions = [10, 26, 58, 74, 90];
  return (
    <div>
      <div style={{ position: "relative", display: "flex", gap: 2, height: 44 }}>
        {[0,1,2,3,4,5,6].map(i => (
          <div key={i} style={{ width: 14, height: 44, background: "#ffffff", border: "1px solid #e5e5e5", flexShrink: 0 }} />
        ))}
        {blackKeyPositions.map((left, i) => (
          <div key={i} style={{ position: "absolute", left, top: 0, width: 9, height: 28, background: "#111111" }} />
        ))}
      </div>
      <p style={{ ...label10, marginTop: 8 }}>KEY 7A F#m</p>
    </div>
  );
}

function MetronomePreview() {
  return (
    <div>
      <div style={{ position: "relative", width: 48, height: 48, border: "2px solid #e5e5e5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 5, height: 5, background: "#111111", borderRadius: "50%" }} />
        <div style={{ position: "absolute", top: 5, left: "50%", transform: "translateX(-50%)", width: 2, height: 7, background: "#a3a3a3" }} />
      </div>
      <p style={{ ...label10, marginTop: 8 }}>BPM 124</p>
    </div>
  );
}

function LoudnessPreview() {
  return (
    <div>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 48 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ width: 14, height: 40, background: "#111111" }} />
          <span style={{ ...mono, fontSize: 8, color: "#a3a3a3" }}>L</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <div style={{ width: 14, height: 28, background: "#a3a3a3" }} />
          <span style={{ ...mono, fontSize: 8, color: "#a3a3a3" }}>R</span>
        </div>
      </div>
      <p style={{ ...label10, marginTop: 8 }}>INTEGRATED</p>
      <p style={{ ...mono, fontSize: 13, fontWeight: 700, color: "#111111", margin: "3px 0 0" }}>-13.2 LUFS</p>
    </div>
  );
}

function AudioConverterPreview() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ ...mono, fontSize: 10, fontWeight: 700, color: "#111111", border: "1px solid #e5e5e5", padding: "3px 7px" }}>MP3</span>
        <span style={{ ...mono, fontSize: 10, color: "#a3a3a3" }}>→</span>
        <span style={{ ...mono, fontSize: 10, fontWeight: 700, color: "#111111", border: "1px solid #e5e5e5", padding: "3px 7px" }}>WAV</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
        <span style={{ ...mono, fontSize: 10, fontWeight: 700, color: "#a3a3a3", border: "1px solid #e5e5e5", padding: "3px 7px" }}>FLAC</span>
        <span style={{ ...mono, fontSize: 10, color: "#a3a3a3" }}>→</span>
        <span style={{ ...mono, fontSize: 10, fontWeight: 700, color: "#a3a3a3", border: "1px solid #e5e5e5", padding: "3px 7px" }}>MP3</span>
      </div>
      <p style={{ ...label10, marginTop: 10 }}>FORMAT CONVERSION</p>
    </div>
  );
}

function StemPreview() {
  const faders: { label: string; h: number }[] = [
    { label: "VOC", h: 70 },
    { label: "DRM", h: 85 },
    { label: "BAS", h: 55 },
    { label: "OTH", h: 40 },
  ];
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
      {faders.map(({ label, h }) => (
        <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ position: "relative", width: 2, height: 52, background: "#e5e5e5" }}>
            <div style={{ position: "absolute", left: -4, top: `${100 - h}%`, width: 10, height: 4, background: "#111111" }} />
          </div>
          <span style={{ ...mono, fontSize: 7, letterSpacing: "0.08em", color: "#a3a3a3", marginTop: 5 }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

const TOOL_META: Record<string, { preview: React.ReactNode; subtitle: string }> = {
  "mastering":       { preview: <MasteringPreview />, subtitle: "FINALIZE YOUR SOUND" },
  "bpm":             { preview: <BPMPreview />,       subtitle: "" },
  "planner":         { preview: <PlannerPreview />,   subtitle: "PLAN YOUR SETS" },
  "track-comparator":{ preview: <ComparatorPreview />,subtitle: "COMPARE TRACKS" },
  "chord-generator": { preview: <ChordPreview />,     subtitle: "FIND CHORDS" },
  "metronome":       { preview: <MetronomePreview />, subtitle: "STAY IN TIME" },
  "loudness-meter":  { preview: <LoudnessPreview />,  subtitle: "" },
  "stem-splitter":   { preview: <StemPreview />,            subtitle: "SPLIT YOUR TRACKS" },
  "audio-converter": { preview: <AudioConverterPreview />, subtitle: "CONVERT FORMAT" },
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

  const now = new Date().toISOString();
  const isAdmin = user.email === "ceo@andykgroup.com";
  const activeToolNames = new Set(
    isAdmin
      ? ALL_TOOLS.map(t => t.toolName)
      : (toolAccessResult.data ?? [])
          .filter(t => !t.expires_at || t.expires_at > now)
          .map(t => t.tool_name)
  );

  const planBadge = plan ? (PLAN_LABEL[plan] ?? plan) : null;
  const toolCount = activeToolNames.size;
  const hasAnyAccess = toolCount > 0;

  async function logout() {
    "use server";
    const { createClient: serverCreate } = await import("@/lib/supabase/server");
    const sb = await serverCreate();
    await sb.auth.signOut();
    redirect("/");
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#f5f5f5" }}>

      {/* ── Black header bar ── */}
      <div style={{ background: "#111111", padding: "24px 0" }}>
        <div style={{
          maxWidth: 1080, margin: "0 auto", padding: "0 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
        }}>
          {/* Left */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ ...mono, fontSize: 13, fontWeight: 700, color: "#111111" }}>{initials}</span>
            </div>
            <div>
              <p style={{ ...mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: "0 0 3px" }}>
                MY LAB
              </p>
              <p style={{ ...mono, fontSize: 13, fontWeight: 700, color: "#ffffff", margin: 0 }}>
                Welcome, {displayName}
              </p>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {planBadge ? (
              <span style={{ ...mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#111111", background: "#ffffff", padding: "4px 10px" }}>
                {planBadge}
              </span>
            ) : hasAnyAccess ? (
              <span style={{ ...mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#111111", background: "#ffffff", padding: "4px 10px" }}>
                {toolCount} {toolCount === 1 ? "TOOL" : "TOOLS"} ACTIVE
              </span>
            ) : (
              <span style={{ ...mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.15)", padding: "4px 10px" }}>
                NO ACTIVE PLAN
              </span>
            )}
            <form action={logout}>
              <button type="submit" style={{ ...mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", background: "none", border: "1px solid rgba(255,255,255,0.2)", padding: "5px 12px", cursor: "pointer" }}>
                SIGN OUT
              </button>
            </form>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 24px" }}>

        {/* ── Status banners ── */}
        {params.upgrade === "1" && (
          <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", padding: "12px 18px", marginBottom: 24, ...mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#111111" }}>
            This tool requires an upgraded plan.{" "}
            <Link href="/#pricing" style={{ color: "#111111", textDecoration: "underline" }}>View plans →</Link>
          </div>
        )}
        {params.expired === "1" && (
          <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", padding: "12px 18px", marginBottom: 24, ...mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#111111" }}>
            Your plan has expired.{" "}
            <Link href="/#pricing" style={{ color: "#111111", textDecoration: "underline" }}>Renew →</Link>
          </div>
        )}
        {params.payment === "success" && (
          <div style={{ background: "#111111", padding: "12px 18px", marginBottom: 24, ...mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#ffffff" }}>
            Payment received — your access is now active. Welcome to Andy&apos;K Music Lab.
          </div>
        )}

        {/* ── Section label ── */}
        <p style={{ ...mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#a3a3a3", marginBottom: 20 }}>
          YOUR TOOLS
        </p>

        {/* ── No plan state ── */}
        {!hasAnyAccess ? (
          <div style={{ background: "#ffffff", border: "1px solid #e5e5e5", padding: "56px 24px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
            <p style={{ ...mono, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#111111", marginBottom: 8 }}>
              No active plan found.
            </p>
            <p style={{ ...sans, fontSize: 13, color: "#a3a3a3", marginBottom: 28 }}>
              Already paid? Make sure you registered with the same email used at checkout.
            </p>
            <Link
              href="/#pricing"
              style={{ display: "inline-block", padding: "12px 28px", background: "#111111", color: "#ffffff", ...mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", textDecoration: "none" }}
            >
              Get Access →
            </Link>
          </div>
        ) : (
          /* ── Tools grid ── */
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
            gap: 0,
            background: "#e5e5e5",
            border: "1px solid #e5e5e5",
          }}>
            {ALL_TOOLS.map(tool => {
              const accessible = activeToolNames.has(tool.toolName);
              const meta = TOOL_META[tool.toolName];
              return (
                <div
                  key={tool.href}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #e5e5e5",
                    display: "flex",
                    flexDirection: "column",
                    opacity: accessible ? 1 : 0.45,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                    position: "relative",
                  }}
                >
                  {/* Lock badge */}
                  {!accessible && (
                    <div style={{ position: "absolute", top: 12, right: 12, ...mono, fontSize: 14, color: "#a3a3a3" }}>
                      &#x1F512;
                    </div>
                  )}

                  {/* Hardware preview */}
                  <div style={{ padding: "22px 22px 14px", flex: 1, minHeight: 100 }}>
                    {meta?.preview}
                  </div>

                  {/* Card footer */}
                  <div style={{ borderTop: "1px solid #e5e5e5", padding: "14px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <p style={{ ...sans, fontSize: 13, fontWeight: 600, color: "#111111", margin: "0 0 2px" }}>
                        {tool.name}
                      </p>
                      {meta?.subtitle && (
                        <p style={{ ...mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", color: "#a3a3a3", margin: 0 }}>
                          {meta.subtitle}
                        </p>
                      )}
                    </div>
                    {accessible ? (
                      <Link
                        href={tool.href}
                        style={{ display: "inline-block", padding: "7px 14px", background: "#111111", color: "#ffffff", ...mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap" }}
                      >
                        ACCESS TOOL →
                      </Link>
                    ) : (
                      <Link
                        href="/#pricing"
                        style={{ display: "inline-block", padding: "7px 14px", background: "transparent", color: "#111111", border: "1px solid #e5e5e5", ...mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none", flexShrink: 0, whiteSpace: "nowrap" }}
                      >
                        UPGRADE →
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Privacy footer note */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 24px 40px" }}>
        <p style={{ ...mono, fontSize: 10, color: "#737373", lineHeight: 1.7, margin: 0 }}>
          Your account, plan and tool access are managed using the email address connected to your payment or access code. For details about how we process personal data, please see our{" "}
          <Link href="/privacy-policy" style={{ color: "#737373", textDecoration: "underline" }}>Privacy Policy</Link>.
        </p>
      </div>

    </div>
  );
}
