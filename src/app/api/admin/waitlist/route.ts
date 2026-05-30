import { type NextRequest, NextResponse } from "next/server";

// Server-side proxy — adds ADMIN_SECRET internally so the client never sees it.
export async function GET(req: NextRequest) {
  const { protocol, host } = new URL(req.url);
  const res = await fetch(`${protocol}//${host}/api/waitlist`, {
    headers: { "x-admin-secret": process.env.ADMIN_SECRET! },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
