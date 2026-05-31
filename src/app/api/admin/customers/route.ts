import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ADMIN_EMAIL  = "ceo@andykgroup.com";

function sbHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` };
}

async function requireAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email === ADMIN_EMAIL;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles` +
    `?select=id,email,full_name,plan,subscription_status,plan_status,plan_started_at,plan_expires_at` +
    `&plan=not.is.null` +
    `&order=plan_started_at.desc.nullslast`,
    { headers: sbHeaders(), cache: "no-store" }
  );

  if (!res.ok) return NextResponse.json({ customers: [] }, { status: 500 });
  return NextResponse.json({ customers: await res.json() });
}
