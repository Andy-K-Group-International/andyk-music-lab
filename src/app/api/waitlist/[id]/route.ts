import { NextRequest, NextResponse } from "next/server";
import { launchHtml } from "@/lib/email";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const FROM = "noreply@andykgroup.com";

function sbHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return { "Content-Type": "application/json", "apikey": key, "Authorization": `Bearer ${key}` };
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || _req.headers.get("x-admin-secret") !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ ok: false, error: "no api key" }, { status: 500 });

  const entryRes = await fetch(
    `${SUPABASE_URL}/rest/v1/waitlist?id=eq.${id}&select=*&limit=1`,
    { headers: sbHeaders() }
  );
  if (!entryRes.ok) return NextResponse.json({ ok: false }, { status: 500 });
  const [entry] = await entryRes.json();
  if (!entry) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({ from: FROM, to: entry.email, subject: "Andy'K Music Lab is now live", html: launchHtml(entry.email, entry.name) }),
  });
  if (!emailRes.ok) return NextResponse.json({ ok: false, error: "email failed" }, { status: 500 });

  await fetch(`${SUPABASE_URL}/rest/v1/waitlist?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...sbHeaders(), "Prefer": "return=minimal" },
    body: JSON.stringify({ notified: true }),
  });

  return NextResponse.json({ ok: true });
}
