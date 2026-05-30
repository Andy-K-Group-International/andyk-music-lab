import { NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const TOTAL = 40;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET() {
  try {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/waitlist?select=id&limit=0`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Prefer: "count=exact",
        },
        cache: "no-store",
      }
    );

    // PostgREST returns total count in Content-Range: */N
    const range = res.headers.get("content-range") ?? "";
    const count = parseInt(range.split("/")[1] ?? "0", 10);
    const spots_left = Math.max(0, TOTAL - (isNaN(count) ? 0 : count));

    return NextResponse.json(
      { spots_left, total: TOTAL, closed: spots_left === 0 },
      { headers: CORS }
    );
  } catch {
    return NextResponse.json(
      { spots_left: TOTAL, total: TOTAL, closed: false },
      { headers: CORS }
    );
  }
}
