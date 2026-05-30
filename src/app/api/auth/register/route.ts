import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function sbHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` };
}

const PLAN_TOOLS: Record<string, string[]> = {
  single:  ["mastering"],
  studio:  ["mastering","bpm","planner","track-comparator","chord-generator","metronome","loudness-meter","stem-splitter"],
  pro:     ["mastering","bpm","planner","track-comparator","chord-generator","metronome","loudness-meter","stem-splitter"],
};

export async function POST(req: NextRequest) {
  const { email, password, full_name, gdpr_consent } = await req.json().catch(() => ({}));
  if (!email || !password) return NextResponse.json({ error: "email and password required" }, { status: 400 });
  if (!gdpr_consent) return NextResponse.json({ error: "gdpr_consent required" }, { status: 400 });

  const supabase = createAdminClient();

  // Create user (auto email-confirmed)
  const { data: { user }, error } = await supabase.auth.admin.createUser({
    email: email.trim().toLowerCase(),
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name?.trim() || null },
  });

  if (error) {
    const status = error.message?.includes("already") ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
  if (!user) return NextResponse.json({ error: "user creation failed" }, { status: 500 });

  // Check if this email has a paid waitlist entry
  const waitlistRes = await fetch(
    `${SUPABASE_URL}/rest/v1/waitlist?email=eq.${encodeURIComponent(email.trim().toLowerCase())}&paid=eq.true&select=plan,revolut_order_id&limit=1`,
    { headers: sbHeaders(), cache: "no-store" }
  );
  const waitlist: { plan?: string; revolut_order_id?: string }[] = waitlistRes.ok ? await waitlistRes.json() : [];
  const paidEntry = waitlist[0];

  const plan = paidEntry?.plan ?? null;
  const now = new Date().toISOString();
  const planExpiresAt = plan === "pro"
    ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    : plan === "studio"
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    : null;

  // Create profile
  await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST",
    headers: { ...sbHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify({
      id: user.id,
      email: email.trim().toLowerCase(),
      full_name: full_name?.trim() || null,
      plan,
      plan_started_at: plan ? now : null,
      plan_expires_at: planExpiresAt,
      revolut_order_id: paidEntry?.revolut_order_id ?? null,
      gdpr_consent: true,
      gdpr_consent_at: now,
    }),
  });

  // Grant tool access records if plan exists
  if (plan && PLAN_TOOLS[plan]) {
    const toolInserts = PLAN_TOOLS[plan].map(tool_name => ({
      user_id: user.id,
      tool_name,
      granted_at: now,
      expires_at: planExpiresAt,
    }));
    await fetch(`${SUPABASE_URL}/rest/v1/tool_access`, {
      method: "POST",
      headers: { ...sbHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify(toolInserts),
    });
  }

  return NextResponse.json({ ok: true, hasPlan: !!plan });
}
