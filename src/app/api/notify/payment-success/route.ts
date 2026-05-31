import { NextRequest, NextResponse } from "next/server";
import { paymentSuccessHtml } from "@/lib/email";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const FROM = "noreply@andykgroup.com";

const PLAN_LABELS: Record<string, string> = {
  single:          "Single Session",
  studio:          "Studio Pass",
  pro:             "Pro Pass",
  tool_mastering:  "Mastering Tool",
  tool_bpm:        "BPM + Key Detector",
  tool_planner:    "DJ Set Planner",
  tool_comparator: "Track Comparator",
  tool_chord:      "Chord Generator",
  tool_metronome:  "Metronome",
  tool_loudness:   "Loudness Meter",
  tool_stems:      "Stem Splitter",
};

function sbHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` };
}

async function sendEmail(to: string, planLabel: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from: FROM,
      to,
      subject: "Welcome to Andy'K Music Lab — Payment confirmed",
      html: paymentSuccessHtml(planLabel),
    }),
  });
}

export async function POST(req: NextRequest) {
  const { order_id } = await req.json().catch(() => ({}));
  if (!order_id) {
    return NextResponse.json({ error: "order_id required" }, { status: 400 });
  }

  const secret = process.env.REVOLUT_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Revolut not configured" }, { status: 500 });

  // 1. Verify order with Revolut server-side
  const revolut = await fetch(`https://merchant.revolut.com/api/orders/${order_id}`, {
    headers: {
      Authorization: `Bearer ${secret}`,
      "Revolut-Api-Version": "2024-09-01",
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!revolut.ok) {
    console.error("[payment-success] Revolut order fetch failed", revolut.status);
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const order = await revolut.json();

  // 2. Verify order is completed
  if (order.state !== "COMPLETED") {
    return NextResponse.json({ error: "Order not completed", state: order.state }, { status: 402 });
  }

  // 3. Extract email and plan from Revolut order (never trust client-supplied values)
  const email: string | null = order.email ?? order.customer?.email ?? null;
  const planKey: string = order.metadata?.plan ?? "";
  const planLabel = PLAN_LABELS[planKey] ?? "Music Lab Access";

  if (!email) {
    // Order verified but no email available — return plan name without sending email
    return NextResponse.json({ ok: true, plan_name: planLabel, email_sent: false });
  }

  // 4. Dedup — check if we already sent the payment email for this address
  const dedupRes = await fetch(
    `${SUPABASE_URL}/rest/v1/waitlist?email=eq.${encodeURIComponent(email)}&select=id,paid_email_sent&limit=1`,
    { headers: sbHeaders(), cache: "no-store" }
  );
  const dedupRows: { id: string; paid_email_sent: boolean }[] = dedupRes.ok ? await dedupRes.json() : [];

  if (dedupRows.length > 0 && dedupRows[0].paid_email_sent) {
    return NextResponse.json({ ok: true, plan_name: planLabel, already_sent: true });
  }

  // 5. Send welcome email
  await sendEmail(email, planLabel);

  // 6. Mark as sent in waitlist (if they're on it)
  if (dedupRows.length > 0) {
    await fetch(
      `${SUPABASE_URL}/rest/v1/waitlist?email=eq.${encodeURIComponent(email)}`,
      {
        method: "PATCH",
        headers: { ...sbHeaders(), Prefer: "return=minimal" },
        body: JSON.stringify({ paid_email_sent: true }),
      }
    );
  }

  return NextResponse.json({ ok: true, plan_name: planLabel, email_sent: true });
}
