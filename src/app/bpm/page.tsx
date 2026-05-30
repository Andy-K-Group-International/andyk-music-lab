import type { Metadata } from "next";
import BpmClient from "./BpmClient";

const URL = "https://lab.djandykofficial.com/bpm";

export const metadata: Metadata = {
  title: "BPM + Key Detector",
  description:
    "Free browser-based BPM and musical key detection. Upload MP3 or WAV for instant BPM, key, Camelot Wheel code, danceability score, and energy analysis. No upload required.",
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    url: URL,
    siteName: "Andy'K Music Lab",
    title: "BPM + Key Detector — Andy'K Music Lab",
    description:
      "Detect BPM and musical key instantly. Get Camelot Wheel position, danceability score, and energy analysis — all in your browser.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "BPM + Key Detector" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BPM + Key Detector — Andy'K Music Lab",
    description: "Instant BPM, key, and Camelot Wheel detection. 100% browser-based.",
    images: ["/og-image.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "BPM + Key Detector",
  url: URL,
  description: "Free browser-based BPM and musical key detection tool using the Krumhansl-Schmuckler algorithm and onset autocorrelation.",
  applicationCategory: "MusicApplication",
  operatingSystem: "Web Browser",
  isPartOf: { "@type": "WebSite", name: "Andy'K Music Lab", url: "https://lab.djandykofficial.com" },
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  author: { "@type": "Person", name: "DJ Andy'K", url: "https://djandykofficial.com" },
};

export default function BpmPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BpmClient />
    </>
  );
}
