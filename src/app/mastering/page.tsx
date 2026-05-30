import type { Metadata } from "next";
import MasteringClient from "./MasteringClient";

const URL = "https://lab.djandykofficial.com/mastering";

export const metadata: Metadata = {
  title: "Mastering Tool",
  description:
    "Free online audio mastering — normalize to Spotify -14 LUFS, apply EQ, stereo widening, and -0.3 dBTP true-peak limiting. Runs entirely in your browser. Download WAV or MP3.",
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    url: URL,
    siteName: "Andy'K Music Lab",
    title: "Mastering Tool — Andy'K Music Lab",
    description:
      "Master your tracks to Spotify -14 LUFS with EQ, stereo widening, and true-peak limiting. Runs in your browser. Download WAV or MP3.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Mastering Tool" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mastering Tool — Andy'K Music Lab",
    description: "Free online mastering to Spotify -14 LUFS. 100% browser-based.",
    images: ["/og-image.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Audio Mastering Tool",
  url: URL,
  description: "Browser-based audio mastering — LUFS normalization, EQ, stereo widening, and true-peak limiting. No upload required.",
  applicationCategory: "MusicApplication",
  operatingSystem: "Web Browser",
  isPartOf: { "@type": "WebSite", name: "Andy'K Music Lab", url: "https://lab.djandykofficial.com" },
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  author: { "@type": "Person", name: "DJ Andy'K", url: "https://djandykofficial.com" },
};

export default function MasteringPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MasteringClient />
    </>
  );
}
