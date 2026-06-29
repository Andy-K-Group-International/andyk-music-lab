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
  // Atomic: PATCH with &used=eq.false filter — only succeeds if the row is still unused.
  // Two concurrent requests with the same code: exactly one sees 1 row, the other sees 0.
  const patch = await fetch(
    `${SUPABASE_URL}/rest/v1/discount_codes?code=eq.${encodeURIComponent(code)}&used=eq.false`,
    {
      method: "PATCH",
      headers: { ...sbHeaders(), Prefer: "return=representation" },
      body: JSON.stringify({ used: true, used_by_email: email ?? null, used_at: new Date().toISOString() }),
    }
  );
  const rows: { discount_percent: number }[] = patch.ok ? await patch.json() : [];
  if (!rows.length) return 0;
  return rows[0].discount_percent;
}

export async function POST(req: NextRequest) {
  const { plan, discount_code, email, accepted_pricing_terms, accepted_pricing_terms_at, accepted_pricing_terms_version } = await req.json().catch(() => ({}));
  if (accepted_pricing_terms !== true) {
    return NextResponse.json({ error: "pricing_terms_required" }, { status: 400 });
  }
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

  if (amount <= 0) {
    const order_id = `free_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await fetch(`${SUPABASE_URL}/rest/v1/pending_access?on_conflict=order_id`, {
      method: "POST",
      headers: { ...sbHeaders(), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        order_id,
        plan,
        status: "paid",
        access_granted: false,
        email: typeof email === "string" ? email.trim().toLowerCase() : "",
        updated_at: new Date().toISOString(),
        ...(accepted_pricing_terms !== undefined && { accepted_pricing_terms }),
        ...(accepted_pricing_terms_at !== undefined && { accepted_pricing_terms_at }),
        ...(accepted_pricing_terms_version !== undefined && { accepted_pricing_terms_version }),
      }),
    });
    return NextResponse.json({
      checkout_url: `${APP_URL}/success?plan=${plan}&free=true`,
      order_id,
    });
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
      metadata: {
        plan,
        accepted_pricing_terms: "true",
        accepted_pricing_terms_version: accepted_pricing_terms_version ?? "v1.0",
        accepted_pricing_terms_at: new Date().toISOString(),
      },
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
