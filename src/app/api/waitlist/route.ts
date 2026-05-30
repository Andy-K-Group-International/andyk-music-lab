import { NextRequest, NextResponse } from "next/server";
import { confirmationHtml, adminHtml } from "@/lib/email";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const FROM = "noreply@andykgroup.com";

const PLAN_LABELS: Record<string, string> = {
  single: "Single Session — £49 one-time",
  studio: "Studio Pass — £29/month",
  pro:    "Pro Pass — £199/year",
};

function sbHeaders(serviceRole = false) {
  const key = serviceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY!
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return {
    "Content-Type": "application/json",
    "apikey": key,
    "Authorization": `Bearer ${key}`,
  };
}

async function sendEmail(payload: object) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  });
}

// ── POST /api/waitlist — signup ───────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { email, name, plan } = await req.json().catch(() => ({}));
  if (!email) return NextResponse.json({ ok: false, error: "email required" }, { status: 400 });

  const emailClean = email.trim().toLowerCase();
  const nameClean  = name?.trim() || null;

  const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
    method: "POST",
    headers: { ...sbHeaders(true), "Prefer": "return=minimal" },
    body: JSON.stringify({ email: emailClean, name: nameClean, plan: plan || "studio" }),
  });

  if (sbRes.status === 409) {
    return NextResponse.json({ ok: false, duplicate: true, error: "You're already on the list" }, { status: 409 });
  }
  if (!sbRes.ok) return NextResponse.json({ ok: false, error: "db error" }, { status: 500 });

  const planLabel = PLAN_LABELS[plan] ?? "Studio Pass — £29/month";
  const timestamp = new Date().toLocaleString("en-GB", { timeZone: "Europe/London", dateStyle: "medium", timeStyle: "short" });

  await Promise.allSettled([
    sendEmail({ from: FROM, to: emailClean, subject: "You're on the list — Andy'K Music Lab", html: confirmationHtml(emailClean, nameClean, planLabel) }),
    sendEmail({ from: FROM, to: "ceo@andykgroup.com", subject: `New waitlist signup — ${plan || "studio"}`, html: adminHtml(emailClean, nameClean, planLabel, timestamp) }),
  ]);

  return NextResponse.json({ ok: true });
}

// ── GET /api/waitlist — list all (admin) ─────────────────────────────────────

export async function GET() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/waitlist?select=*&order=created_at.desc`,
    { headers: sbHeaders(true), cache: "no-store" }
  );
  if (!res.ok) return NextResponse.json({ ok: false, entries: [] }, { status: 500 });
  const entries = await res.json();
  return NextResponse.json({ ok: true, entries });
}
