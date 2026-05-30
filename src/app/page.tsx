import type { Metadata } from "next";
import HomeClient from "./HomeClient";

const SITE_URL = "https://lab.djandykofficial.com";

export const metadata: Metadata = {
  title: "Andy'K Music Lab — Free Audio Mastering, BPM & Key Detector",
  description:
    "Free professional audio tools by DJ Andy'K. Master tracks to Spotify -14 LUFS, detect BPM & key with Camelot Wheel, plan DJ sets harmonically. 100% browser-based — your audio never leaves your device.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Andy'K Music Lab",
    title: "Andy'K Music Lab — Free Professional Audio Tools",
    description:
      "Free audio mastering, BPM & key detection, DJ set planning and more. Built by DJ Andy'K. 100% browser-based — no uploads, no accounts.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Andy'K Music Lab" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Andy'K Music Lab — Free Professional Audio Tools",
    description:
      "Free audio mastering, BPM & key detection, DJ set planning. 100% browser-based.",
    images: ["/og-image.jpg"],
  },
};

export default function LandingPage() {
  return <HomeClient />;
}
