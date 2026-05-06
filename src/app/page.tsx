import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Andy'K Music Lab — Professional tools for producers and DJs",
};

const IconEqualizer = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="2" y="9" width="3.5" height="12" rx="1.75" opacity="0.45"/>
    <rect x="2" y="5" width="3.5" height="3.5" rx="1.75" opacity="0.45"/>
    <rect x="7.5" y="4" width="3.5" height="17" rx="1.75"/>
    <rect x="13" y="7" width="3.5" height="14" rx="1.75" opacity="0.75"/>
    <rect x="18.5" y="2" width="3.5" height="19" rx="1.75" opacity="0.55"/>
  </svg>
);

const IconPulse = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="2,12 5,12 7,5 9,19 11,9 13,15 15,11 17,13 19,12 22,12"/>
  </svg>
);

const IconVinyl = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="5.5"/>
    <circle cx="12" cy="12" r="1.8" fill="currentColor" stroke="none"/>
    <path d="M12 6.5 A5.5 5.5 0 0 1 17.5 12"/>
  </svg>
);

const tools = [
  {
    href: "/mastering",
    icon: <IconEqualizer />,
    title: "Mastering Tool",
    description:
      "Upload your track and get a professional master — loudness normalization to -14 LUFS, EQ, and true-peak limiting.",
    badge: "Demo free",
  },
  {
    href: "/bpm",
    icon: <IconPulse />,
    title: "BPM + Key Detector",
    description:
      "Instant BPM and musical key analysis from MP3 or WAV. Energy level detection included.",
    badge: "Free",
  },
  {
    href: "/planner",
    icon: <IconVinyl />,
    title: "DJ Set Planner",
    description:
      "Build harmonically coherent playlists using the Camelot Wheel. Perfect transitions every time.",
    badge: "Free",
  },
];

const pricing = [
  {
    name: "Single Session",
    price: "£49",
    period: "one-time",
    description: "One mastering session for a single track.",
    features: ["1 track mastered", "-14 LUFS / -0.3 dBTP", "WAV download", "24h turnaround"],
    highlight: false,
    cta: "Buy Session",
  },
  {
    name: "Studio Pass",
    price: "£19",
    period: "/month",
    description: "For producers releasing regularly.",
    features: [
      "Unlimited masterings",
      "BPM + Key detector",
      "DJ Set Planner",
      "Priority processing",
      "Stem separation (soon)",
    ],
    highlight: true,
    cta: "Start Studio Pass",
  },
  {
    name: "Pro Pass",
    price: "£149",
    period: "/year",
    description: "Everything in Studio Pass, billed annually.",
    features: [
      "All Studio Pass features",
      "Save £79 vs monthly",
      "Early access to new tools",
      "Label export formats",
    ],
    highlight: false,
    cta: "Start Pro Pass",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-36 px-6">
        <div className="hero-gradient" />
        <div className="hero-glow" />
        <div className="cartesian-grid" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <span className="inline-block font-mono text-xs tracking-widest text-[var(--color-highlight)] uppercase mb-6 px-3 py-1 rounded-full border border-[var(--color-highlight)]/30 bg-[var(--color-soft-green)]">
            By Andy&apos;K Group International
          </span>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-[var(--color-foreground)] mt-2 mb-6 gradient-text leading-[1.05]">
            Andy&apos;K<br className="hidden md:block"/>Music Lab
          </h1>
          <p className="text-xl md:text-2xl text-[var(--color-muted)] max-w-2xl mx-auto leading-relaxed mb-10">
            Professional audio tools for producers and DJs — master tracks, detect BPM &amp; key, plan harmonically perfect sets. All in the browser.
          </p>

          {/* Stat pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <span className="stat-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20,6 9,17 4,12"/></svg>
              3 professional tools
            </span>
            <span className="stat-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              100% browser-local
            </span>
            <span className="stat-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              No sign-up required
            </span>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {tools.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-deep-teal)] text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-[var(--color-deep-teal)]/20"
              >
                {t.title}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tools grid */}
      <section className="max-w-6xl mx-auto px-6 py-16 section-with-glass">
        <div className="tron-line mb-12" />
        <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">Tools</h2>
        <p className="text-[var(--color-muted)] mb-10">Everything you need, right in the browser.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {tools.map((t) => (
            <Link key={t.href} href={t.href} className="group">
              <div className="glass-card rounded-2xl p-7 h-full flex flex-col">
                <div className="tool-icon mb-5">
                  {t.icon}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-[var(--color-foreground)]">{t.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-soft-green)] text-[var(--color-deep-teal)] font-medium">
                    {t.badge}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed flex-1">
                  {t.description}
                </p>
                <div className="mt-5 flex items-center gap-1.5 text-sm text-[var(--color-highlight)] font-medium group-hover:gap-3 transition-all duration-200">
                  Open tool
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="tron-line mb-12" />
        <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">Pricing</h2>
        <p className="text-[var(--color-muted)] mb-10">
          Start free, upgrade when you&apos;re ready.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {pricing.map((plan) => (
            <div
              key={plan.name}
              className={`glass-card rounded-2xl p-7 flex flex-col ${
                plan.highlight ? "ring-2 ring-[var(--color-highlight)]" : ""
              }`}
            >
              {plan.highlight && (
                <span className="inline-block text-xs font-mono font-bold tracking-widest text-[var(--color-deep-teal)] uppercase mb-3">
                  Most popular
                </span>
              )}
              <div className="mb-1">
                <span className="text-3xl font-bold text-[var(--color-foreground)]">
                  {plan.price}
                </span>
                <span className="text-sm text-[var(--color-muted-2)] ml-1">{plan.period}</span>
              </div>
              <div className="font-semibold text-[var(--color-foreground)] mb-1">{plan.name}</div>
              <p className="text-sm text-[var(--color-muted)] mb-5">{plan.description}</p>
              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
                    <span className="text-[var(--color-highlight)] mt-0.5">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                disabled
                className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                  plan.highlight
                    ? "bg-[var(--color-deep-teal)] text-white hover:opacity-90"
                    : "border border-[var(--color-grid-500)] text-[var(--color-muted)] hover:border-[var(--color-highlight)] hover:text-[var(--color-highlight)]"
                } opacity-60 cursor-not-allowed`}
              >
                {plan.cta} — Coming soon
              </button>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-[var(--color-muted-2)] mt-6">
          Payments powered by Stripe — coming soon. All tools are free to try in demo mode.
        </p>
      </section>
    </div>
  );
}
