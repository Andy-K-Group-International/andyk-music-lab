import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const ADMIN_EMAIL = "ceo@andykgroup.com";

const PLAN_TOOLS: Record<string, string[]> = {
  single:  ["mastering"],
  studio:  ["mastering","bpm","planner","track-comparator","chord-generator","metronome","loudness-meter","stem-splitter"],
  pro:     ["mastering","bpm","planner","track-comparator","chord-generator","metronome","loudness-meter","stem-splitter"],
};

export async function requirePlanAccess(tool: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (user.email === ADMIN_EMAIL) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  const plan = profile?.plan as string | null;
  if (!plan) redirect("/client?upgrade=1");

  const expired = profile?.plan_expires_at && new Date(profile.plan_expires_at) < new Date();
  if (expired) redirect("/client?expired=1");

  const allowed = PLAN_TOOLS[plan] ?? [];
  if (!allowed.includes(tool)) redirect("/client?upgrade=1");
}
