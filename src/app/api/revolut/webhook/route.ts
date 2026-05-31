import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { paymentFailedHtml } from "@/lib/email";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const FROM         = "noreply@andykgroup.com";

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

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  }).catch(err => console.error("[webhook] email error", err));
}

const PLAN_TOOLS: Record<string, string[]> = {
  single:          ["mastering"],
  studio:          ["mastering","bpm","planner","track-comparator","chord-generator","metronome","loudness-meter","stem-splitter"],
  pro:             ["mastering","bpm","planner","track-comparator","chord-generator","metronome","loudness-meter","stem-splitter"],
  tool_mastering:  ["mastering"],
  tool_bpm:        ["bpm"],
  tool_planner:    ["planner"],
  tool_comparator: ["track-comparator"],
  tool_chord:      ["chord-generator"],
  tool_metronome:  ["metronome"],
  tool_loudness:   ["loudness-meter"],
  tool_stems:      ["stem-splitter"],
};

function planExpiry(plan: string, fromDate = Date.now()): string | null {
  if (plan === "pro")    return new Date(fromDate + 365 * 24 * 60 * 60 * 1000).toISOString();
  if (plan === "studio" || plan.startsWith("tool_"))
                         return new Date(fromDate +  30 * 24 * 60 * 60 * 1000).toISOString();
  return null;
}

function extractEmail(data: Record<string, unknown>): string {
  return (
    (data.email as string | undefined) ??
    ((data.customer as Record<string,unknown>|undefined)?.email as string|undefined) ??
    (data.customer_email as string | undefined) ?? ""
  ).toLowerCase().trim();
}

function extractPlan(data: Record<string, unknown>): string {
  return ((data.metadata as Record<string,unknown>|undefined)?.plan as string|undefined) ?? "";
}

// ── ORDER_COMPLETED ────────────────────────────────────────────────────────────
async function handleOrderCompleted(order: Record<string, unknown>, orderId: string) {
  const email = extractEmail(order);
  const plan  = extractPlan(order);
  if (!email) { console.error("[webhook] ORDER_COMPLETED: no email"); return; }

  const now          = new Date().toISOString();
  const planExpiresAt = planExpiry(plan);

  // Mark waitlist entry as paid
  await fetch(`${SUPABASE_URL}/rest/v1/waitlist?email=eq.${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers: { ...sbHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify({ paid: true, paid_at: now, revolut_order_id: orderId }),
  });

  // Update existing profile if registered
  const profilePatch = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}`,
    {
      method: "PATCH",
      headers: { ...sbHeaders(), Prefer: "return=representation" },
      body: JSON.stringify({
        plan, plan_started_at: now, plan_expires_at: planExpiresAt,
        revolut_order_id: orderId, subscription_status: "active", plan_status: "active",
        expiry_warning_sent: false,
      }),
    }
  );

  if (profilePatch.ok) {
    const updated: { id: string }[] = await profilePatch.json().catch(() => []);
    if (updated.length > 0 && plan && PLAN_TOOLS[plan]) {
      const userId = updated[0].id;
      await fetch(`${SUPABASE_URL}/rest/v1/tool_access?user_id=eq.${userId}`, {
        method: "DELETE", headers: sbHeaders(),
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

// ── SUBSCRIPTION_RENEWED ───────────────────────────────────────────────────────
async function handleSubscriptionRenewed(payload: Record<string, unknown>) {
  const order = (payload.order ?? payload) as Record<string, unknown>;
  const email = extractEmail(order);
  if (!email) { console.error("[webhook] SUBSCRIPTION_RENEWED: no email"); return; }

  const now = new Date().toISOString();

  // Get current plan to calculate new expiry
  const profileRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id,plan,plan_expires_at&limit=1`,
    { headers: sbHeaders(), cache: "no-store" }
  );
  const profiles: { id: string; plan: string; plan_expires_at: string | null }[] =
    profileRes.ok ? await profileRes.json() : [];
  if (!profiles.length) return;

  const { id: userId, plan, plan_expires_at } = profiles[0];
  // Extend from existing expiry if still in future, otherwise from now
  const baseTime = plan_expires_at && new Date(plan_expires_at) > new Date()
    ? new Date(plan_expires_at).getTime()
    : Date.now();
  const newExpiry = planExpiry(plan, baseTime);

  await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: "PATCH",
    headers: { ...sbHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify({
      plan_expires_at: newExpiry, plan_status: "active", subscription_status: "active",
      expiry_warning_sent: false,
    }),
  });

  // Extend tool_access expiry
  if (newExpiry) {
    await fetch(`${SUPABASE_URL}/rest/v1/tool_access?user_id=eq.${userId}`, {
      method: "PATCH",
      headers: { ...sbHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify({ expires_at: newExpiry }),
    });
  }

  console.log("[webhook] SUBSCRIPTION_RENEWED", email, "new expiry:", newExpiry);
}

// ── SUBSCRIPTION_CANCELLED ────────────────────────────────────────────────────
async function handleSubscriptionCancelled(payload: Record<string, unknown>) {
  const order = (payload.order ?? payload) as Record<string, unknown>;
  const email = extractEmail(order);
  if (!email) { console.error("[webhook] SUBSCRIPTION_CANCELLED: no email"); return; }

  const profileRes = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id&limit=1`,
    { headers: sbHeaders(), cache: "no-store" }
  );
  const profiles: { id: string }[] = profileRes.ok ? await profileRes.json() : [];
  if (!profiles.length) return;

  // Keep access until existing expires_at — just update status
  await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${profiles[0].id}`, {
    method: "PATCH",
    headers: { ...sbHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify({ plan_status: "cancelled", subscription_status: "cancelled" }),
  });

  console.log("[webhook] SUBSCRIPTION_CANCELLED", email);
}

// ── PAYMENT_FAILED ────────────────────────────────────────────────────────────
async function handlePaymentFailed(payload: Record<string, unknown>) {
  const order = (payload.order ?? payload) as Record<string, unknown>;
  const email = extractEmail(order);
  if (!email) { console.error("[webhook] PAYMENT_FAILED: no email"); return; }

  await sendEmail(
    email,
    "Payment failed — Andy'K Music Lab",
    paymentFailedHtml()
  );
  console.log("[webhook] PAYMENT_FAILED email sent to", email);
}

// ── Main handler ──────────────────────────────────────────────────────────────
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

  const event = payload.event as string | undefined;
  const order = (payload.order ?? {}) as Record<string, unknown>;

  switch (event) {
    case "ORDER_COMPLETED": {
      const orderId = (order.id ?? payload.order_id ?? "") as string;
      await handleOrderCompleted(order, orderId);
      break;
    }
    case "SUBSCRIPTION_RENEWED":
      await handleSubscriptionRenewed(payload);
      break;
    case "SUBSCRIPTION_CANCELLED":
      await handleSubscriptionCancelled(payload);
      break;
    case "PAYMENT_FAILED":
      await handlePaymentFailed(payload);
      break;
    default:
      console.log("[revolut/webhook] unhandled event:", event);
  }

  return NextResponse.json({ ok: true });
}
