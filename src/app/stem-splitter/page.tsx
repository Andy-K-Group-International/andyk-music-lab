import type { Metadata } from "next";
import StemSplitterClient from "./StemSplitterClient";

const URL = "https://lab.djandykofficial.com/stem-splitter";

export const metadata: Metadata = {
  title: "Stem Splitter",
  description:
    "Split audio into Bass, Mids, and Highs stems using browser-based frequency filtering. Download each stem as a 16-bit WAV file. No upload required — all processing runs locally.",
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    url: URL,
    siteName: "Andy'K Music Lab",
    title: "Stem Splitter — Andy'K Music Lab",
    description:
      "Split audio into Bass, Mids, and Highs stems with frequency-band filtering. Download each as WAV. 100% browser-based.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Stem Splitter" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stem Splitter — Andy'K Music Lab",
    description: "Split audio into Bass, Mids, Highs stems. Download as WAV.",
    images: ["/og-image.jpg"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Stem Splitter",
  url: URL,
  description: "Browser-based audio stem splitter using frequency-band filtering to separate Bass, Mids, and Highs into downloadable WAV stems.",
  applicationCategory: "MusicApplication",
  operatingSystem: "Web Browser",
  isPartOf: { "@type": "WebSite", name: "Andy'K Music Lab", url: "https://lab.djandykofficial.com" },
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  author: { "@type": "Person", name: "DJ Andy'K", url: "https://djandykofficial.com" },
};

export default function StemSplitterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <StemSplitterClient />
    </>
  );
}
