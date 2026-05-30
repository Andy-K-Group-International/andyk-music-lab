import type { Metadata } from "next";
import MetronomeClient from "./MetronomeClient";

export const metadata: Metadata = {
  title: "Metronome",
  description: "Browser metronome with tap tempo, time signatures, subdivisions, and Web Audio API click sounds.",
};

export default function MetronomePage() {
  return <MetronomeClient />;
}
