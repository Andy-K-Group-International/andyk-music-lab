import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const ADMIN_EMAIL = "ceo@andykgroup.com";

export async function requirePlanAccess(tool: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  if (user.email === ADMIN_EMAIL) return;

  // Check tool_access table — source of truth for all plan types including individual tools
  const now = new Date().toISOString();
  const { data: access } = await supabase
    .from("tool_access")
    .select("id, expires_at")
    .eq("user_id", user.id)
    .eq("tool_name", tool)
    .limit(1)
    .maybeSingle();

  if (!access) redirect("/client?upgrade=1");
  if (access.expires_at && access.expires_at < now) redirect("/client?expired=1");
}
