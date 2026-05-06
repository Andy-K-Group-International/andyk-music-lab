import type { Metadata } from "next";
import BpmClient from "./BpmClient";

export const metadata: Metadata = {
  title: "BPM + Key Detector",
  description:
    "Free browser-based BPM and musical key detection. Upload MP3 or WAV and get instant results including Camelot Wheel code.",
};

export default function BpmPage() {
  return <BpmClient />;
}
