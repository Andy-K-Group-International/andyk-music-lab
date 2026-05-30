"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import ScrollReveal from "@/components/ScrollReveal";
import WaitlistForm, { type WaitlistPlan } from "@/components/WaitlistForm";
import { CURRENCIES, type Currency, convert } from "@/lib/currency";

// ── SVG Icons ────────────────────────────────────────────────────────────────

const IconUpload = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/>
    <line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);
const IconProcess = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
);
const IconDownload = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IconEqualizer = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="2" y="9" width="3.5" height="12" rx="1.75" opacity="0.45"/>
    <rect x="2" y="5" width="3.5" height="3.5" rx="1.75" opacity="0.45"/>
    <rect x="7.5" y="4" width="3.5" height="17" rx="1.75"/>
    <rect x="13" y="7" width="3.5" height="14" rx="1.75" opacity="0.78"/>
    <rect x="18.5" y="2" width="3.5" height="19" rx="1.75" opacity="0.55"/>
  </svg>
);
const IconPulse = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="2,12 5,12 7,5 9,19 11,9 13,15 15,11 17,13 19,12 22,12"/>
  </svg>
);
const IconVinyl = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="5.5"/>
    <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none"/>
    <path d="M12 6.5 A5.5 5.5 0 0 1 17.5 12"/>
  </svg>
);
const IconScales = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="M7 21h10"/>
    <path d="M12 3v18"/>
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
  </svg>
);
const IconMusic = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>
);
const IconMetronome = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="12 3 22 21 2 21"/>
    <line x1="12" y1="8" x2="17" y2="17"/>
    <line x1="8.5" y1="14" x2="15.5" y2="14"/>
  </svg>
);
const IconVolume = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
);
const IconLayers = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/>
    <polyline points="2 17 12 22 22 17"/>
    <polyline points="2 12 12 17 22 12"/>
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IconCPU = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="2"/>
    <rect x="9" y="9" width="6" height="6"/>
    <line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/>
    <line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/>
    <line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/>
    <line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
  </svg>
);
const IconLock = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

// ── Waveform ──────────────────────────────────────────────────────────────────

const WAVE_HEIGHTS = [
  16, 24, 36, 52, 65, 72, 60, 78, 70, 55, 80, 72, 64, 76, 58, 82, 74, 66,
  88, 78, 90, 82, 76, 92, 88, 80, 92, 84, 78, 88, 82, 72, 86, 76, 66, 80,
  70, 60, 74, 62, 52, 68, 56, 44, 58, 40, 28, 18,
];

function HeroWaveform() {
  return (
    <div className="hero-waveform" aria-hidden="true">
      {WAVE_HEIGHTS.map((h, i) => (
        <div key={i} className="hero-wave-bar" style={{ height: `${h}px`, animationDelay: `${((i * 0.075) % 1.8).toFixed(2)}s` }} />
      ))}
    </div>
  );
}

// ── AB heading helper ─────────────────────────────────────────────────────────

function AltHead({ children }: { children: string }) {
  const words = children.split(" ");
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          {i > 0 && " "}
          {i % 2 === 0
            ? <span className="head-word-serif serif-accent">{w}</span>
            : <span className="head-word-bold">{w}</span>}
        </span>
      ))}
    </>
  );
}

// ── Static data ───────────────────────────────────────────────────────────────

const steps = [
  { num: "01", icon: <IconUpload />, title: "Upload Your Track", desc: "Drop your MP3 or WAV. Your audio stays entirely in your browser — 100% private, never sent to any server." },
  { num: "02", icon: <IconProcess />, title: "AI-Powered Processing", desc: "Browser-based DSP engine analyses loudness, applies precision EQ, and masters to industry standards in seconds." },
  { num: "03", icon: <IconDownload />, title: "Compare & Download", desc: "Hear the A/B difference, review LUFS stats, and download your mastered WAV — all within your browser." },
];

const tools: { href: string; icon: React.ReactNode; title: string; desc: string; plan: WaitlistPlan }[] = [
  { href: "/mastering", icon: <IconEqualizer />, title: "Mastering Tool",    plan: "single",  desc: "Normalize to -14 LUFS (Spotify standard), apply EQ, stereo widening, and limit to -0.3 dBTP. Includes A/B waveform compare, presets, and reference track analysis." },
  { href: "/bpm",      icon: <IconPulse />,     title: "BPM + Key Detector", plan: "studio", desc: "Instant BPM via autocorrelation, musical key via Krumhansl-Schmuckler, Camelot wheel, Tap BPM, danceability score, and analysis history." },
  { href: "/planner",          icon: <IconVinyl />,    title: "DJ Set Planner",     plan: "studio", desc: "Drag & drop tracks, auto-sort by Camelot key, visualise energy flow, see transition quality labels, and export your set." },
  { href: "/track-comparator", icon: <IconScales />,   title: "Track Comparator",   plan: "studio", desc: "Upload two tracks and compare waveforms, LUFS levels, and frequency content side-by-side. Spot the mix differences instantly." },
  { href: "/chord-generator",  icon: <IconMusic />,    title: "Chord Generator",    plan: "studio", desc: "Generate chord progressions in any key, explore voicings, and preview how chords sound together — built for producers and songwriters." },
  { href: "/metronome",        icon: <IconMetronome />,title: "Metronome",          plan: "studio", desc: "Precision browser metronome with adjustable BPM, time signatures, accent patterns, and tap tempo — zero latency via Web Audio API." },
  { href: "/loudness-meter",   icon: <IconVolume />,   title: "Loudness Meter",     plan: "studio", desc: "Real-time LUFS, RMS, and true-peak metering in your browser. Measure loudness against Spotify, Apple Music, and YouTube targets." },
  { href: "/stem-splitter",    icon: <IconLayers />,   title: "Stem Splitter",      plan: "pro",    desc: "Separate vocals, drums, bass, and other stems from any track — entirely in the browser. No uploads, no servers, complete privacy." },
];

const stats = [
  { icon: <IconCPU />,   value: "Web Audio API",       desc: "Built on the W3C Web Audio standard — no plugins, no installs, runs natively in every modern browser." },
  { icon: <IconLock />,  value: "100% Client-side",    desc: "Your audio never leaves your device. All DSP processing happens locally — complete privacy guaranteed." },
  { icon: <IconCheck />, value: "Industry Standards",  desc: "Spotify -14 LUFS · Apple Music -16 LUFS · -0.3 dBTP true-peak limit — streaming platforms ready." },
];

const pricing: { name: string; gbpPrice: number; period: string; desc: string; features: string[]; featured: boolean; plan: WaitlistPlan }[] = [
  { name: "Single Session", gbpPrice: 49,  period: "one-time", plan: "single", featured: false, desc: "One professional mastering session for a single track.", features: ["1 track mastered", "-14 LUFS / -0.3 dBTP", "WAV + MP3 download", "24h turnaround"] },
  { name: "Studio Pass",    gbpPrice: 29,  period: "/month",   plan: "studio", featured: false, desc: "For producers releasing regularly.",                     features: ["Unlimited masterings", "BPM + Key detector", "DJ Set Planner", "Priority processing", "Stem separation"] },
  { name: "Pro Pass",       gbpPrice: 199, period: "/year",    plan: "pro",    featured: true,  desc: "Everything in Studio Pass — billed annually.", features: ["All Studio Pass features", "SAVE_VS_MONTHLY", "Early access to new tools", "Label export formats", "Dedicated support"] },
];

// ── Main component ────────────────────────────────────────────────────────────

type Spots = { spots_left: number; total: number; closed: boolean };

export default function HomeClient() {
  const router = useRouter();
  const [waitlistPlan, setWaitlistPlan] = useState<WaitlistPlan>("studio");
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [spots, setSpots] = useState<Spots | null>(null);
  const [currency, setCurrency] = useState<Currency>("GBP");
  const [introMuted, setIntroMuted] = useState(true);
  const [introPlaying, setIntroPlaying] = useState(false);
  const [introProgress, setIntroProgress] = useState(0);
  const [demoPlaying, setDemoPlaying] = useState<"before" | "after" | null>(null);
  const [demoProgress, setDemoProgress] = useState(0);
  const introRef = useRef<HTMLAudioElement | null>(null);
  const beforeAudioRef = useRef<HTMLAudioElement | null>(null);
  const afterAudioRef = useRef<HTMLAudioElement | null>(null);

  // Intro autoplay (muted)
  useEffect(() => {
    const audio = new Audio("/audio/after.mp3");
    audio.loop = true;
    audio.muted = true;
    audio.addEventListener("timeupdate", () => {
      if (audio.duration > 0) setIntroProgress(audio.currentTime / audio.duration);
    });
    audio.play()
      .then(() => setIntroPlaying(true))
      .catch(() => setIntroPlaying(false));
    introRef.current = audio;
    return () => { audio.pause(); };
  }, []);

  // Demo audio setup
  useEffect(() => {
    const before = new Audio("/audio/before.mp3");
    const after  = new Audio("/audio/after.mp3");
    const onUpdate = (e: Event) => {
      const el = e.target as HTMLAudioElement;
      if (el.duration > 0) setDemoProgress(el.currentTime / el.duration);
    };
    const onEnd = () => { setDemoPlaying(null); setDemoProgress(0); };
    before.addEventListener("timeupdate", onUpdate);
    after.addEventListener("timeupdate", onUpdate);
    before.addEventListener("ended", onEnd);
    after.addEventListener("ended", onEnd);
    beforeAudioRef.current = before;
    afterAudioRef.current  = after;
    return () => { before.pause(); after.pause(); };
  }, []);

  const toggleIntroPlay = () => {
    if (!introRef.current) return;
    if (introRef.current.paused) {
      introRef.current.play().catch(() => {});
      setIntroPlaying(true);
    } else {
      introRef.current.pause();
      setIntroPlaying(false);
    }
  };

  const toggleIntroMute = () => {
    if (!introRef.current) return;
    introRef.current.muted = !introRef.current.muted;
    setIntroMuted(introRef.current.muted);
  };

  const playDemo = (track: "before" | "after") => {
    const ref = track === "before" ? beforeAudioRef : afterAudioRef;
    const other = track === "before" ? afterAudioRef : beforeAudioRef;
    other.current?.pause();
    if (demoPlaying === track) {
      ref.current?.pause();
      setDemoPlaying(null);
    } else {
      if (ref.current) { ref.current.currentTime = 0; ref.current.play().catch(() => {}); }
      setDemoProgress(0);
      setDemoPlaying(track);
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("andyk_currency") as Currency;
      if (saved && (CURRENCIES as readonly string[]).includes(saved)) setCurrency(saved);
    } catch { /* ignore */ }
  }, []);

  const handleCurrency = (c: Currency) => {
    setCurrency(c);
    try { localStorage.setItem("andyk_currency", c); } catch { /* ignore */ }
  };

  const fetchSpots = useCallback(async () => {
    try {
      const res = await fetch("/api/spots", { cache: "no-store" });
      if (res.ok) setSpots(await res.json());
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => { fetchSpots(); }, [fetchSpots]);

  const openWaitlist = (plan: WaitlistPlan = "studio") => {
    setWaitlistPlan(plan);
    setWaitlistOpen(true);
  };

  return (
    <div>
      {waitlistOpen && <WaitlistForm initialPlan={waitlistPlan} onClose={() => setWaitlistOpen(false)} onSuccess={fetchSpots} />}

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-bg" />
        <div className="hero-grid-dots" />
        <HeroWaveform />

        <div className="hero-content">
          <ScrollReveal>
            <span className="hero-eyebrow">By Andy&apos;K Group International</span>
          </ScrollReveal>

          <ScrollReveal delay={1}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <Image
                src="/logo-transparent.png"
                alt="Andy'K Music Lab"
                width={180}
                height={180}
              />
            </div>
            <h1 className="hero-title">
              Andy&apos;K<br />
              <span className="serif-accent">Music</span> Lab
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={2}>
            <p className="hero-subtitle">
              Professional audio tools — built by DJ Andy&apos;K
            </p>
          </ScrollReveal>

          <ScrollReveal delay={3}>
            <div className="hero-ctas">
              <button onClick={() => openWaitlist("studio")} className="btn-primary">
                Join Waitlist
                <IconArrow />
              </button>
              <a href="#pricing" className="btn-secondary">
                See Pricing
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12l7 7 7-7"/>
                </svg>
              </a>
            </div>

            <div className="trust-badges">
              <span className="trust-badge"><span className="trust-check">✓</span>Spotify -14 LUFS Ready</span>
              <span className="trust-badge"><span className="trust-check">✓</span>Apple Music Compliant</span>
              <span className="trust-badge"><span className="trust-check">✓</span>100% Browser-Based</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="divider-glow" />

      {/* ── HOW IT WORKS ── */}
      <section className="section-dark py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="section-label">How It Works</span>
              <h2 className="section-heading">
                <AltHead>Three steps to a professional master</AltHead>
              </h2>
              <p className="section-subtext mx-auto">
                Everything runs in your browser — private, fast, and powered by the Web Audio API.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <ScrollReveal key={s.num} delay={(i % 3) as 0 | 1 | 2 | 3}>
                <div className="step-card h-full">
                  <div className="step-number">Step {s.num}</div>
                  <div className="step-icon">{s.icon}</div>
                  <h3 className="step-title">{s.title}</h3>
                  <p className="step-desc">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-glow" />

      {/* ── TOOLS ── */}
      <section id="tools" className="section-surface py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="mb-16">
              <span className="section-label">Tools</span>
              <h2 className="section-heading">
                <AltHead>Everything in one place</AltHead>
              </h2>
              <p className="section-subtext">
                Professional tools for producers and DJs. Browser-native DSP — no plugins.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-6">
            {tools.map((t, i) => (
              <ScrollReveal key={t.href} delay={(i % 3) as 0 | 1 | 2 | 3}>
                <div
                  className="premium-tool-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => router.push(t.href)}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && router.push(t.href)}
                >
                  <div className="premium-tool-icon">{t.icon}</div>
                  <span className="premium-tool-badge">Account Required</span>
                  <h3 className="premium-tool-name">{t.title}</h3>
                  <p className="premium-tool-desc">{t.desc}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); openWaitlist(t.plan); }}
                    className="try-free-btn"
                    style={{ cursor: "pointer", background: "none", border: "none", padding: 0, font: "inherit" }}
                  >
                    Join Waitlist <IconArrow />
                  </button>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-glow" />

      {/* ── STATS ── */}
      <section className="stats-strip">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {stats.map((s, i) => (
              <ScrollReveal key={i} delay={(i % 3) as 0 | 1 | 2 | 3} className="px-8 py-6 md:py-0">
                <div className="stat-item">
                  <div className="stat-item-icon">{s.icon}</div>
                  <div className="stat-item-value">{s.value}</div>
                  <p className="stat-item-desc">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-glow" />

      {/* ── MASTERING DEMO ── */}
      <section className="section-surface py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(0,0,0,0.38)" }}>
              Mastering Demo
            </span>
            <h2 className="section-heading mt-3 mb-10">
              Hear the <span className="serif-accent">difference</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <style>{`
              @keyframes demoBar {
                0%   { transform: scaleY(0.2); }
                100% { transform: scaleY(1); }
              }
            `}</style>
            <div style={{ display: "flex", gap: 24, justifyContent: "center", marginBottom: 20, flexWrap: "wrap" }}>
              {(["before", "after"] as const).map(track => {
                const active = demoPlaying === track;
                const BAR_SCALES = [0.55, 0.9, 0.65, 1, 0.45, 0.8, 0.6, 0.95, 0.7, 0.5, 0.85, 0.75];
                return (
                  <div key={track} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                    <button
                      onClick={() => playDemo(track)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "14px 32px", borderRadius: 0,
                        fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700,
                        letterSpacing: "0.12em", textTransform: "uppercase",
                        background: active ? "#111111" : "transparent",
                        color: active ? "#ffffff" : "#111111",
                        border: "1.5px solid #111111",
                        cursor: "pointer", transition: "background 0.15s ease, color 0.15s ease",
                        minWidth: 140,
                      }}
                    >
                      <span style={{ fontSize: 13 }}>{active ? "■" : "▶"}</span>
                      {track === "before" ? "Before" : "After"}
                    </button>
                    {/* Waveform bars */}
                    <div style={{ display: "flex", gap: 3, alignItems: "center", height: 28 }}>
                      {BAR_SCALES.map((s, i) => (
                        <div
                          key={i}
                          style={{
                            width: 3,
                            height: 28,
                            background: "#111111",
                            borderRadius: 1,
                            transform: `scaleY(${active ? s : 0.25})`,
                            animation: active
                              ? `demoBar ${0.45 + (i % 4) * 0.12}s ease-in-out ${(i * 0.06).toFixed(2)}s infinite alternate`
                              : "none",
                            transition: active ? "none" : "transform 0.4s ease",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ height: 1, background: "rgba(0,0,0,0.1)", maxWidth: 380, margin: "0 auto 10px", overflow: "hidden" }}>
              <div style={{ height: "100%", background: "#111111", width: `${demoProgress * 100}%`, transition: "width 0.15s linear" }} />
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(0,0,0,0.3)", margin: 0, minHeight: 16 }}>
              {demoPlaying === "before" ? "Playing: Unmastered" : demoPlaying === "after" ? "Playing: Mastered — −14 LUFS" : ""}
            </p>
          </ScrollReveal>
        </div>
      </section>

      <div className="divider-glow" />

      {/* ── PRICING ── */}
      <section id="pricing" className="section-dark py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <span className="section-label">Pricing</span>
              <h2 className="section-heading">
                <AltHead>Simple transparent pricing</AltHead>
              </h2>
              <p className="section-subtext mx-auto">
                Join the waitlist for early access. Payments via Stripe — coming soon.
              </p>
            </div>
          </ScrollReveal>

          {/* Currency selector */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div style={{
              display: "inline-flex", gap: 0,
              background: "#ffffff",
              border: "1px solid #111111",
              overflow: "hidden",
            }}>
              {CURRENCIES.map(c => (
                <button
                  key={c}
                  onClick={() => handleCurrency(c)}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 0,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    border: "none",
                    borderRight: c !== "PYG" ? "1px solid #111111" : "none",
                    background: currency === c ? "#111111" : "transparent",
                    color: currency === c ? "#ffffff" : "#111111",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {spots && (
            <div style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              padding: "14px 24px",
              marginBottom: 32,
              textAlign: "center",
            }}>
              {spots.closed ? (
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", margin: 0 }}>
                  Early access closed — join waitlist for next round
                </p>
              ) : (
                <>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.85)", margin: "0 0 4px 0" }}>
                    EARLY ACCESS — First 40 members get 40% off the yearly plan
                  </p>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", color: spots.spots_left <= 5 ? "#f87171" : "rgba(255,255,255,0.45)", margin: 0 }}>
                    {spots.spots_left} spot{spots.spots_left === 1 ? "" : "s"} remaining
                  </p>
                </>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {pricing.map((plan, i) => (
              <ScrollReveal key={plan.name} delay={(i % 3) as 0 | 1 | 2 | 3}>
                <div className={`pricing-card h-full ${plan.featured ? "featured" : ""}`}>
                  {plan.featured && <span className="pricing-badge">Most Popular</span>}
                  <div className="mb-2">
                    {plan.plan === "pro" && spots && !spots.closed ? (
                      <>
                        <span className="pricing-price" style={{ textDecoration: "line-through", opacity: 0.45, fontSize: "1.1rem" }}>{convert(plan.gbpPrice, currency)}</span>
                        <span className="pricing-price" style={{ marginLeft: 8 }}>{convert(119, currency)}</span>
                        <span className="pricing-period">{plan.period}</span>
                        <span style={{ marginLeft: 10, padding: "2px 8px", borderRadius: 6, background: "#16a34a", color: "#fff", fontSize: 10, fontFamily: "var(--font-mono)", fontWeight: 700, letterSpacing: "0.08em", verticalAlign: "middle" }}>40% OFF</span>
                      </>
                    ) : (
                      <>
                        <span className="pricing-price">{convert(plan.gbpPrice, currency)}</span>
                        <span className="pricing-period">{plan.period}</span>
                      </>
                    )}
                  </div>
                  <div className="pricing-name">{plan.name}</div>
                  <p className="pricing-desc">{plan.desc}</p>
                  <div className="pricing-features">
                    {plan.features.map((f) => (
                      <div key={f} className="pricing-feature">
                        <span className="pricing-check">✓</span>
                        <span>{f === "SAVE_VS_MONTHLY" ? `Save ${convert(149, currency)} vs monthly` : f}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => openWaitlist(plan.plan)}
                    className={`pricing-cta ${plan.featured ? "pricing-cta-featured" : "pricing-cta-default"}`}
                    style={{ cursor: "pointer", opacity: 1 }}
                  >
                    Join Waitlist →
                  </button>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <p className="text-center text-xs mt-8" style={{ color: "rgba(255,255,255,0.2)" }}>
              Payments powered by Stripe — coming soon. Join the waitlist to get early access.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── INTRO AUDIO BAR ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9000,
        background: "#111111",
        fontFamily: "var(--font-mono)",
      }}>
        {/* Progress line */}
        <div style={{ height: 2, background: "rgba(255,255,255,0.08)", width: "100%" }}>
          <div style={{ height: "100%", background: "rgba(255,255,255,0.35)", width: `${introProgress * 100}%`, transition: "width 0.2s linear" }} />
        </div>
        {/* Controls row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px" }}>
          <span style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
            ♪ LAB — INTRO
          </span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              onClick={toggleIntroPlay}
              style={{
                background: "none", border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 0, padding: "3px 11px",
                fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em", color: "rgba(255,255,255,0.7)",
                cursor: "pointer", transition: "color 0.15s ease",
              }}
            >
              {introPlaying ? "■" : "▶"}
            </button>
            <button
              onClick={toggleIntroMute}
              style={{
                background: "none", border: "1px solid rgba(255,255,255,0.18)",
                borderRadius: 0, padding: "3px 11px",
                fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: introMuted ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.85)",
                cursor: "pointer", transition: "color 0.15s ease",
              }}
            >
              {introMuted ? "Muted" : "Live"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
