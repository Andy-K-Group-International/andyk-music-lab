import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function sbHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` };
}

const PLAN_TOOLS: Record<string, string[]> = {
  single:          ["mastering"],
  studio:          ["mastering","bpm","planner","track-comparator","chord-generator","metronome","loudness-meter","stem-splitter"],
  pro:             ["mastering","bpm","planner","track-comparator","chord-generator","metronome","loudness-meter","stem-splitter"],
  tool_mastering:  ["mastering"],
  tool_bpm:        ["bpm"],
  tool_planner:    ["planner"],
  tool_comparator: ["track-comparator"],
  tool_chord:      ["chord-generator"],
  tool_metronome:  ["metronome"],
  tool_loudness:   ["loudness-meter"],
  tool_stems:      ["stem-splitter"],
};

function planExpiry(plan: string): string | null {
  if (plan === "pro")    return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  if (plan === "studio" || plan.startsWith("tool_"))
                         return new Date(Date.now() +  30 * 24 * 60 * 60 * 1000).toISOString();
  return null; // single = no expiry
}

export async function POST(req: NextRequest) {
  const { email, password, full_name, gdpr_consent } = await req.json().catch(() => ({}));
  if (!email || !password) return NextResponse.json({ error: "email and password required" }, { status: 400 });
  if (!gdpr_consent) return NextResponse.json({ error: "gdpr_consent required" }, { status: 400 });

  const emailLower = email.trim().toLowerCase();
  const supabase = createAdminClient();

  // Create auth user (auto email-confirmed)
  const { data: { user }, error } = await supabase.auth.admin.createUser({
    email: emailLower,
    password,
    email_confirm: true,
    user_metadata: { full_name: full_name?.trim() || null },
  });

  if (error) {
    const status = error.message?.includes("already") ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
  if (!user) return NextResponse.json({ error: "user creation failed" }, { status: 500 });

  // Resolve plan — check pending_access first (most current), then waitlist fallback
  const [pendingRes, waitlistRes] = await Promise.all([
    fetch(
      `${SUPABASE_URL}/rest/v1/pending_access?email=eq.${encodeURIComponent(emailLower)}&access_granted=eq.false&order=created_at.desc&limit=1`,
      { headers: sbHeaders(), cache: "no-store" }
    ),
    fetch(
      `${SUPABASE_URL}/rest/v1/waitlist?email=eq.${encodeURIComponent(emailLower)}&paid=eq.true&select=plan,revolut_order_id&limit=1`,
      { headers: sbHeaders(), cache: "no-store" }
    ),
  ]);

  const pendingRows: { id: string; plan: string; order_id: string | null }[] =
    pendingRes.ok ? await pendingRes.json() : [];
  const waitlistRows: { plan?: string; revolut_order_id?: string }[] =
    waitlistRes.ok ? await waitlistRes.json() : [];

  const pendingEntry = pendingRows[0] ?? null;
  const waitlistEntry = waitlistRows[0] ?? null;

  // Prefer pending_access (set by verified Revolut payment) over waitlist
  const plan = pendingEntry?.plan ?? waitlistEntry?.plan ?? null;
  const revolutOrderId = pendingEntry?.order_id ?? waitlistEntry?.revolut_order_id ?? null;
  const accessSource = pendingEntry ? "revolut_payment" : (waitlistEntry ? "waitlist" : null);

  const now = new Date().toISOString();
  const planExpiresAt = plan ? planExpiry(plan) : null;

  // Create profile
  await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST",
    headers: { ...sbHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify({
      id: user.id,
      email: emailLower,
      full_name: full_name?.trim() || null,
      plan,
      plan_started_at:     plan ? now : null,
      plan_expires_at:     planExpiresAt,
      revolut_order_id:    revolutOrderId,
      subscription_status: plan ? "active" : null,
      access_source:       accessSource,
      gdpr_consent:        true,
      gdpr_consent_at:     now,
    }),
  });

  // Grant tool access
  if (plan && PLAN_TOOLS[plan]) {
    const toolInserts = PLAN_TOOLS[plan].map(tool_name => ({
      user_id:    user.id,
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

  // Mark pending_access as granted
  if (pendingEntry) {
    await fetch(
      `${SUPABASE_URL}/rest/v1/pending_access?id=eq.${pendingEntry.id}`,
      {
        method: "PATCH",
        headers: { ...sbHeaders(), Prefer: "return=minimal" },
        body: JSON.stringify({ access_granted: true, updated_at: now }),
      }
    );
  }

  return NextResponse.json({ ok: true, hasPlan: !!plan });
}
