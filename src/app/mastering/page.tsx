import type { Metadata } from "next";
import MasteringClient from "./MasteringClient";

export const metadata: Metadata = {
  title: "Mastering Tool",
  description:
    "Free online audio mastering — −14 LUFS normalization, EQ, and −0.3 dBTP limiting. Runs locally in your browser.",
};

export default function MasteringPage() {
  return <MasteringClient />;
}
