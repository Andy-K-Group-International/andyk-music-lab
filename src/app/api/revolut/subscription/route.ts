import { NextRequest, NextResponse } from "next/server";

const APP_URL = "https://lab.djandykofficial.com";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

const PLANS = {
  studio:          { amount: 4900,  description: "Studio Pass — Andy'K Music Lab" },       // £49/mo
  pro:             { amount: 19900, description: "Pro Pass — Andy'K Music Lab" },           // £199/yr
  tool_mastering:  { amount: 1900,  description: "Mastering Tool — Andy'K Music Lab" },    // £19/mo
  tool_bpm:        { amount: 900,   description: "BPM + Key Detector — Andy'K Music Lab" }, // £9/mo
  tool_planner:    { amount: 1200,  description: "DJ Set Planner — Andy'K Music Lab" },    // £12/mo
  tool_comparator: { amount: 900,   description: "Track Comparator — Andy'K Music Lab" },  // £9/mo
  tool_chord:      { amount: 900,   description: "Chord Generator — Andy'K Music Lab" },   // £9/mo
  tool_metronome:  { amount: 300,   description: "Metronome — Andy'K Music Lab" },         // £3/mo
  tool_loudness:   { amount: 900,   description: "Loudness Meter — Andy'K Music Lab" },    // £9/mo
  tool_stems:      { amount: 1200,  description: "Stem Splitter — Andy'K Music Lab" },     // £12/mo
} as const;

type SubscriptionPlan = keyof typeof PLANS;

function sbHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` };
}

async function applyAndMarkCode(code: string, email?: string): Promise<number> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/discount_codes?code=eq.${encodeURIComponent(code)}&used=eq.false&select=discount_percent&limit=1`,
    { headers: sbHeaders(), cache: "no-store" }
  );
  const rows: { discount_percent: number }[] = res.ok ? await res.json() : [];
  if (!rows.length) return 0;

  await fetch(
    `${SUPABASE_URL}/rest/v1/discount_codes?code=eq.${encodeURIComponent(code)}`,
    {
      method: "PATCH",
      headers: { ...sbHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify({ used: true, used_by_email: email ?? null, used_at: new Date().toISOString() }),
    }
  );
  return rows[0].discount_percent;
}

export async function POST(req: NextRequest) {
  const { plan, discount_code } = await req.json().catch(() => ({}));
  if (!plan || !(plan in PLANS)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const secret = process.env.REVOLUT_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Revolut not configured" }, { status: 500 });

  const planConfig = PLANS[plan as SubscriptionPlan];
  let amount: number = planConfig.amount;

  if (discount_code) {
    const pct = await applyAndMarkCode(discount_code.trim().toUpperCase());
    if (pct > 0) amount = Math.round(amount * (1 - pct / 100));
  }

  const res = await fetch("https://merchant.revolut.com/api/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      "Revolut-Api-Version": "2024-09-01",
      Accept: "application/json",
    },
    body: JSON.stringify({
      amount,
      currency: "GBP",
      description: planConfig.description,
      redirect_url: `${APP_URL}/success?plan=${plan}`,
      cancel_url:   `${APP_URL}/payment-failed`,
      metadata: { plan },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[revolut/subscription]", res.status, err);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }

  const order = await res.json();
  const checkout_url = order.checkout_url ?? `https://checkout.revolut.com/pay/${order.public_id}`;
  return NextResponse.json({ checkout_url, order_id: order.id });
}
