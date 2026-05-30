import type { Metadata } from "next";
import ChordGeneratorClient from "./ChordGeneratorClient";

export const metadata: Metadata = {
  title: "Chord Generator",
  description: "Generate chord progressions for Trance, House, Pop, and Cinematic music. Shows chord names, notes, and piano voicings.",
};

export default function ChordGeneratorPage() {
  return <ChordGeneratorClient />;
}
