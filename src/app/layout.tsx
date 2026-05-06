import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
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
      <body className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} antialiased font-sans min-h-screen`}>
        <ThemeProvider>
          <Navbar />
          <main className="pt-14">{children}</main>
          <footer className="border-t border-[var(--color-grid-500)] py-6 mt-16">
            <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-[var(--color-muted-2)]">
              <span>© ANDY&apos;K GROUP INTERNATIONAL LTD</span>
              <div className="flex items-center gap-4">
                <a href="https://djandyofficial.com" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--color-highlight)] transition-colors">
                  djandyofficial.com
                </a>
                <span className="font-mono">v1.0.0</span>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
