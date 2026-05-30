import { NextRequest, NextResponse } from "next/server";
import { launchHtml } from "@/lib/email";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const FROM = "noreply@andykgroup.com";

function sbHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return { "Content-Type": "application/json", "apikey": key, "Authorization": `Bearer ${key}` };
}

export async function POST(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || req.headers.get("x-admin-secret") !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, error: "no api key" }, { status: 500 });

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/waitlist?notified=eq.false&select=id,email,name`,
    { headers: sbHeaders() }
  );
  if (!res.ok) return NextResponse.json({ ok: false }, { status: 500 });
  const entries: { id: string; email: string; name: string | null }[] = await res.json();
  if (entries.length === 0) return NextResponse.json({ ok: true, count: 0 });

  let sent = 0;
  for (const entry of entries) {
    try {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({ from: FROM, to: entry.email, subject: "Andy'K Music Lab is now live", html: launchHtml(entry.email, entry.name) }),
      });
      if (emailRes.ok) {
        await fetch(`${SUPABASE_URL}/rest/v1/waitlist?id=eq.${entry.id}`, {
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
