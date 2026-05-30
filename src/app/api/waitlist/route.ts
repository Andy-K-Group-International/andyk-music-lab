import { NextRequest, NextResponse } from "next/server";
import { confirmationHtml, adminHtml } from "@/lib/email";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const FROM = "noreply@andykgroup.com";

const PLAN_LABELS: Record<string, string> = {
  single: "Single Session — £79 one-time",
  studio: "Studio Pass — £49/month",
  pro:    "Pro Pass — £199/year",
};

function sbHeaders(serviceRole = false) {
  const key = serviceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` };
}

async function sendEmail(payload: object) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  });
}

async function generateDiscountCode(): Promise<string> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/waitlist?select=id&limit=0`, {
      headers: { ...sbHeaders(true), Prefer: "count=exact" },
      cache: "no-store",
    });
    const range = res.headers.get("content-range") ?? "";
    const count = parseInt(range.split("/")[1] ?? "0", 10);
    const num = isNaN(count) ? 1 : count + 1;
    return `EARLYACCESS40-${String(num).padStart(3, "0")}`;
  } catch {
    return `EARLYACCESS40-${String(Date.now()).slice(-3)}`;
  }
}

// ── POST /api/waitlist — signup ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { email, name, plan } = await req.json().catch(() => ({}));
  if (!email) return NextResponse.json({ ok: false, error: "email required" }, { status: 400 });

  const emailClean = email.trim().toLowerCase();
  const nameClean  = name?.trim() || null;

  const discountCode = await generateDiscountCode();

  const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
    method: "POST",
    headers: { ...sbHeaders(true), Prefer: "return=minimal" },
    body: JSON.stringify({ email: emailClean, name: nameClean, plan: plan || "studio", discount_code: discountCode }),
  });

  if (sbRes.status === 409) {
    return NextResponse.json({ ok: false, duplicate: true, error: "You're already on the list" }, { status: 409 });
  }
  if (!sbRes.ok) return NextResponse.json({ ok: false, error: "db error" }, { status: 500 });

  const planLabel = PLAN_LABELS[plan] ?? "Studio Pass — £49/month";
  const timestamp = new Date().toLocaleString("en-GB", { timeZone: "Europe/London", dateStyle: "medium", timeStyle: "short" });

  await Promise.allSettled([
    sendEmail({ from: FROM, to: emailClean, subject: "You're on the list — Andy'K Music Lab", html: confirmationHtml(emailClean, nameClean, planLabel, discountCode) }),
    sendEmail({ from: FROM, to: "ceo@andykgroup.com", subject: `New waitlist signup — ${plan || "studio"}`, html: adminHtml(emailClean, nameClean, planLabel, timestamp) }),
  ]);

  return NextResponse.json({ ok: true });
}

// ── GET /api/waitlist — list all (admin) ─────────────────────────────────────

export async function GET(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || req.headers.get("x-admin-secret") !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/waitlist?select=*&order=created_at.desc`,
    { headers: sbHeaders(true), cache: "no-store" }
  );
  if (!res.ok) return NextResponse.json({ ok: false, entries: [] }, { status: 500 });
  return NextResponse.json({ ok: true, entries: await res.json() });
}
