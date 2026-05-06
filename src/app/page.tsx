import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Andy'K Music Lab — Professional tools for producers and DJs",
};

const tools = [
  {
    href: "/mastering",
    icon: "🎚️",
    title: "Mastering Tool",
    description:
      "Upload your track and get a professional master — loudness normalization to -14 LUFS, EQ, and true-peak limiting.",
    badge: "Demo free",
  },
  {
    href: "/bpm",
    icon: "🥁",
    title: "BPM + Key Detector",
    description:
      "Instant BPM and musical key analysis from MP3 or WAV. Energy level detection included.",
    badge: "Free",
  },
  {
    href: "/planner",
    icon: "🎛️",
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
      <section className="relative overflow-hidden py-28 px-6">
        <div className="hero-gradient" />
        <div className="cartesian-grid" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <span className="inline-block font-mono text-xs tracking-widest text-[var(--color-highlight)] uppercase mb-4 px-3 py-1 rounded-full border border-[var(--color-highlight)]/30 bg-[var(--color-soft-green)]">
            By Andy&apos;K Group International
          </span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-[var(--color-foreground)] mt-4 mb-6 gradient-text">
            Andy&apos;K Music Lab
          </h1>
          <p className="text-xl text-[var(--color-muted)] max-w-2xl mx-auto leading-relaxed">
            Professional tools for producers and DJs. Master your tracks, detect BPM &amp; Key, and
            plan harmonically perfect DJ sets — all in the browser.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {tools.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-deep-teal)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <span>{t.icon}</span>
                {t.title}
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
              <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
                <div className="text-3xl mb-4">{t.icon}</div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-[var(--color-foreground)]">{t.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-soft-green)] text-[var(--color-deep-teal)] font-medium">
                    {t.badge}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed flex-1">
                  {t.description}
                </p>
                <div className="mt-4 text-sm text-[var(--color-highlight)] font-medium group-hover:underline">
                  Open tool →
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
