import type { Metadata } from "next";
import TrackComparatorClient from "./TrackComparatorClient";

export const metadata: Metadata = {
  title: "Track Comparator",
  description: "Compare two audio tracks side-by-side: LUFS, peak, dynamic range, BPM, key, and Camelot. Browser-based, no upload.",
};

export default function TrackComparatorPage() {
  return <TrackComparatorClient />;
}
