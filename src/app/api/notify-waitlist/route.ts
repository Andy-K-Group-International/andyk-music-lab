import { NextRequest, NextResponse } from "next/server";

const FROM = "noreply@andykgroup.com";
const SUPABASE_LINK = "https://supabase.com/dashboard/project/kbdvsqdctgeirakpctoz/editor";

const PLAN_LABELS: Record<string, string> = {
  single: "Single Session — £49 one-time",
  studio: "Studio Pass — £19/month",
  pro:    "Pro Pass — £149/year",
};

async function sendEmail(apiKey: string, payload: object) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  return res;
}

function adminHtml(email: string, name: string | null, plan: string, planLabel: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #E0E0E0;overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:#111111;padding:20px 32px;">
          <span style="font-family:monospace;font-size:14px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Andy&rsquo;K</span>
          <span style="font-family:monospace;color:rgba(255,255,255,0.3);margin:0 8px;">|</span>
          <span style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.7);">Music Lab</span>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="margin:0 0 4px;font-size:11px;font-family:monospace;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8b93a8;">New Waitlist Signup</p>
          <h1 style="margin:0 0 24px;font-size:22px;font-weight:800;letter-spacing:-0.03em;color:#111111;">
            ${planLabel}
          </h1>

          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E0E0E0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
            <tr style="background:#F5F5F5;">
              <td style="padding:10px 16px;font-size:11px;font-family:monospace;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8b93a8;border-bottom:1px solid #E0E0E0;">Field</td>
              <td style="padding:10px 16px;font-size:11px;font-family:monospace;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8b93a8;border-bottom:1px solid #E0E0E0;">Value</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;font-size:13px;color:#525a70;border-bottom:1px solid #F5F5F5;">Email</td>
              <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#111111;border-bottom:1px solid #F5F5F5;">${email}</td>
            </tr>
            <tr style="background:#FAFAFA;">
              <td style="padding:10px 16px;font-size:13px;color:#525a70;border-bottom:1px solid #F5F5F5;">Name</td>
              <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#111111;border-bottom:1px solid #F5F5F5;">${name || "—"}</td>
            </tr>
            <tr>
              <td style="padding:10px 16px;font-size:13px;color:#525a70;">Plan</td>
              <td style="padding:10px 16px;font-size:13px;font-weight:600;color:#111111;">${planLabel}</td>
            </tr>
          </table>

          <a href="${SUPABASE_LINK}" style="display:inline-block;padding:10px 20px;background:#111111;color:#ffffff;font-size:13px;font-weight:700;text-decoration:none;border-radius:8px;">View in Supabase →</a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:16px 32px;border-top:1px solid #F0F0F0;">
          <p style="margin:0;font-size:11px;color:#A8A8A8;font-family:monospace;">
            lab.djandykofficial.com &nbsp;&middot;&nbsp; Andy&rsquo;K Group International LTD
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function userHtml(email: string, name: string | null, planLabel: string): string {
  const displayName = name || email.split("@")[0];
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F5F5F5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #E0E0E0;overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:#111111;padding:20px 32px;">
          <span style="font-family:monospace;font-size:14px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">Andy&rsquo;K</span>
          <span style="font-family:monospace;color:rgba(255,255,255,0.3);margin:0 8px;">|</span>
          <span style="font-size:13px;font-weight:500;color:rgba(255,255,255,0.7);">Music Lab</span>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px 32px 28px;">
          <p style="margin:0 0 4px;font-size:11px;font-family:monospace;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#8b93a8;">You&rsquo;re in</p>
          <h1 style="margin:0 0 20px;font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#111111;line-height:1.15;">
            You&rsquo;re on the waitlist!
          </h1>
          <p style="margin:0 0 12px;font-size:15px;color:#525a70;line-height:1.65;">
            Thank you, <strong style="color:#111111;">${displayName}</strong>! You&rsquo;re on the waitlist for
            <strong style="color:#111111;">${planLabel}</strong> access.
          </p>
          <p style="margin:0 0 28px;font-size:15px;color:#525a70;line-height:1.65;">
            We&rsquo;ll contact you at <strong style="color:#111111;">${email}</strong> when your access opens.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;border-radius:8px;padding:20px;margin-bottom:28px;">
            <tr><td>
              <p style="margin:0 0 6px;font-size:12px;font-family:monospace;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8b93a8;">What&rsquo;s included</p>
              <p style="margin:0;font-size:14px;font-weight:600;color:#111111;">${planLabel}</p>
            </td></tr>
          </table>

          <a href="https://lab.djandykofficial.com" style="display:inline-block;padding:12px 24px;background:#111111;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">Visit Andy&rsquo;K Music Lab →</a>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:16px 32px;border-top:1px solid #F0F0F0;">
          <p style="margin:0;font-size:11px;color:#A8A8A8;font-family:monospace;">
            lab.djandykofficial.com &nbsp;&middot;&nbsp; Andy&rsquo;K Group International LTD
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  const { email, name, plan } = await req.json().catch(() => ({}));
  if (!email) return NextResponse.json({ ok: false }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: true, notified: false });
  }

  const planLabel = PLAN_LABELS[plan] ?? "Studio Pass — £19/month";
  const displayPlan = plan === "single" ? "Single Session" : plan === "pro" ? "Pro Pass" : "Studio Pass";

  try {
    await Promise.all([
      // Admin notification
      sendEmail(apiKey, {
        from: FROM,
        to: "ceo@andykgroup.com",
        subject: `New Lab Waitlist Signup — ${displayPlan} — ${email}`,
        html: adminHtml(email, name, plan, planLabel),
      }),
      // User confirmation
      sendEmail(apiKey, {
        from: FROM,
        to: email,
        subject: "You're on the Andy'K Music Lab waitlist",
        html: userHtml(email, name, planLabel),
      }),
    ]);
  } catch {
    // Emails failed — signup is still saved in Supabase
  }

  return NextResponse.json({ ok: true, notified: true });
}
