import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Playfair_Display, DM_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import AdminUnlock from "@/components/AdminUnlock";
import Link from "next/link";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});

const SITE_URL = "https://lab.djandykofficial.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Andy'K Music Lab | Free Audio Mastering, BPM & Key Detector",
    template: "%s | Andy'K Music Lab",
  },
  description:
    "Professional audio tools by DJ Andy'K. Free online mastering to Spotify -14 LUFS standard, BPM & Key detector with Camelot Wheel, DJ Set Planner. 100% client-side — your audio never leaves your browser.",
  keywords: [
    "audio mastering online free", "BPM detector", "key finder", "Camelot Wheel",
    "DJ set planner", "Spotify mastering", "LUFS normalizer", "DJ Andy'K", "Andy'K Music Lab",
  ],
  authors: [{ name: "Andy'K Group International", url: "https://djandykofficial.com" }],
  creator: "Andy'K Group International",
  publisher: "ANDY'K GROUP INTERNATIONAL LTD",
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: SITE_URL,
    siteName: "Andy'K Music Lab",
    title: "Andy'K Music Lab — Free Professional Audio Tools",
    description: "Master your tracks to Spotify standard, detect BPM & key, plan DJ sets. Built by DJ Andy'K. Free to try.",
    images: [{ url: "/og-image.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Andy'K Music Lab",
    description: "Free audio mastering, BPM detector & DJ set planner by DJ Andy'K",
  },
  alternates: { canonical: SITE_URL },
  robots: { index: true, follow: true },
};

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/cookies-policy", label: "Cookies" },
  { href: "/terms-and-conditions", label: "Terms" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/company-information", label: "Company Info" },
  { href: "/copyright", label: "Copyright" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Andy'K Music Lab",
              "url": "https://lab.djandykofficial.com",
              "description": "Professional audio tools for producers and DJs",
              "applicationCategory": "MusicApplication",
              "operatingSystem": "Web Browser",
              "offers": [
                { "@type": "Offer", "name": "Studio Pass",    "price": "29",  "priceCurrency": "GBP" },
                { "@type": "Offer", "name": "Pro Pass",       "price": "199", "priceCurrency": "GBP" },
                { "@type": "Offer", "name": "Single Session", "price": "49",  "priceCurrency": "GBP" },
              ],
              "author": { "@type": "Person", "name": "DJ Andy'K", "url": "https://djandykofficial.com" },
            }),
          }}
        />
      </head>
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${playfair.variable} ${dmSans.variable} antialiased font-sans min-h-screen`}
      >
          <Navbar />
          <main className="pt-16">{children}</main>

          {/* Footer */}
          <footer className="premium-footer">
            <div className="max-w-6xl mx-auto">

              {/* Top row */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 mb-6 footer-divider">
                {/* Logo + tagline */}
                <div>
                  <div className="footer-logo mb-3">
                    <AdminUnlock>
                      <span className="font-mono font-bold text-[#111111] text-base tracking-tight">Andy&apos;K</span>
                      <span className="text-[rgba(0,0,0,0.25)] mx-2 text-base">|</span>
                      <span className="text-white/70 font-medium text-base">Music Lab</span>
                    </AdminUnlock>
                  </div>
                  <p className="footer-tagline">Professional audio tools — built by DJ Andy&apos;K</p>
                  <div className="flex items-center gap-5 flex-wrap">
                    <Link href="/#tools" className="footer-link">Tools</Link>
                    <Link href="/#pricing" className="footer-link">Pricing</Link>
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
                <Link href="/admin" className="footer-link" style={{ fontSize: 10, opacity: 0.4 }}>
                  Admin
                </Link>
              </div>

              {/* Bottom row */}
              <div className="footer-bottom" style={{ borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 16 }}>
                <span className="footer-copy">
                  © 2026 Andy&apos;K Music Lab · ANDY&apos;K GROUP INTERNATIONAL LTD
                </span>
                <div className="flex items-center gap-4">
                  <a href="https://djandykofficial.com" target="_blank" rel="noopener noreferrer" className="footer-link">
                    djandykofficial.com
                  </a>
                  <span className="font-mono text-white/20 text-xs">v2.1.0</span>
                </div>
              </div>

            </div>
          </footer>
      </body>
    </html>
  );
}
