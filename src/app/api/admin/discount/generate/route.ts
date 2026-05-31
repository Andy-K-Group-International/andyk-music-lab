import { NextRequest, NextResponse } from "next/server";
import { personalDiscountHtml } from "@/lib/email";
import { createClient } from "@/lib/supabase/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ADMIN_EMAIL  = "ceo@andykgroup.com";
const FROM         = "noreply@andykgroup.com";

const PLAN_ABBR: Record<string, string> = {
  all:       "VIP",
  studio:    "STU",
  pro:       "PRO",
  single:    "SNG",
  mastering: "MAS",
  bpm:       "BPM",
  planner:   "PLN",
};

function sbHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` };
}

function randomChars(n: number): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
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

async function requireAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email === ADMIN_EMAIL;
}

// POST — generate and send a personalized discount code
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, discount_percent, plan_restriction, expiry_hours } = await req.json().catch(() => ({}));
  if (!email || !discount_percent) {
    return NextResponse.json({ error: "email and discount_percent required" }, { status: 400 });
  }

  const abbr      = PLAN_ABBR[plan_restriction ?? "all"] ?? "VIP";
  const code      = `ANDYK-${abbr}-${randomChars(6)}`;
  const expiryHours: number = expiry_hours ?? 72;
  const expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000).toISOString();
  const emailClean = email.trim().toLowerCase();

  const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/discount_codes`, {
    method: "POST",
    headers: { ...sbHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify({
      code,
      discount_percent,
      expires_at: expiresAt,
      plan_restriction: plan_restriction && plan_restriction !== "all" ? plan_restriction : null,
      created_for_email: emailClean,
    }),
  });

  if (!sbRes.ok) {
    console.error("[discount/generate]", sbRes.status, await sbRes.text());
    return NextResponse.json({ error: "Failed to create discount code" }, { status: 500 });
  }

  await sendEmail({
    from: FROM,
    to: emailClean,
    subject: "A personal discount from DJ Andy'K 🎧",
    html: personalDiscountHtml(discount_percent, code, expiryHours),
  });

  return NextResponse.json({ ok: true, code, expires_at: expiresAt });
}

// GET — list last 10 discount codes
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/discount_codes?select=*&order=created_at.desc&limit=10`,
    { headers: sbHeaders(), cache: "no-store" }
  );
  if (!res.ok) return NextResponse.json({ codes: [] }, { status: 500 });
  return NextResponse.json({ codes: await res.json() });
}
