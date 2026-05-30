import type { Metadata } from "next";
import PlannerClient from "./PlannerClient";
import { requirePlanAccess } from "@/lib/auth";

const URL = "https://lab.djandykofficial.com/planner";

export const metadata: Metadata = {
  title: "DJ Set Planner",
  description: "Build harmonically perfect DJ sets using the Camelot Wheel. Add tracks, auto-sort by key compatibility, visualise energy flow, and export Rekordbox XML for Pioneer DJ software.",
  alternates: { canonical: URL },
  openGraph: { type: "website", url: URL, siteName: "Andy'K Music Lab", title: "DJ Set Planner — Andy'K Music Lab", description: "Plan harmonically perfect DJ sets with Camelot Wheel compatibility. Auto-sort tracks, view energy flow, and export Rekordbox XML.", images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "DJ Set Planner" }] },
  twitter: { card: "summary_large_image", title: "DJ Set Planner — Andy'K Music Lab", description: "Harmonic DJ set planning with Camelot Wheel. Export Rekordbox XML.", images: ["/og-image.jpg"] },
};

const jsonLd = { "@context": "https://schema.org", "@type": "WebApplication", name: "DJ Set Planner", url: URL, description: "Plan harmonically perfect DJ sets using the Camelot Wheel algorithm. Supports Rekordbox XML export.", applicationCategory: "MusicApplication", operatingSystem: "Web Browser", isPartOf: { "@type": "WebSite", name: "Andy'K Music Lab", url: "https://lab.djandykofficial.com" }, offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" }, author: { "@type": "Person", name: "DJ Andy'K", url: "https://djandykofficial.com" } };

export default async function PlannerPage() {
  await requirePlanAccess("planner");
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PlannerClient />
    </>
  );
}
