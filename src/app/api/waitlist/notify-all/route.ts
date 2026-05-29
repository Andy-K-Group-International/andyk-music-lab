import { NextResponse } from "next/server";

const SUPABASE_URL = "https://kbdvsqdctgeirakpctoz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZHZzcWRjdGdlaXJha3BjdG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MjIwNjQsImV4cCI6MjA5NTI5ODA2NH0.ORKf7RY7Rk6UrWKmrLDy1yF0mHmvBp9YQ0A0u8xIhkQ";
const FROM = "noreply@andykgroup.com";

function sbHeaders() {
  return {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
  };
}

function launchHtml(email: string, name: string | null) {
  const displayName = name || email.split("@")[0];
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#F5F5F5;font-family:Arial,Helvetica,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5;padding:40px 16px;"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #D9D9D9;overflow:hidden;"><tr><td style="background:#111111;padding:22px 32px;"><span style="font-family:'Courier New',Courier,monospace;font-size:15px;font-weight:700;color:#ffffff;">Andy&rsquo;K</span><span style="font-family:'Courier New',Courier,monospace;color:rgba(255,255,255,0.25);margin:0 10px;">|</span><span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:500;color:rgba(255,255,255,0.65);">Music Lab</span></td></tr><tr><td style="padding:36px 32px 32px;"><p style="margin:0 0 4px;font-size:11px;font-family:'Courier New',Courier,monospace;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#A8A8A8;">Now Live</p><h1 style="margin:0 0 22px;font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#111111;line-height:1.15;">Andy&rsquo;K Music Lab is now live</h1><p style="margin:0 0 28px;font-size:15px;color:#111111;line-height:1.7;">Hi <strong>${displayName}</strong>, Andy&rsquo;K Music Lab is now live. Join here: <a href="https://lab.djandykofficial.com" style="color:#111111;">lab.djandykofficial.com</a></p><a href="https://lab.djandykofficial.com" style="display:inline-block;padding:13px 26px;background:#111111;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:10px;">Open the Lab &rarr;</a></td></tr><tr><td style="background:#D9D9D9;padding:14px 32px;"><p style="margin:0;font-size:11px;color:#525252;font-family:'Courier New',Courier,monospace;letter-spacing:0.04em;">lab.djandykofficial.com &nbsp;&middot;&nbsp; Andy&rsquo;K Group International LTD</p></td></tr></table></td></tr></table></body></html>`;
}

// ── POST /api/waitlist/notify-all — send launch email to all unnotified ───────

export async function POST() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, error: "no api key" }, { status: 500 });

  // Fetch all unnotified
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/lab_waitlist?notified=eq.false&select=id,email,name`,
    { headers: sbHeaders() }
  );
  if (!res.ok) return NextResponse.json({ ok: false }, { status: 500 });
  const entries: { id: string; email: string; name: string | null }[] = await res.json();

  if (entries.length === 0) return NextResponse.json({ ok: true, count: 0 });

  // Send all emails (sequential to avoid rate limits)
  let sent = 0;
  for (const entry of entries) {
    try {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          from: FROM,
          to: entry.email,
          subject: "Andy'K Music Lab is now live",
          html: launchHtml(entry.email, entry.name),
        }),
      });
      if (emailRes.ok) {
        await fetch(`${SUPABASE_URL}/rest/v1/lab_waitlist?id=eq.${entry.id}`, {
          method: "PATCH",
          headers: { ...sbHeaders(), "Prefer": "return=minimal" },
          body: JSON.stringify({ notified: true }),
        });
        sent++;
      }
    } catch {}
  }

  return NextResponse.json({ ok: true, count: sent });
}
