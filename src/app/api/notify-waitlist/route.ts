import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, name, plan } = await req.json().catch(() => ({}));
  if (!email) return NextResponse.json({ ok: false }, { status: 400 });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // No email key configured — signup still recorded in Supabase
    return NextResponse.json({ ok: true, notified: false });
  }

  const planLabel =
    plan === "single" ? "Single Session (£49)"
    : plan === "pro" ? "Pro Pass (£149/yr)"
    : "Studio Pass (£19/mo)";

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: "noreply@lab.djandykofficial.com",
        to: "info@djandykofficial.com",
        subject: `[Lab Waitlist] New signup: ${email}`,
        text: [
          "New Andy'K Music Lab waitlist signup:",
          "",
          `Email: ${email}`,
          `Name:  ${name || "—"}`,
          `Plan:  ${planLabel}`,
          "",
          "View all signups: https://supabase.com/dashboard/project/kbdvsqdctgeirakpctoz/editor",
        ].join("\n"),
      }),
    });
  } catch {
    // Notification failed — signup is still saved in Supabase
  }

  return NextResponse.json({ ok: true, notified: true });
}
