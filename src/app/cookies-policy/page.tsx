import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookies Policy",
  description: "Cookies Policy for Andy'K Music Lab — how we use cookies and local storage.",
  alternates: { canonical: "https://lab.djandykofficial.com/cookies-policy" },
};

export default function CookiesPolicy() {
  return (
    <div className="tool-page-bg min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-8 md:p-12">
          <p className="font-mono text-xs text-[#111111] tracking-widest uppercase mb-4">Legal</p>
          <h1 className="text-3xl font-bold mb-2">Cookies Policy</h1>
          <p className="text-sm font-mono opacity-40 mb-10">Last updated: 1 May 2026</p>

          <div className="prose-legal">

            <h2>1. What Are Cookies</h2>
            <p>
              Cookies are small text files placed on your device when you visit a website. We also use browser
              local storage and session storage to store small pieces of data on your device.
            </p>

            <h2>2. How We Use Cookies and Local Storage</h2>

            <h3>Strictly Necessary</h3>
            <p>These cannot be disabled as they are required for the Service to function.</p>
            <table>
              <thead>
                <tr><th>Name</th><th>Type</th><th>Purpose</th><th>Duration</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>andyk-ml-theme</code></td>
                  <td>localStorage</td>
                  <td>Stores your light/dark theme preference</td>
                  <td>Persistent</td>
                </tr>
                <tr>
                  <td><code>andyk-bpm-history</code></td>
                  <td>localStorage</td>
                  <td>Stores your last 10 BPM detection results locally</td>
                  <td>Persistent</td>
                </tr>
              </tbody>
            </table>

            <h3>Analytics (Optional)</h3>
            <p>
              We may use privacy-respecting analytics to understand how the Service is used. These cookies collect
              anonymised, aggregated data only. You can opt out at any time.
            </p>

            <h3>Authentication (When Logged In)</h3>
            <p>
              If you create an account, session cookies are used to keep you logged in for the duration of your session.
            </p>

            <h2>3. Managing Cookies</h2>
            <p>
              You can clear local storage and cookies at any time through your browser settings. Note that clearing
              strictly necessary storage will reset your preferences (theme, history).
            </p>
            <p>
              Most browsers allow you to refuse cookies. Consult your browser&apos;s help documentation for instructions.
            </p>

            <h2>4. Third-Party Cookies</h2>
            <p>
              We do not use third-party advertising cookies. Any third-party services we use (e.g., analytics, payment)
              may set their own cookies, governed by their respective privacy policies.
            </p>

            <h2>5. Contact</h2>
            <p>
              If you have questions about our use of cookies, contact us at{" "}
              <a href="mailto:info@djandykofficial.com">info@djandykofficial.com</a>.
            </p>
            <p>
              ANDY&apos;K GROUP INTERNATIONAL LTD<br />
              86-90 Paul Street, London, EC2A 4NE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
