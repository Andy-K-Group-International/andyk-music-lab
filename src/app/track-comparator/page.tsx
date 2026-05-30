import type { Metadata } from "next";
import TrackComparatorClient from "./TrackComparatorClient";
import { requirePlanAccess } from "@/lib/auth";

const URL = "https://lab.djandykofficial.com/track-comparator";

export const metadata: Metadata = {
  title: "Track Comparator",
  description: "Compare two audio tracks side-by-side: LUFS, peak dBFS, dynamic range, BPM, musical key, Camelot code, and duration. Get an instant verdict on which track is louder or more dynamic.",
  alternates: { canonical: URL },
  openGraph: { type: "website", url: URL, siteName: "Andy'K Music Lab", title: "Track Comparator — Andy'K Music Lab", description: "Compare two audio files side-by-side: LUFS, peak, dynamic range, BPM, key, and Camelot. Browser-based, no upload.", images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Track Comparator" }] },
  twitter: { card: "summary_large_image", title: "Track Comparator — Andy'K Music Lab", description: "Side-by-side audio analysis: LUFS, BPM, key, dynamic range.", images: ["/og-image.jpg"] },
};

const jsonLd = { "@context": "https://schema.org", "@type": "WebApplication", name: "Track Comparator", url: URL, description: "Compare two audio tracks side-by-side across LUFS, BPM, key, Camelot, and dynamic range metrics.", applicationCategory: "MusicApplication", operatingSystem: "Web Browser", isPartOf: { "@type": "WebSite", name: "Andy'K Music Lab", url: "https://lab.djandykofficial.com" }, offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" }, author: { "@type": "Person", name: "DJ Andy'K", url: "https://djandykofficial.com" } };

export default async function TrackComparatorPage() {
  await requirePlanAccess("track-comparator");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TrackComparatorClient />
    </>
  );
}
