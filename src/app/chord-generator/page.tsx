import type { Metadata } from "next";
import ChordGeneratorClient from "./ChordGeneratorClient";

const URL = "https://lab.djandykofficial.com/chord-generator";

export const metadata: Metadata = {
  title: "Chord Generator",
  description:
    "Generate chord progressions for Trance, House, Pop, and Cinematic music. Select any key and mode to get chord names, notes, and interactive piano voicings. Free, browser-based.",
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    url: URL,
    siteName: "Andy'K Music Lab",
    title: "Chord Generator — Andy'K Music Lab",
    description:
      "Generate chord progressions by key, mode, and genre feel. Shows chord names, notes, and piano voicings. Trance, House, Pop, and Cinematic.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Chord Generator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chord Generator — Andy'K Music Lab",
    description: "Free chord progressions by key and genre. Piano voicings included.",
    images: ["/og-image.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Chord Generator",
  url: URL,
  description: "Music theory chord progression generator for Trance, House, Pop, and Cinematic genres with piano keyboard voicings.",
  applicationCategory: "MusicApplication",
  operatingSystem: "Web Browser",
  isPartOf: { "@type": "WebSite", name: "Andy'K Music Lab", url: "https://lab.djandykofficial.com" },
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  author: { "@type": "Person", name: "DJ Andy'K", url: "https://djandykofficial.com" },
};

export default function ChordGeneratorPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ChordGeneratorClient />
    </>
  );
}
