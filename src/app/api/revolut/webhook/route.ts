import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function sbHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` };
}

function verifySignature(rawBody: string, sigHeader: string, secret: string): boolean {
  const match = sigHeader.match(/v1=(?:(\d+)\.)?([a-f0-9]+)/i);
  if (!match) return false;
  const [, timestamp, hexSig] = match;
  const payload = timestamp ? `${timestamp}.${rawBody}` : rawBody;
  try {
    const expected = createHmac("sha256", secret).update(payload).digest("hex");
    if (expected.length !== hexSig.length) return false;
    return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(hexSig, "hex"));
  } catch { return false; }
}

const PLAN_TOOLS: Record<string, string[]> = {
  single:  ["mastering"],
  studio:  ["mastering","bpm","planner","track-comparator","chord-generator","metronome","loudness-meter","stem-splitter"],
  pro:     ["mastering","bpm","planner","track-comparator","chord-generator","metronome","loudness-meter","stem-splitter"],
};

async function handleOrderCompleted(order: Record<string, unknown>, orderId: string) {
  const email = (
    (order.email as string | undefined) ??
    ((order.customer as Record<string,unknown>|undefined)?.email as string|undefined) ??
    (order.customer_email as string | undefined) ?? ""
  ).toLowerCase().trim();

  const plan = ((order.metadata as Record<string,unknown>|undefined)?.plan as string|undefined) ?? "";
  if (!email) { console.error("[webhook] no email in payload"); return; }

  const now = new Date().toISOString();
  const planExpiresAt = plan === "pro"
    ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    : plan === "studio"
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    : null;

  // 1. Mark waitlist entry as paid
  await fetch(`${SUPABASE_URL}/rest/v1/waitlist?email=eq.${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers: { ...sbHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify({ paid: true, paid_at: now, revolut_order_id: orderId }),
  });

  // 2. Try to update existing profile (if user already registered)
  const profilePatch = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`,
    {
      method: "PATCH",
      headers: { ...sbHeaders(), Prefer: "return=representation" },
      body: JSON.stringify({ plan, plan_started_at: now, plan_expires_at: planExpiresAt, revolut_order_id: orderId }),
    }
  );

  if (profilePatch.ok) {
    const updatedProfiles: { id: string }[] = await profilePatch.json().catch(() => []);
    if (updatedProfiles.length > 0 && plan && PLAN_TOOLS[plan]) {
      const userId = updatedProfiles[0].id;
      // Delete old tool_access and re-grant
      await fetch(`${SUPABASE_URL}/rest/v1/tool_access?user_id=eq.${userId}`, {
        method: "DELETE",
        headers: sbHeaders(),
      });
      await fetch(`${SUPABASE_URL}/rest/v1/tool_access`, {
        method: "POST",
        headers: { ...sbHeaders(), Prefer: "return=minimal" },
        body: JSON.stringify(PLAN_TOOLS[plan].map(tool_name => ({
          user_id: userId, tool_name, granted_at: now, expires_at: planExpiresAt,
        }))),
      });
    }
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
  try { payload = JSON.parse(rawBody); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (payload.event === "ORDER_COMPLETED") {
    const order = (payload.order ?? {}) as Record<string, unknown>;
    const orderId = (order.id ?? payload.order_id ?? "") as string;
    await handleOrderCompleted(order, orderId);
  }

  return NextResponse.json({ ok: true });
}
