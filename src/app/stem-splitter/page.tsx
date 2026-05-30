import type { Metadata } from "next";
import StemSplitterClient from "./StemSplitterClient";

export const metadata: Metadata = {
  title: "Stem Splitter",
  description: "Split audio into Bass, Mids, and Highs stems using browser-based frequency filtering. Download each stem as WAV.",
};

export default function StemSplitterPage() {
  return <StemSplitterClient />;
}
