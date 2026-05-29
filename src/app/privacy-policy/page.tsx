import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Andy'K Music Lab — how we collect, use, and protect your personal data.",
  alternates: { canonical: "https://lab.djandykofficial.com/privacy-policy" },
};

export default function PrivacyPolicy() {
  return (
    <div className="tool-page-bg min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-8 md:p-12">
          <p className="font-mono text-xs text-[#111111] tracking-widest uppercase mb-4">Legal</p>
          <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
          <p className="text-sm font-mono opacity-40 mb-10">Last updated: 1 May 2026</p>

          <div className="prose-legal">

            <h2>1. Who We Are</h2>
            <p>
              Andy&apos;K Music Lab (&ldquo;the Service&rdquo;) is operated by <strong>ANDY&apos;K GROUP INTERNATIONAL LTD</strong>,
              a company registered in England and Wales (Company No. 16453500), with registered office at
              86-90 Paul Street, London, EC2A 4NE, United Kingdom.
            </p>
            <p>
              Contact: <a href="mailto:info@djandykofficial.com">info@djandykofficial.com</a>
            </p>

            <h2>2. What Data We Collect</h2>
            <p>We collect only the minimum data necessary to provide the Service:</p>
            <ul>
              <li><strong>Audio files</strong> — uploaded by you for processing (mastering, BPM/key detection). Files are processed in your browser and are not stored on our servers.</li>
              <li><strong>Usage data</strong> — anonymised analytics (page views, feature usage) collected via privacy-respecting analytics tools.</li>
              <li><strong>Cookies and local storage</strong> — used for theme preference and local tool history (BPM history). See our Cookies Policy.</li>
              <li><strong>Account data</strong> — if you create an account or purchase a subscription, we collect your email address and payment information (processed securely by our payment provider).</li>
            </ul>

            <h2>3. How We Use Your Data</h2>
            <ul>
              <li>To provide and improve the Service</li>
              <li>To process payments and manage subscriptions</li>
              <li>To respond to support enquiries</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p>We do not sell your personal data to third parties.</p>

            <h2>4. Legal Basis for Processing (UK GDPR)</h2>
            <ul>
              <li><strong>Contract</strong> — to perform the services you have requested</li>
              <li><strong>Legitimate interests</strong> — to improve the Service and prevent fraud</li>
              <li><strong>Legal obligation</strong> — where required by law</li>
              <li><strong>Consent</strong> — for optional analytics and marketing communications</li>
            </ul>

            <h2>5. Data Retention</h2>
            <p>
              Audio files processed in the browser are never transmitted to our servers and are discarded immediately after processing.
              Account data is retained for the duration of your account plus 7 years for accounting purposes.
              Analytics data is retained for 24 months.
            </p>

            <h2>6. Your Rights</h2>
            <p>Under UK GDPR you have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request erasure of your data</li>
              <li>Object to processing or request restriction</li>
              <li>Data portability</li>
              <li>Lodge a complaint with the ICO (ico.org.uk)</li>
            </ul>
            <p>To exercise any of these rights, contact us at <a href="mailto:info@djandykofficial.com">info@djandykofficial.com</a>.</p>

            <h2>7. Third-Party Services</h2>
            <p>We use the following third-party services which may process your data:</p>
            <ul>
              <li><strong>Payment processor</strong> — for subscription payments (subject to their own privacy policy)</li>
              <li><strong>Hosting provider</strong> — Vercel Inc. (infrastructure)</li>
            </ul>

            <h2>8. International Transfers</h2>
            <p>
              Our hosting infrastructure may involve transfers outside the UK/EEA. Where this occurs, appropriate safeguards
              (Standard Contractual Clauses or UK adequacy decisions) are in place.
            </p>

            <h2>9. Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. We will notify you of material changes by posting the updated policy
              on this page with a revised date.
            </p>

            <h2>10. Contact</h2>
            <p>
              ANDY&apos;K GROUP INTERNATIONAL LTD<br />
              86-90 Paul Street, London, EC2A 4NE<br />
              <a href="mailto:info@djandykofficial.com">info@djandykofficial.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
