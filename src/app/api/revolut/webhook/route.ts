import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function sbHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return {
    "Content-Type": "application/json",
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
}

function verifySignature(rawBody: string, sigHeader: string, secret: string): boolean {
  // Supports both "v1=<hex>" and "v1=<timestamp>.<hex>"
  const match = sigHeader.match(/v1=(?:(\d+)\.)?([a-f0-9]+)/i);
  if (!match) return false;
  const [, timestamp, hexSig] = match;
  const payload = timestamp ? `${timestamp}.${rawBody}` : rawBody;
  try {
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    if (expected.length !== hexSig.length) return false;
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(hexSig, "hex"));
  } catch {
    return false;
  }
}

async function markPaid(email: string, orderId: string) {
  const paid_at = new Date().toISOString();

  // Try to update existing waitlist entry
  const patchRes = await fetch(
    `${SUPABASE_URL}/rest/v1/waitlist?email=eq.${encodeURIComponent(email)}`,
    {
      method: "PATCH",
      headers: { ...sbHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify({ paid: true, paid_at, revolut_order_id: orderId }),
    }
  );

  // If nothing was updated, upsert so the payment is always recorded
  const range = patchRes.headers.get("content-range") ?? "";
  const updated = parseInt(range.split("/")[1] ?? "0", 10);
  if (!isNaN(updated) && updated === 0) {
    await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
      method: "POST",
      headers: { ...sbHeaders(), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        email,
        plan: "unknown",
        paid: true,
        paid_at,
        revolut_order_id: orderId,
      }),
    });
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const webhookSecret = process.env.REVOLUT_WEBHOOK_SECRET;

  if (webhookSecret) {
    const sigHeader = req.headers.get("Revolut-Signature") ?? "";
    if (!verifySignature(rawBody, sigHeader, webhookSecret)) {
      console.error("[revolut/webhook] signature mismatch");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.event as string;
  if (event !== "ORDER_COMPLETED") {
    return NextResponse.json({ ok: true });
  }

  const order = (payload.order ?? {}) as Record<string, unknown>;
  const orderId = (order.id ?? payload.order_id ?? "") as string;

  // Revolut may place customer email in different fields depending on API version
  const email =
    (order.email as string | undefined) ??
    ((order.customer as Record<string, unknown> | undefined)?.email as string | undefined) ??
    (order.customer_email as string | undefined) ??
    "";

  if (!email) {
    console.error("[revolut/webhook] no email in ORDER_COMPLETED payload", JSON.stringify(payload));
    return NextResponse.json({ ok: true });
  }

  await markPaid(email.toLowerCase().trim(), orderId);

  return NextResponse.json({ ok: true });
}
