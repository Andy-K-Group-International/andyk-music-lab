import type { Metadata } from "next";
import { Suspense } from "react";
import SuccessClient from "./SuccessClient";

export const metadata: Metadata = {
  title: "Payment Successful — Andy'K Music Lab",
  robots: { index: false, follow: false },
};

export default function SuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <SuccessClient />
    </Suspense>
  );
}
