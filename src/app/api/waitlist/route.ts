import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const FROM = "noreply@andykgroup.com";

const PLAN_LABELS: Record<string, string> = {
  single: "Single Session — £49 one-time",
  studio: "Studio Pass — £19/month",
  pro:    "Pro Pass — £149/year",
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

// ── Email helpers ─────────────────────────────────────────────────────────────

const HEADER = `<tr><td style="background:#111111;padding:22px 32px;"><span style="font-family:'Courier New',Courier,monospace;font-size:15px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Andy&rsquo;K</span><span style="font-family:'Courier New',Courier,monospace;color:rgba(255,255,255,0.25);margin:0 10px;">|</span><span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:500;color:rgba(255,255,255,0.65);">Music Lab</span></td></tr>`;
const FOOTER = `<tr><td style="background:#D9D9D9;padding:14px 32px;"><p style="margin:0;font-size:11px;color:#525252;font-family:'Courier New',Courier,monospace;letter-spacing:0.04em;">lab.djandykofficial.com &nbsp;&middot;&nbsp; Andy&rsquo;K Group International LTD</p></td></tr>`;

function wrap(inner: string) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#F5F5F5;font-family:Arial,Helvetica,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 16px;"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #D9D9D9;overflow:hidden;">${HEADER}${inner}${FOOTER}</table></td></tr></table></body></html>`;
}

function confirmationHtml(email: string, name: string | null, planLabel: string) {
  const displayName = name || email.split("@")[0];
  return wrap(`<tr><td style="padding:36px 32px 32px;"><p style="margin:0 0 4px;font-size:11px;font-family:'Courier New',Courier,monospace;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#A8A8A8;">Waitlist confirmed</p><h1 style="margin:0 0 22px;font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#111111;line-height:1.15;">You&rsquo;re on the list!</h1><p style="margin:0 0 14px;font-size:15px;color:#111111;line-height:1.7;">Hi <strong>${displayName}</strong>, you&rsquo;re on the waitlist for Andy&rsquo;K Music Lab. We&rsquo;ll email you the moment we go live.</p><p style="margin:0 0 28px;font-size:14px;color:#525252;line-height:1.7;">Plan: <strong style="color:#111111;">${planLabel}</strong></p><a href="https://lab.djandykofficial.com" style="display:inline-block;padding:13px 26px;background:#111111;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">Visit Andy&rsquo;K Music Lab &rarr;</a></td></tr>`);
}

function adminHtml(email: string, name: string | null, planLabel: string, timestamp: string) {
  return wrap(`<tr><td style="padding:32px 32px 28px;"><p style="margin:0 0 4px;font-size:11px;font-family:'Courier New',Courier,monospace;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#A8A8A8;">New Waitlist Signup</p><h1 style="margin:0 0 24px;font-size:22px;font-weight:800;letter-spacing:-0.03em;color:#111111;">${planLabel}</h1><table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #D9D9D9;border-radius:8px;overflow:hidden;margin-bottom:28px;"><tr style="background:#F5F5F5;"><td style="padding:9px 16px;font-size:10px;font-family:'Courier New',Courier,monospace;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#A8A8A8;border-bottom:1px solid #D9D9D9;">Field</td><td style="padding:9px 16px;font-size:10px;font-family:'Courier New',Courier,monospace;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#A8A8A8;border-bottom:1px solid #D9D9D9;">Value</td></tr>${[["Name",name||"—"],["Email",email],["Plan",planLabel],["Signed up",timestamp]].map(([f,v],i)=>`<tr style="${i%2===1?"background:#FAFAFA;":""}"><td style="padding:11px 16px;font-size:13px;color:#525252;border-bottom:1px solid #F0F0F0;">${f}</td><td style="padding:11px 16px;font-size:13px;font-weight:600;color:#111111;border-bottom:1px solid #F0F0F0;">${v}</td></tr>`).join("")}</table></td></tr>`);
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

  const planLabel = PLAN_LABELS[plan] ?? "Studio Pass — £19/month";
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
