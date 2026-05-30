import type { Metadata } from "next";
import LoudnessMeterClient from "./LoudnessMeterClient";
import { requirePlanAccess } from "@/lib/auth";

const URL = "https://lab.djandykofficial.com/loudness-meter";

export const metadata: Metadata = {
  title: "Loudness Meter",
  description: "Real-time LUFS meter from microphone or audio file. Displays momentary, short-term, and integrated LUFS with visual meters and platform target lines for Spotify, Apple Music, YouTube, and broadcast.",
  alternates: { canonical: URL },
  openGraph: { type: "website", url: URL, siteName: "Andy'K Music Lab", title: "Loudness Meter — Andy'K Music Lab", description: "Real-time LUFS metering from microphone or file. Momentary, short-term, and integrated LUFS with Spotify, Apple, and YouTube target lines.", images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Loudness Meter" }] },
  twitter: { card: "summary_large_image", title: "Loudness Meter — Andy'K Music Lab", description: "Real-time LUFS meter from mic or file. Platform target lines included.", images: ["/og-image.jpg"] },
};

const jsonLd = { "@context": "https://schema.org", "@type": "WebApplication", name: "LUFS Loudness Meter", url: URL, description: "Real-time LUFS loudness metering tool supporting microphone input and audio file analysis with platform-specific target levels.", applicationCategory: "MusicApplication", operatingSystem: "Web Browser", isPartOf: { "@type": "WebSite", name: "Andy'K Music Lab", url: "https://lab.djandykofficial.com" }, offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" }, author: { "@type": "Person", name: "DJ Andy'K", url: "https://djandykofficial.com" } };

export default async function LoudnessMeterPage() {
  await requirePlanAccess("loudness-meter");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LoudnessMeterClient />
    </>
  );
}
