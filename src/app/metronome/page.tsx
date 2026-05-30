import type { Metadata } from "next";
import MetronomeClient from "./MetronomeClient";

const URL = "https://lab.djandykofficial.com/metronome";

export const metadata: Metadata = {
  title: "Metronome",
  description:
    "Free online metronome with tap tempo, adjustable BPM (40–220), time signatures (2/4, 3/4, 4/4, 6/8), quarter/eighth/sixteenth note subdivisions, and precise Web Audio API click sounds.",
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    url: URL,
    siteName: "Andy'K Music Lab",
    title: "Metronome — Andy'K Music Lab",
    description:
      "Precise online metronome with tap tempo, time signatures, and subdivisions. Web Audio API powered.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Metronome" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Metronome — Andy'K Music Lab",
    description: "Free online metronome. Tap tempo, time signatures, subdivisions.",
    images: ["/og-image.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Online Metronome",
  url: URL,
  description: "Precision metronome using the Web Audio API with tap tempo, time signature selection, and note subdivision support.",
  applicationCategory: "MusicApplication",
  operatingSystem: "Web Browser",
  isPartOf: { "@type": "WebSite", name: "Andy'K Music Lab", url: "https://lab.djandykofficial.com" },
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  author: { "@type": "Person", name: "DJ Andy'K", url: "https://djandykofficial.com" },
};

export default function MetronomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <MetronomeClient />
    </>
  );
}
