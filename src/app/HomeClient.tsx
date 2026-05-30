"use client";

import { useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import WaitlistForm, { type WaitlistPlan } from "@/components/WaitlistForm";

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
  { href: "/planner",  icon: <IconVinyl />,     title: "DJ Set Planner",     plan: "studio", desc: "Drag & drop tracks, auto-sort by Camelot key, visualise energy flow, see transition quality labels, and export your set." },
];

const stats = [
  { icon: <IconCPU />,   value: "Web Audio API",       desc: "Built on the W3C Web Audio standard — no plugins, no installs, runs natively in every modern browser." },
  { icon: <IconLock />,  value: "100% Client-side",    desc: "Your audio never leaves your device. All DSP processing happens locally — complete privacy guaranteed." },
  { icon: <IconCheck />, value: "Industry Standards",  desc: "Spotify -14 LUFS · Apple Music -16 LUFS · -0.3 dBTP true-peak limit — streaming platforms ready." },
];

const pricing: { name: string; price: string; period: string; desc: string; features: string[]; featured: boolean; plan: WaitlistPlan }[] = [
  { name: "Single Session", price: "£49",  period: "one-time", plan: "single", featured: false, desc: "One professional mastering session for a single track.", features: ["1 track mastered", "-14 LUFS / -0.3 dBTP", "WAV + MP3 download", "24h turnaround"] },
  { name: "Studio Pass",    price: "£29",  period: "/month",   plan: "studio", featured: false, desc: "For producers releasing regularly.",                     features: ["Unlimited masterings", "BPM + Key detector", "DJ Set Planner", "Priority processing", "Stem separation"] },
  { name: "Pro Pass",       price: "£199", period: "/year",    plan: "pro",    featured: true,  desc: "Everything in Studio Pass — billed annually, save £149.", features: ["All Studio Pass features", "Save £149 vs monthly", "Early access to new tools", "Label export formats", "Dedicated support"] },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function HomeClient() {
  const [waitlistPlan, setWaitlistPlan] = useState<WaitlistPlan>("studio");
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  const openWaitlist = (plan: WaitlistPlan = "studio") => {
    setWaitlistPlan(plan);
    setWaitlistOpen(true);
  };

  return (
    <div>
      {waitlistOpen && <WaitlistForm initialPlan={waitlistPlan} onClose={() => setWaitlistOpen(false)} />}

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
                <div className="premium-tool-card" style={{ cursor: "default" }}>
                  <div className="premium-tool-icon">{t.icon}</div>
                  <span className="premium-tool-badge">Account Required</span>
                  <h3 className="premium-tool-name">{t.title}</h3>
                  <p className="premium-tool-desc">{t.desc}</p>
                  <button
                    onClick={() => openWaitlist(t.plan)}
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

          <div className="grid md:grid-cols-3 gap-6 items-stretch">
            {pricing.map((plan, i) => (
              <ScrollReveal key={plan.name} delay={(i % 3) as 0 | 1 | 2 | 3}>
                <div className={`pricing-card h-full ${plan.featured ? "featured" : ""}`}>
                  {plan.featured && <span className="pricing-badge">Most Popular</span>}
                  <div className="mb-2">
                    <span className="pricing-price">{plan.price}</span>
                    <span className="pricing-period">{plan.period}</span>
                  </div>
                  <div className="pricing-name">{plan.name}</div>
                  <p className="pricing-desc">{plan.desc}</p>
                  <div className="pricing-features">
                    {plan.features.map((f) => (
                      <div key={f} className="pricing-feature">
                        <span className="pricing-check">✓</span>
                        <span>{f}</span>
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
    </div>
  );
}
