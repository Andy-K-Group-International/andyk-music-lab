import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

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

const PLAN_LABELS: Record<string, string> = {
  single:          "Single Session",
  studio:          "Studio Pass",
  pro:             "Pro Pass",
  tool_mastering:  "Mastering Tool",
  tool_bpm:        "BPM + Key Detector",
  tool_planner:    "DJ Set Planner",
  tool_comparator: "Track Comparator",
  tool_chord:      "Chord Generator",
  tool_metronome:  "Metronome",
  tool_loudness:   "Loudness Meter",
  tool_stems:      "Stem Splitter",
};

function sbHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` };
}

function planExpiry(plan: string): string | null {
  if (plan === "pro")    return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  if (plan === "studio" || plan.startsWith("tool_"))
                         return new Date(Date.now() +  30 * 24 * 60 * 60 * 1000).toISOString();
  return null;
}

// Called after login — links any ungranted pending_access to an existing account
export async function POST() {
  // Auth is verified server-side from session cookies — email never trusted from client
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ ok: false, linked: false });

  const emailLower = user.email.toLowerCase();

  // Check for ungranted pending access
  const pendingRes = await fetch(
    `${SUPABASE_URL}/rest/v1/pending_access?email=eq.${encodeURIComponent(emailLower)}&access_granted=eq.false&order=created_at.desc&limit=1`,
    { headers: sbHeaders(), cache: "no-store" }
  );
  const pendingRows: { id: string; plan: string; order_id: string | null }[] =
    pendingRes.ok ? await pendingRes.json() : [];

  if (!pendingRows.length) {
    return NextResponse.json({ ok: true, linked: false });
  }

  const pending = pendingRows[0];
  const plan = pending.plan;
  const now = new Date().toISOString();
  const planExpiresAt = planExpiry(plan);

  // Update profile plan (upsert-safe — profile already exists from registration)
  await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`,
    {
      method: "PATCH",
      headers: { ...sbHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify({
        plan,
        plan_started_at:     now,
        plan_expires_at:     planExpiresAt,
        subscription_status: "active",
        access_source:       "revolut_payment",
        revolut_order_id:    pending.order_id,
      }),
    }
  );

  // Insert tool_access rows (ignore conflicts if already granted)
  if (PLAN_TOOLS[plan]) {
    const toolInserts = PLAN_TOOLS[plan].map(tool_name => ({
      user_id:    user.id,
      tool_name,
      granted_at: now,
      expires_at: planExpiresAt,
    }));
    await fetch(`${SUPABASE_URL}/rest/v1/tool_access`, {
      method: "POST",
      headers: { ...sbHeaders(), Prefer: "resolution=ignore-duplicates,return=minimal" },
      body: JSON.stringify(toolInserts),
    });
  }

  // Mark pending_access as granted
  await fetch(
    `${SUPABASE_URL}/rest/v1/pending_access?id=eq.${pending.id}`,
    {
      method: "PATCH",
      headers: { ...sbHeaders(), Prefer: "return=minimal" },
      body: JSON.stringify({ access_granted: true, updated_at: now }),
    }
  );

  return NextResponse.json({ ok: true, linked: true, plan_name: PLAN_LABELS[plan] ?? plan });
}
