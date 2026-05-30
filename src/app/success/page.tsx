import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Successful",
  robots: { index: false, follow: false },
};

const PLAN_NAMES: Record<string, string> = {
  single: "Single Session",
  studio: "Studio Pass",
  pro: "Pro Pass",
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const planName = PLAN_NAMES[plan ?? ""] ?? "your plan";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px",
        textAlign: "center",
      }}
    >
      {/* Check mark */}
      <div
        style={{
          width: 64,
          height: 64,
          border: "2px solid #111111",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 40,
          flexShrink: 0,
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#111111"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      {/* Label */}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(0,0,0,0.38)",
          marginBottom: 20,
          display: "block",
        }}
      >
        Payment Successful
      </span>

      {/* Heading */}
      <h1
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
          fontWeight: 700,
          color: "#111111",
          lineHeight: 1.25,
          margin: "0 0 16px",
          maxWidth: 520,
        }}
      >
        Welcome to Andy&apos;K Music Lab
      </h1>

      {/* Plan name */}
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          letterSpacing: "0.06em",
          color: "#525252",
          margin: "0 0 48px",
        }}
      >
        {planName} — activated
      </p>

      {/* Divider */}
      <div
        style={{
          width: 48,
          height: 1,
          background: "#111111",
          marginBottom: 48,
        }}
      />

      {/* CTA */}
      <Link
        href="/dashboard"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 36px",
          background: "#111111",
          color: "#ffffff",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          textDecoration: "none",
          transition: "opacity 0.15s ease",
        }}
      >
        Go to Tools
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
