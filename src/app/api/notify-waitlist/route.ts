import { NextRequest, NextResponse } from "next/server";

const FROM = "noreply@andykgroup.com";
const SUPABASE_LINK = "https://supabase.com/dashboard/project/kbdvsqdctgeirakpctoz/editor";

const PLAN_LABELS: Record<string, string> = {
  single: "Single Session — £49 one-time",
  studio: "Studio Pass — £19/month",
  pro:    "Pro Pass — £149/year",
};

async function sendEmail(apiKey: string, payload: object) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });
}

// ── Shared HTML blocks ────────────────────────────────────────────────────────

const HEADER = `
<tr>
  <td style="background:#111111;padding:22px 32px;">
    <span style="font-family:'Courier New',Courier,monospace;font-size:15px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Andy&rsquo;K</span>
    <span style="font-family:'Courier New',Courier,monospace;color:rgba(255,255,255,0.25);margin:0 10px;">|</span>
    <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:500;color:rgba(255,255,255,0.65);">Music Lab</span>
  </td>
</tr>`;

const FOOTER = `
<tr>
  <td style="background:#D9D9D9;padding:14px 32px;">
    <p style="margin:0;font-size:11px;color:#525a70;font-family:'Courier New',Courier,monospace;letter-spacing:0.04em;">
      lab.djandykofficial.com &nbsp;&middot;&nbsp; Andy&rsquo;K Group International LTD
    </p>
  </td>
</tr>`;

function wrap(inner: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #D9D9D9;overflow:hidden;">
        ${HEADER}
        ${inner}
        ${FOOTER}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Admin notification ────────────────────────────────────────────────────────

function adminHtml(email: string, name: string | null, planLabel: string, timestamp: string): string {
  const rows = [
    ["Name",      name || "—"],
    ["Email",     email],
    ["Plan",      planLabel],
    ["Signed up", timestamp],
  ];

  const tableRows = rows.map(([field, value], i) => `
    <tr style="${i % 2 === 1 ? "background:#FAFAFA;" : ""}">
      <td style="padding:11px 16px;font-size:13px;color:#525a70;border-bottom:1px solid #F0F0F0;white-space:nowrap;">${field}</td>
      <td style="padding:11px 16px;font-size:13px;font-weight:600;color:#111111;border-bottom:1px solid #F0F0F0;">${value}</td>
    </tr>`).join("");

  return wrap(`
    <tr><td style="padding:32px 32px 28px;">
      <p style="margin:0 0 4px;font-size:11px;font-family:'Courier New',Courier,monospace;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#A8A8A8;">New Waitlist Signup</p>
      <h1 style="margin:0 0 24px;font-size:22px;font-weight:800;letter-spacing:-0.03em;color:#111111;line-height:1.2;">${planLabel}</h1>

      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #D9D9D9;border-radius:8px;overflow:hidden;margin-bottom:28px;">
        <tr style="background:#F5F5F5;">
          <td style="padding:9px 16px;font-size:10px;font-family:'Courier New',Courier,monospace;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#A8A8A8;border-bottom:1px solid #D9D9D9;">Field</td>
          <td style="padding:9px 16px;font-size:10px;font-family:'Courier New',Courier,monospace;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#A8A8A8;border-bottom:1px solid #D9D9D9;">Value</td>
        </tr>
        ${tableRows}
      </table>

      <a href="${SUPABASE_LINK}" style="display:inline-block;padding:11px 22px;background:#111111;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;border-radius:8px;letter-spacing:0.01em;">View in Supabase &rarr;</a>
    </td></tr>`);
}

// ── User confirmation ─────────────────────────────────────────────────────────

function userHtml(email: string, name: string | null, planLabel: string): string {
  const displayName = name || email.split("@")[0];

  return wrap(`
    <tr><td style="padding:36px 32px 32px;">
      <p style="margin:0 0 4px;font-size:11px;font-family:'Courier New',Courier,monospace;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#A8A8A8;">Waitlist confirmed</p>
      <h1 style="margin:0 0 22px;font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#111111;line-height:1.15;">You&rsquo;re on the waitlist!</h1>

      <p style="margin:0 0 14px;font-size:15px;color:#111111;line-height:1.7;">
        Thank you, <strong>${displayName}</strong>! You&rsquo;re on the waitlist for
        <strong>${planLabel}</strong> access.
      </p>
      <p style="margin:0 0 30px;font-size:15px;color:#525a70;line-height:1.7;">
        We&rsquo;ll contact you at <strong style="color:#111111;">${email}</strong> when your access opens.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;border:1px solid #D9D9D9;border-radius:8px;margin-bottom:30px;">
        <tr><td style="padding:18px 20px;">
          <p style="margin:0 0 5px;font-size:10px;font-family:'Courier New',Courier,monospace;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#A8A8A8;">Your plan</p>
          <p style="margin:0;font-size:15px;font-weight:700;color:#111111;">${planLabel}</p>
        </td></tr>
      </table>

      <a href="https://lab.djandykofficial.com" style="display:inline-block;padding:13px 26px;background:#111111;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;letter-spacing:0.01em;">Visit Andy&rsquo;K Music Lab &rarr;</a>
    </td></tr>`);
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { email, name, plan } = await req.json().catch(() => ({}));
  if (!email) return NextResponse.json({ ok: false }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: true, notified: false });

  const planLabel   = PLAN_LABELS[plan] ?? "Studio Pass — £19/month";
  const displayPlan = plan === "single" ? "Single Session" : plan === "pro" ? "Pro Pass" : "Studio Pass";
  const timestamp   = new Date().toLocaleString("en-GB", { timeZone: "Europe/London", dateStyle: "medium", timeStyle: "short" });

  try {
    await Promise.all([
      sendEmail(apiKey, {
        from:    FROM,
        to:      "ceo@andykgroup.com",
        subject: `🎵 New Lab Waitlist — ${displayPlan} — ${email}`,
        html:    adminHtml(email, name, planLabel, timestamp),
      }),
      sendEmail(apiKey, {
        from:    FROM,
        to:      email,
        subject: "You're on the Andy'K Music Lab waitlist",
        html:    userHtml(email, name, planLabel),
      }),
    ]);
  } catch {
    // Emails failed — signup already saved in Supabase
  }

  return NextResponse.json({ ok: true, notified: true });
}
