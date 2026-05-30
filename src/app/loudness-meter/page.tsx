import type { Metadata } from "next";
import LoudnessMeterClient from "./LoudnessMeterClient";

export const metadata: Metadata = {
  title: "Loudness Meter",
  description: "Real-time LUFS meter from microphone or audio file. Momentary, short-term, and integrated LUFS with platform target lines.",
};

export default function LoudnessMeterPage() {
  return <LoudnessMeterClient />;
}
