import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
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

export const metadata: Metadata = {
  title: {
    default: "Andy'K Music Lab — Professional tools for producers and DJs",
    template: "%s | Andy'K Music Lab",
  },
  description:
    "Professional audio tools for producers and DJs. Mastering, BPM & Key detection, and DJ Set Planner — by Andy'K Group International.",
  keywords: ["DJ tools", "mastering", "BPM detector", "key detection", "DJ set planner", "Andy'K"],
  authors: [{ name: "Andy'K Group International" }],
  creator: "Andy'K Group International",
  publisher: "ANDY'K GROUP INTERNATIONAL LTD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent theme flash — runs before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('andyk-ml-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${playfair.variable} antialiased font-sans min-h-screen`}
      >
        <ThemeProvider>
          <Navbar />
          <main className="pt-16">{children}</main>

          {/* Premium Footer */}
          <footer className="premium-footer">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 mb-8 footer-divider">
                {/* Logo + tagline */}
                <div>
                  <div className="footer-logo mb-3">
                    <span className="font-mono font-bold text-[#63B39A] text-base tracking-tight">Andy&apos;K</span>
                    <span className="text-[rgba(99,179,154,0.3)] mx-2 text-base">|</span>
                    <span className="text-white/70 font-medium text-base">Music Lab</span>
                  </div>
                  <p className="footer-tagline">Professional audio tools — built by DJ Andy&apos;K</p>
                  <div className="flex items-center gap-5">
                    <Link href="/#tools" className="footer-link">Tools</Link>
                    <Link href="/#pricing" className="footer-link">Pricing</Link>
                    <a href="https://djandyofficial.com" target="_blank" rel="noopener noreferrer" className="footer-link">djandyofficial.com ↗</a>
                  </div>
                </div>

                {/* Right column */}
                <div className="text-right">
                  <div className="text-xs font-mono text-white/20 tracking-widest uppercase mb-2">By</div>
                  <div className="text-sm font-semibold text-white/50">Andy&apos;K Group International</div>
                </div>
              </div>

              {/* Bottom row */}
              <div className="footer-bottom">
                <span className="footer-copy">© ANDY&apos;K GROUP INTERNATIONAL LTD</span>
                <div className="flex items-center gap-5">
                  <a href="https://djandyofficial.com" target="_blank" rel="noopener noreferrer" className="footer-link">
                    djandyofficial.com
                  </a>
                  <span className="font-mono text-white/20 text-xs">v2.0.0</span>
                </div>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
