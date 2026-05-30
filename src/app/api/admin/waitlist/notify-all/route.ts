import { type NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { protocol, host } = new URL(req.url);
  const res = await fetch(`${protocol}//${host}/api/waitlist/notify-all`, {
    method: "POST",
    headers: { "x-admin-secret": process.env.ADMIN_SECRET! },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
