import type { Metadata } from "next";
import EducationAccessForm from "./EducationAccessForm";

export const metadata: Metadata = {
  title: "Education Access",
  description: "Music schools, DJ courses and producer communities can apply for free or discounted access to Andy'K Music Lab for students. Browser-based audio tools for learning environments.",
  robots: { index: true, follow: true },
  openGraph: {
    title: "Education Access — Andy'K Music Lab",
    description: "Apply for limited free or discounted access to professional browser-based audio tools for music schools, DJ courses and producer communities.",
  },
};

export default function EducationAccessPage() {
  return <EducationAccessForm />;
}
