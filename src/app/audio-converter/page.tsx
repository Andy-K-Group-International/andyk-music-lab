import type { Metadata } from "next";
import AudioConverterClient from "./AudioConverterClient";
import { requirePlanAccess } from "@/lib/auth";

const URL = "https://lab.djandykofficial.com/audio-converter";

export const metadata: Metadata = {
  title: "Audio Converter",
  description: "Convert between audio formats — WAV, MP3, FLAC, AAC input to WAV or MP3 output. 100% browser-based, nothing uploaded.",
  alternates: { canonical: URL },
  openGraph: { type: "website", url: URL, siteName: "Andy'K Music Lab", title: "Audio Converter — Andy'K Music Lab", description: "Convert WAV, MP3, FLAC, and AAC audio files in your browser. Export as 16-bit WAV or MP3 at 192/320 kbps. No upload required.", images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Audio Converter" }] },
  twitter: { card: "summary_large_image", title: "Audio Converter — Andy'K Music Lab", description: "Browser-based audio format conversion. WAV, MP3, FLAC, AAC — no upload.", images: ["/og-image.jpg"] },
};

const jsonLd = { "@context": "https://schema.org", "@type": "WebApplication", name: "Audio Converter", url: URL, description: "Convert audio between WAV, MP3, FLAC, and AAC formats entirely in the browser.", applicationCategory: "MusicApplication", operatingSystem: "Web Browser", isPartOf: { "@type": "WebSite", name: "Andy'K Music Lab", url: "https://lab.djandykofficial.com" }, author: { "@type": "Person", name: "DJ Andy'K", url: "https://djandykofficial.com" } };

export default async function AudioConverterPage() {
  await requirePlanAccess("audio-converter");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <AudioConverterClient />
    </>
  );
}
