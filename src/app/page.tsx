import type { Metadata } from "next";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "Andy'K Music Lab — Professional tools for producers and DJs",
};

export default function LandingPage() {
  return <HomeClient />;
}
