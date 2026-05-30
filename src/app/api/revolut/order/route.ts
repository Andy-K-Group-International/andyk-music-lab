import { NextRequest, NextResponse } from "next/server";

const APP_URL = "https://lab.djandykofficial.com";

export async function POST(req: NextRequest) {
  const { plan } = await req.json().catch(() => ({}));
  if (plan !== "single") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const secret = process.env.REVOLUT_SECRET_KEY;
  if (!secret) {
    return NextResponse.json({ error: "Revolut not configured" }, { status: 500 });
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
      amount: 4900,
      currency: "GBP",
      description: "Single Session — Andy'K Music Lab",
      redirect_url: `${APP_URL}/success?plan=single`,
      metadata: { plan: "single" },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[revolut/order]", res.status, err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  const order = await res.json();
  const checkout_url =
    order.checkout_url ?? `https://checkout.revolut.com/pay/${order.public_id}`;

  return NextResponse.json({ checkout_url });
}
