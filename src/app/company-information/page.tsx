import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Company Information",
  description: "Company information for ANDY'K GROUP INTERNATIONAL LTD — the company behind Andy'K Music Lab.",
  alternates: { canonical: "https://lab.djandykofficial.com/company-information" },
};

export default function CompanyInformation() {
  return (
    <div className="tool-page-bg min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="glass-card p-8 md:p-12">
          <p className="font-mono text-xs text-[#63B39A] tracking-widest uppercase mb-4">Legal</p>
          <h1 className="text-3xl font-bold mb-2">Company Information</h1>
          <p className="text-sm font-mono opacity-40 mb-10">Andy&apos;K Music Lab is operated by:</p>

          <div className="prose-legal">

            <div className="company-info-block">
              <h2>ANDY&apos;K GROUP INTERNATIONAL LTD</h2>

              <table>
                <tbody>
                  <tr>
                    <th>Registered Name</th>
                    <td>ANDY&apos;K GROUP INTERNATIONAL LTD</td>
                  </tr>
                  <tr>
                    <th>Company Number</th>
                    <td>16453500</td>
                  </tr>
                  <tr>
                    <th>Registered in</th>
                    <td>England and Wales</td>
                  </tr>
                  <tr>
                    <th>Registered Office</th>
                    <td>
                      86-90 Paul Street<br />
                      London<br />
                      EC2A 4NE<br />
                      United Kingdom
                    </td>
                  </tr>
                  <tr>
                    <th>Email</th>
                    <td>
                      <a href="mailto:info@djandykofficial.com">info@djandykofficial.com</a>
                    </td>
                  </tr>
                  <tr>
                    <th>Website</th>
                    <td>
                      <a href="https://andykgroupinternational.com" target="_blank" rel="noopener noreferrer">
                        andykgroupinternational.com
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <th>Artist Website</th>
                    <td>
                      <a href="https://djandykofficial.com" target="_blank" rel="noopener noreferrer">
                        djandykofficial.com
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>About</h2>
            <p>
              ANDY&apos;K GROUP INTERNATIONAL LTD is an entertainment and technology company founded by DJ Andy&apos;K.
              The company operates Andy&apos;K Music Lab — a suite of professional browser-based audio tools designed
              for music producers, DJs, and audio engineers worldwide.
            </p>

            <h2>Products &amp; Services</h2>
            <ul>
              <li><strong>Andy&apos;K Music Lab</strong> — Professional audio tools (mastering, BPM &amp; key detection, DJ set planning)</li>
              <li><strong>DJ Andy&apos;K</strong> — Artist brand, DJ sets, and music releases</li>
            </ul>

            <h2>Company Registration</h2>
            <p>
              You can verify company details on the UK Companies House register at{" "}
              <a href="https://find-and-update.company-information.service.gov.uk" target="_blank" rel="noopener noreferrer">
                find-and-update.company-information.service.gov.uk
              </a>{" "}
              by searching for company number <strong>16453500</strong>.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
