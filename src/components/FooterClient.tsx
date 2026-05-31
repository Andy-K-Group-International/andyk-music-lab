"use client";

import Image from "next/image";
import Link from "next/link";
import AdminUnlock from "@/components/AdminUnlock";
import { useLanguage } from "@/context/LanguageContext";

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/cookies-policy", label: "Cookies" },
  { href: "/terms-and-conditions", label: "Terms" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/company-information", label: "Company Info" },
  { href: "/copyright", label: "Copyright" },
];

export default function FooterClient() {
  const { t } = useLanguage();

  return (
    <footer className="premium-footer">
      <div className="max-w-6xl mx-auto">

        {/* Top row */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 mb-6 footer-divider">
          {/* Logo + tagline */}
          <div>
            <div className="footer-logo mb-3">
              <AdminUnlock>
                <Image src="/lab3dwhiteHQ.png" alt="Andy'K Music Lab" width={120} height={120} />
              </AdminUnlock>
            </div>
            <p className="footer-tagline">{t.footer.tagline}</p>
            <div className="flex items-center gap-5 flex-wrap">
              <Link href="/#tools" className="footer-link">{t.nav.tools}</Link>
              <Link href="/#pricing" className="footer-link">{t.nav.pricing}</Link>
              <a href="https://djandykofficial.com" target="_blank" rel="noopener noreferrer" className="footer-link">
                djandykofficial.com ↗
              </a>
            </div>
          </div>

          {/* Company info */}
          <div className="text-right">
            <div className="text-xs font-mono text-white/20 tracking-widest uppercase mb-2">By</div>
            <div className="text-sm font-semibold text-white/50">Andy&apos;K Group International</div>
            <div className="text-xs font-mono text-white/20 mt-1">Company No. 16453500</div>
          </div>
        </div>

        {/* Legal links */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
          {legalLinks.map(l => (
            <Link key={l.href} href={l.href} className="footer-link" style={{ fontSize: 11 }}>
              {l.label}
            </Link>
          ))}
          <Link href="/education-access" className="footer-link" style={{ fontSize: 11 }}>
            Education Access
          </Link>
          <Link href="/admin" className="footer-link" style={{ fontSize: 10, opacity: 0.4 }}>
            Admin
          </Link>
        </div>

        {/* Bottom row */}
        <div className="footer-bottom" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 16 }}>
          <span className="footer-copy">{t.footer.copyright}</span>
          <div className="flex items-center gap-4">
            <a href="https://djandykofficial.com" target="_blank" rel="noopener noreferrer" className="footer-link">
              djandykofficial.com
            </a>
            <span className="font-mono text-white/20 text-xs">v2.1.0</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
