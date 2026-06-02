import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing & Access Terms — Andy'K Music Lab",
  description: "Pricing, access, discount codes, refund rules and legal notes for Andy'K Music Lab.",
};

const mono: React.CSSProperties = { fontFamily: "var(--font-mono)" };
const sans: React.CSSProperties = { fontFamily: "var(--font-sans)" };

const sectionLabel: React.CSSProperties = {
  ...mono,
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: "#a3a3a3",
  margin: "0 0 10px",
};

const sectionHeading: React.CSSProperties = {
  ...sans,
  fontSize: "clamp(1rem, 2vw, 1.1rem)",
  fontWeight: 700,
  color: "#111111",
  margin: "0 0 12px",
  lineHeight: 1.3,
};

const bodyText: React.CSSProperties = {
  ...sans,
  fontSize: 14,
  color: "#525252",
  lineHeight: 1.8,
  margin: 0,
};

const section: React.CSSProperties = {
  borderTop: "1px solid #e5e5e5",
  paddingTop: 32,
  marginTop: 32,
};

export default function PricingTermsPage() {
  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: "#ffffff" }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 24px 96px" }}>

        {/* Header */}
        <p style={{ ...mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#a3a3a3", marginBottom: 20 }}>
          Andy&apos;K Music Lab
        </p>
        <h1 style={{ ...sans, fontSize: "clamp(2rem, 5vw, 2.8rem)", fontWeight: 700, color: "#111111", lineHeight: 1.1, margin: "0 0 24px" }}>
          Pricing &amp; Access Terms
        </h1>
        <p style={{ ...sans, fontSize: 15, color: "#737373", lineHeight: 1.75, margin: "0 0 16px" }}>
          Last updated: June 2026
        </p>
        <p style={bodyText}>
          Andy&apos;K Music Lab is a digital browser-based audio tool platform. Access is provided based on the selected plan, payment status, discount code eligibility and account email.
        </p>

        {/* Section 1 */}
        <div style={section}>
          <p style={sectionLabel}>Section 1</p>
          <h2 style={sectionHeading}>Access Overview</h2>
          <p style={bodyText}>
            Access to Andy&apos;K Music Lab is digital and browser-based. Customers receive access based on the plan, tool, session or access code they purchase or are granted. Access remains active only during the valid paid or granted access period.
          </p>
        </div>

        {/* Section 2 */}
        <div style={section}>
          <p style={sectionLabel}>Section 2</p>
          <h2 style={sectionHeading}>Payment &amp; Account Linking</h2>
          <p style={bodyText}>
            After successful payment, customers must create an account using the same email address used during checkout. Access is linked to that email address. If a customer registers with a different email address, manual account linking may be required and may take additional time. Manual account linking is not guaranteed immediately.
          </p>
        </div>

        {/* Section 3 */}
        <div style={section}>
          <p style={sectionLabel}>Section 3</p>
          <h2 style={sectionHeading}>Personal Data &amp; Account Access</h2>
          <p style={bodyText}>
            Andy&apos;K Music Lab processes personal data such as name, email address, payment reference, selected plan, discount code status, account access status, tool access and support messages for the purpose of providing digital access to the platform, managing payments, applying discount codes, preventing misuse, providing support and improving the service. For more information, see the{" "}
            <Link href="/privacy-policy" style={{ color: "#111111", textDecoration: "underline" }}>Privacy Policy</Link>.
          </p>
        </div>

        {/* Section 4 */}
        <div style={section}>
          <p style={sectionLabel}>Section 4</p>
          <h2 style={sectionHeading}>Early Access Discount</h2>
          <p style={bodyText}>
            The first 40 members may receive 40% off for 1 year through a valid waitlist code or personal discount code. Discount codes cannot be combined, may be plan-specific, may expire, and may be limited to selected users, plans, tools or access periods.
          </p>
        </div>

        {/* Section 5 */}
        <div style={section}>
          <p style={sectionLabel}>Section 5</p>
          <h2 style={sectionHeading}>Full Lab / Studio Pass</h2>
          <p style={bodyText}>
            Full Lab or Studio Pass access includes all 8 tools during the active access period: Mastering Tool, BPM + Key Detector, DJ Set Planner, Track Comparator, Chord Generator, Metronome, Loudness Meter, Stem Splitter.
          </p>
        </div>

        {/* Section 6 */}
        <div style={section}>
          <p style={sectionLabel}>Section 6</p>
          <h2 style={sectionHeading}>Individual Tool Access</h2>
          <p style={bodyText}>
            Individual tool purchases unlock only the selected tool. Buying all tools individually costs more than Full Lab access.
          </p>
        </div>

        {/* Section 7 */}
        <div style={section}>
          <p style={sectionLabel}>Section 7</p>
          <h2 style={sectionHeading}>Single Session</h2>
          <p style={bodyText}>
            Single Session applies to one professional mastering session for one track only. It does not include Full Lab subscription access.
          </p>
        </div>

        {/* Section 8 */}
        <div style={section}>
          <p style={sectionLabel}>Section 8</p>
          <h2 style={sectionHeading}>Early Access Notice</h2>
          <p style={bodyText}>
            Andy&apos;K Music Lab is currently in early access. Some tools may continue to improve, change, expand or temporarily behave differently as the platform is refined based on user feedback.
          </p>
        </div>

        {/* Section 9 */}
        <div style={section}>
          <p style={sectionLabel}>Section 9</p>
          <h2 style={sectionHeading}>Discount Code Refund Rules</h2>
          <p style={{ ...bodyText, marginBottom: 16 }}>
            Andy&apos;K Music Lab is a digital browser-based audio tool platform. Access is delivered digitally after payment and account activation. Discounted purchases made using any coupon code, promo code, personal discount code, waitlist code, education code, school code, partner code, 100% admin/test code, plan-specific code or limited-time offer are generally non-refundable once access has been activated.
          </p>
          <p style={{ ...bodyText, marginBottom: 12 }}>This includes:</p>
          <ul style={{ ...sans, fontSize: 14, color: "#525252", lineHeight: 2, margin: "0 0 16px", paddingLeft: 20 }}>
            <li>Waitlist discount codes</li>
            <li>First 40 members early access codes</li>
            <li>Personal discount codes</li>
            <li>Coupon codes and promo codes</li>
            <li>School or education access codes</li>
            <li>Partner codes</li>
            <li>100% admin/test access codes</li>
            <li>Plan-specific promo codes</li>
            <li>Limited-time offers</li>
          </ul>
          <p style={{ ...bodyText, marginBottom: 12 }}>Refunds are not provided because:</p>
          <ul style={{ ...sans, fontSize: 14, color: "#525252", lineHeight: 2, margin: 0, paddingLeft: 20 }}>
            <li>Customer changed mind after access activated</li>
            <li>Did not use tools</li>
            <li>Selected wrong plan but already activated</li>
            <li>Registered with wrong email and did not contact support</li>
            <li>Forgot to cancel before next billing</li>
            <li>Used discount code and wanted different offer</li>
            <li>Received education access at large discount</li>
          </ul>
        </div>

        {/* Section 10 */}
        <div style={section}>
          <p style={sectionLabel}>Section 10</p>
          <h2 style={sectionHeading}>Technical Failure Refund Review</h2>
          <p style={{ ...bodyText, marginBottom: 16 }}>
            Refunds may be reviewed only where:
          </p>
          <ul style={{ ...sans, fontSize: 14, color: "#525252", lineHeight: 2, margin: "0 0 16px", paddingLeft: 20 }}>
            <li>Purchased tool could not be accessed due to technical issue caused by Andy&apos;K Music Lab</li>
            <li>Issue was reported during active billing period</li>
            <li>Could not be resolved within reasonable time</li>
            <li>Prevented access for more than 40% of active billing period</li>
          </ul>
          <p style={{ ...bodyText, marginBottom: 16 }}>
            In eligible cases Andy&apos;K Music Lab may offer at its discretion: fix or restoration, extension, account credit, partial refund, or full refund in exceptional cases.
          </p>
          <p style={{ ...bodyText, marginBottom: 12 }}>
            Refund requests to: <a href="mailto:ceo@andykgroup.com" style={{ color: "#111111", textDecoration: "underline" }}>ceo@andykgroup.com</a>
          </p>
          <p style={{ ...bodyText }}>
            Customer must include: payment email, plan or tool purchased, order date, description of issue, screenshots where possible.
          </p>
        </div>

        {/* Section 11 */}
        <div style={section}>
          <p style={sectionLabel}>Section 11</p>
          <h2 style={sectionHeading}>Education Access &amp; School Discount Rules</h2>
          <p style={{ ...bodyText, marginBottom: 16 }}>
            Education Access may be offered free or at significant discount to selected music schools, DJ courses, producer communities or educational partners. Generally non-refundable once activated, except where required by law or technical issue prevents access for more than 40% of active period.
          </p>
          <p style={bodyText}>
            Andy&apos;K Music Lab may refuse, pause, cancel or revoke Education Access where codes are misused, shared publicly without permission, resold, abused, or used outside approved educational purpose.
          </p>
        </div>

        {/* Section 12 */}
        <div style={section}>
          <p style={sectionLabel}>Section 12</p>
          <h2 style={sectionHeading}>Cancellation</h2>
          <p style={bodyText}>
            Subscriptions can be cancelled before the next billing period. Cancellation stops future renewals but does not automatically refund the current active billing period.
          </p>
        </div>

        {/* Section 13 */}
        <div style={section}>
          <p style={sectionLabel}>Section 13</p>
          <h2 style={sectionHeading}>Discount Code Misuse</h2>
          <p style={bodyText}>
            Andy&apos;K Music Lab may refuse, cancel or revoke access where discount codes are misused, shared publicly without permission, resold, abused, or used in an unintended way.
          </p>
        </div>

        {/* Section 14 */}
        <div style={section}>
          <p style={sectionLabel}>Section 14</p>
          <h2 style={sectionHeading}>Tax / VAT</h2>
          <p style={bodyText}>
            VAT/tax may apply depending on your location and payment provider.
          </p>
        </div>

        {/* Section 15 */}
        <div style={section}>
          <p style={sectionLabel}>Section 15</p>
          <h2 style={sectionHeading}>Statutory Rights</h2>
          <p style={bodyText}>
            This policy does not affect statutory consumer rights that cannot be excluded by law.
          </p>
        </div>

        {/* Section 16 */}
        <div style={section}>
          <p style={sectionLabel}>Section 16</p>
          <h2 style={sectionHeading}>Contact</h2>
          <p style={bodyText}>
            For access, billing or refund questions, contact:{" "}
            <a href="mailto:ceo@andykgroup.com" style={{ color: "#111111", textDecoration: "underline" }}>ceo@andykgroup.com</a>
          </p>
        </div>

        {/* Footer nav */}
        <div style={{ borderTop: "1px solid #e5e5e5", marginTop: 48, paddingTop: 24, display: "flex", gap: 20, flexWrap: "wrap" }}>
          <Link href="/privacy-policy" style={{ ...mono, fontSize: 11, color: "#8a8a8a", textDecoration: "underline" }}>Privacy Policy</Link>
          <Link href="/terms-and-conditions" style={{ ...mono, fontSize: 11, color: "#8a8a8a", textDecoration: "underline" }}>Terms &amp; Conditions</Link>
          <Link href="/" style={{ ...mono, fontSize: 11, color: "#8a8a8a", textDecoration: "underline" }}>Back to Home</Link>
        </div>

      </div>
    </div>
  );
}
