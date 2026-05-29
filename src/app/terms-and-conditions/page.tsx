import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and Conditions for using Andy'K Music Lab.",
  alternates: { canonical: "https://lab.djandykofficial.com/terms-and-conditions" },
};

export default function TermsAndConditions() {
  return (
    <div className="tool-page-bg min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-8 md:p-12">
          <p className="font-mono text-xs text-[#111111] tracking-widest uppercase mb-4">Legal</p>
          <h1 className="text-3xl font-bold mb-2">Terms &amp; Conditions</h1>
          <p className="text-sm font-mono opacity-40 mb-10">Last updated: 1 May 2026</p>

          <div className="prose-legal">

            <h2>1. Acceptance</h2>
            <p>
              By accessing or using Andy&apos;K Music Lab (&ldquo;the Service&rdquo;) you agree to be bound by these Terms
              and Conditions. If you do not agree, you must not use the Service. The Service is operated by
              <strong> ANDY&apos;K GROUP INTERNATIONAL LTD</strong> (Company No. 16453500), 86-90 Paul Street,
              London, EC2A 4NE, United Kingdom.
            </p>

            <h2>2. The Service</h2>
            <p>
              Andy&apos;K Music Lab provides browser-based audio tools for music producers and DJs, including audio
              mastering, BPM &amp; key detection, and DJ set planning. Audio processing is performed locally in your
              browser; we do not store your audio files.
            </p>

            <h2>3. Accounts and Subscriptions</h2>
            <ul>
              <li>You must be 18 years or older to create an account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>Subscription fees are billed in advance and are non-refundable except where required by law.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
            </ul>

            <h2>4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any unlawful purpose or in violation of any applicable law</li>
              <li>Upload content that infringes the intellectual property rights of any third party</li>
              <li>Attempt to reverse-engineer, decompile, or extract the source code of the Service</li>
              <li>Use automated means to access or scrape the Service</li>
              <li>Resell or redistribute access to the Service without our written consent</li>
            </ul>

            <h2>5. Intellectual Property</h2>
            <p>
              All intellectual property rights in the Service (including software, design, trademarks, and content)
              are owned by or licensed to ANDY&apos;K GROUP INTERNATIONAL LTD. You retain all rights in audio files
              you upload. By using the Service you do not acquire any ownership of our intellectual property.
            </p>

            <h2>6. Disclaimer of Warranties</h2>
            <p>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without warranties of any kind, express or implied,
              including but not limited to merchantability, fitness for a particular purpose, or non-infringement.
              We do not warrant that the Service will be uninterrupted, error-free, or that results will meet your
              requirements.
            </p>

            <h2>7. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, ANDY&apos;K GROUP INTERNATIONAL LTD shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or
              goodwill, arising out of or in connection with your use of the Service. Our total aggregate liability
              shall not exceed the amount you paid us in the 12 months preceding the claim.
            </p>

            <h2>8. Indemnity</h2>
            <p>
              You agree to indemnify and hold harmless ANDY&apos;K GROUP INTERNATIONAL LTD and its officers, directors,
              and employees from any claims, damages, or expenses arising from your use of the Service or violation
              of these Terms.
            </p>

            <h2>9. Modifications</h2>
            <p>
              We reserve the right to modify these Terms at any time. Continued use of the Service after changes
              are posted constitutes acceptance of the revised Terms.
            </p>

            <h2>10. Governing Law</h2>
            <p>
              These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the
              exclusive jurisdiction of the courts of England and Wales.
            </p>

            <h2>11. Contact</h2>
            <p>
              ANDY&apos;K GROUP INTERNATIONAL LTD<br />
              86-90 Paul Street, London, EC2A 4NE<br />
              <a href="mailto:ceo@andykgroup.com">ceo@andykgroup.com</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
