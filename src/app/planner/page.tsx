import type { Metadata } from "next";
import PlannerClient from "./PlannerClient";

export const metadata: Metadata = {
  title: "DJ Set Planner",
  description:
    "Build harmonically perfect DJ sets using the Camelot Wheel. Enter your tracks and get an optimized playlist with transition analysis.",
};

export default function PlannerPage() {
  return <PlannerClient />;
}
