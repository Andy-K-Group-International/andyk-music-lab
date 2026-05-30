import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function sbHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` };
}

export async function POST(req: NextRequest) {
  const { code } = await req.json().catch(() => ({}));
  if (!code) return NextResponse.json({ valid: false }, { status: 400 });

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/discount_codes?code=eq.${encodeURIComponent(code.trim().toUpperCase())}&used=eq.false&select=discount_percent&limit=1`,
    { headers: sbHeaders(), cache: "no-store" }
  );

  if (!res.ok) return NextResponse.json({ valid: false });
  const rows: { discount_percent: number }[] = await res.json();

  if (!rows.length) return NextResponse.json({ valid: false });
  return NextResponse.json({ valid: true, discount_percent: rows[0].discount_percent });
}
