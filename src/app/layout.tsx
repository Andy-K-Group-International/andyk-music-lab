import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono, Playfair_Display, DM_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import FooterClient from "@/components/FooterClient";
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
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-icon.png",
    shortcut: "/favicon.ico",
  },
};

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
        <Providers>
          <Navbar />
          <main className="pt-16">{children}</main>

          <FooterClient />
        </Providers>
      </body>
    </html>
  );
}
