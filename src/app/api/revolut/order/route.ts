import { NextRequest, NextResponse } from "next/server";

const APP_URL = "https://lab.djandykofficial.com";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const BASE_AMOUNT = 7900; // £79 in pence

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
  const { plan, discount_code, email, accepted_pricing_terms, accepted_pricing_terms_at, accepted_pricing_terms_version } = await req.json().catch(() => ({}));
  if (accepted_pricing_terms !== true) {
    return NextResponse.json({ error: "pricing_terms_required" }, { status: 400 });
  }
  if (plan !== "single") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const secret = process.env.REVOLUT_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Revolut not configured" }, { status: 500 });

  let amount = BASE_AMOUNT;
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
        plan: "single",
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
      checkout_url: `${APP_URL}/success?plan=single&free=true`,
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
      description: "Single Session — Andy'K Music Lab",
      redirect_url: `${APP_URL}/success?plan=single`,
      cancel_url:   `${APP_URL}/payment-failed`,
      metadata: {
        plan: "single",
        accepted_pricing_terms: "true",
        accepted_pricing_terms_version: accepted_pricing_terms_version ?? "v1.0",
        accepted_pricing_terms_at: new Date().toISOString(),
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[revolut/order]", res.status, err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  const order = await res.json();
  const checkout_url = order.checkout_url ?? `https://checkout.revolut.com/pay/${order.public_id}`;
  return NextResponse.json({ checkout_url, order_id: order.id });
}
