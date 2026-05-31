import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL = Buffer.from("Y2VvQGFuZHlrZ3JvdXAuY29t", "base64").toString();
const ADMIN_PASS  = Buffer.from("QU5EWUsyMDI2", "base64").toString();

export async function POST(req: NextRequest) {
  const { email, password } = await req.json().catch(() => ({}));
  if (email !== ADMIN_EMAIL || password !== ADMIN_PASS) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "not configured" }, { status: 500 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("andyk_admin_session", secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("andyk_admin_session");
  return res;
}
