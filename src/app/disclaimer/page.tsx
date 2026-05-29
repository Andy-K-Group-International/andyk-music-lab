import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Disclaimer for Andy'K Music Lab — limitations of the Service and professional advice.",
  alternates: { canonical: "https://lab.djandykofficial.com/disclaimer" },
};

export default function Disclaimer() {
  return (
    <div className="tool-page-bg min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-8 md:p-12">
          <p className="font-mono text-xs text-[#111111] tracking-widest uppercase mb-4">Legal</p>
          <h1 className="text-3xl font-bold mb-2">Disclaimer</h1>
          <p className="text-sm font-mono opacity-40 mb-10">Last updated: 1 May 2026</p>

          <div className="prose-legal">

            <h2>General</h2>
            <p>
              The information and tools provided by Andy&apos;K Music Lab (&ldquo;the Service&rdquo;), operated by
              <strong> ANDY&apos;K GROUP INTERNATIONAL LTD</strong> (Company No. 16453500), are provided for general
              informational and creative purposes only. While we strive for accuracy and quality, we make no
              representations or warranties of any kind, express or implied, about the completeness, accuracy,
              reliability, suitability, or availability of the Service or the results it produces.
            </p>

            <h2>Audio Processing Results</h2>
            <p>
              The mastering, BPM detection, key detection, and other audio analysis results produced by the Service
              are algorithmic estimates. They are intended as creative and productivity aids, not as definitive
              technical measurements or professional mastering services. Results may vary depending on audio content,
              file format, and browser capabilities.
            </p>
            <p>
              For professional-grade mastering for commercial release, we recommend working with a qualified
              mastering engineer in addition to using our tools.
            </p>

            <h2>No Professional Advice</h2>
            <p>
              Nothing on the Service constitutes professional audio engineering, legal, financial, or business advice.
              Any reliance you place on information or results from the Service is strictly at your own risk.
            </p>

            <h2>Third-Party Links</h2>
            <p>
              The Service may contain links to third-party websites. These links are provided for convenience only.
              We have no control over the content of those sites and accept no responsibility for them or for any
              loss or damage that may arise from your use of them.
            </p>

            <h2>Availability</h2>
            <p>
              We endeavour to keep the Service available at all times, but we accept no liability if the Service
              is unavailable for any period. Access may be suspended without notice for maintenance, updates, or
              circumstances beyond our control.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, ANDY&apos;K GROUP INTERNATIONAL LTD shall not be liable
              for any direct, indirect, incidental, special, consequential, or punitive loss or damage arising from
              your use of, or inability to use, the Service or the results it generates.
            </p>

            <h2>Contact</h2>
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
