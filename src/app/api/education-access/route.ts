import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const FROM         = "noreply@andykgroup.com";
const ADMIN_EMAIL  = "ceo@andykgroup.com";

function sbHeaders() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return { "Content-Type": "application/json", apikey: key, Authorization: `Bearer ${key}` };
}

async function sendEmail(payload: object) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(payload),
  });
}

function adminEmailHtml(fields: {
  name: string; email: string; website: string | null;
  students_count: number | null; type: string | null; message: string | null;
}): string {
  const MONO = `'IBM Plex Mono',ui-monospace,monospace`;
  const SANS = `'IBM Plex Sans',ui-sans-serif,system-ui,sans-serif`;
  const rows: [string, string][] = [
    ["Name",     fields.name],
    ["Email",    fields.email],
    ["Website",  fields.website ?? "—"],
    ["Students", fields.students_count != null ? String(fields.students_count) : "—"],
    ["Type",     fields.type ?? "—"],
    ["Message",  fields.message ?? "—"],
  ];
  const tableRows = rows.map(([label, value]) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e5e5e5;font-family:${MONO};font-size:10px;font-weight:700;color:#a3a3a3;text-transform:uppercase;letter-spacing:0.1em;width:80px;vertical-align:top;">${label}</td>
      <td style="padding:12px 0 12px 20px;border-bottom:1px solid #e5e5e5;font-family:${SANS};font-size:13px;color:#111111;line-height:1.55;">${value}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html><body style="margin:0;padding:32px;background:#f5f5f5;font-family:${SANS};">
    <div style="max-width:540px;background:#ffffff;border:1px solid #e5e5e5;padding:40px;">
      <p style="font-family:${MONO};font-size:10px;font-weight:700;color:#a3a3a3;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 16px;">NEW EDUCATION ACCESS REQUEST</p>
      <h1 style="font-size:22px;font-weight:700;color:#111111;margin:0 0 32px;">Education Access Request</h1>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e5e5;">${tableRows}</table>
    </div>
  </body></html>`;
}

function confirmationEmailHtml(name: string): string {
  const MONO = `'IBM Plex Mono',ui-monospace,monospace`;
  const SANS = `'IBM Plex Sans',ui-sans-serif,system-ui,sans-serif`;
  return `<!DOCTYPE html><html><body style="margin:0;padding:32px;background:#f5f5f5;font-family:${SANS};">
    <div style="max-width:540px;background:#ffffff;border:1px solid #e5e5e5;padding:40px;">
      <p style="font-family:${MONO};font-size:10px;font-weight:700;color:#a3a3a3;letter-spacing:0.2em;text-transform:uppercase;margin:0 0 16px;">EDUCATION ACCESS</p>
      <h1 style="font-size:22px;font-weight:700;color:#111111;margin:0 0 24px;">Request Received</h1>
      <p style="font-size:15px;color:#111111;line-height:1.75;margin:0 0 16px;">Hi ${name},</p>
      <p style="font-size:15px;color:#111111;line-height:1.75;margin:0 0 16px;">
        Thank you for requesting Limited Education Access for Andy&rsquo;K Music Lab.
      </p>
      <p style="font-size:14px;color:#525252;line-height:1.75;margin:0 0 32px;">
        We review requests from selected music schools, DJ courses and producer communities. If your request is a good fit, we will contact you with the next steps.
      </p>
      <div style="border-top:1px solid #e5e5e5;padding-top:24px;">
        <p style="font-family:${MONO};font-size:11px;color:#a3a3a3;margin:0 0 4px;">Andy&rsquo;K Music Lab</p>
        <p style="font-family:${MONO};font-size:11px;color:#a3a3a3;margin:0 0 4px;">Browser-based audio tools for producers &amp; DJs</p>
        <a href="https://lab.djandykofficial.com" style="font-family:${MONO};font-size:11px;color:#111111;">lab.djandykofficial.com</a>
      </div>
    </div>
  </body></html>`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { name, email, website, students_count, type, message,
          accepted_pricing_terms, accepted_pricing_terms_at, accepted_pricing_terms_version } = body;

  if (accepted_pricing_terms !== true) {
    return NextResponse.json({ error: "pricing_terms_required" }, { status: 400 });
  }
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!email?.trim()) return NextResponse.json({ error: "Email is required" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  if (students_count != null && isNaN(Number(students_count))) {
    return NextResponse.json({ error: "Number of students must be numeric" }, { status: 400 });
  }

  const nameTrimmed  = name.trim();
  const emailLower   = email.trim().toLowerCase();
  const studentsNum  = students_count != null ? Number(students_count) : null;

  // Save to Supabase
  const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/education_access_requests`, {
    method: "POST",
    headers: { ...sbHeaders(), Prefer: "return=minimal" },
    body: JSON.stringify({
      name: nameTrimmed,
      email: emailLower,
      website: website?.trim() || null,
      students_count: studentsNum,
      type: type || null,
      message: message?.trim() || null,
      accepted_pricing_terms: accepted_pricing_terms === true,
      accepted_pricing_terms_at: accepted_pricing_terms_at ?? null,
      accepted_pricing_terms_version: accepted_pricing_terms_version ?? null,
    }),
  });

  if (!sbRes.ok) {
    console.error("[education-access]", sbRes.status, await sbRes.text());
    return NextResponse.json({ error: "Failed to save request" }, { status: 500 });
  }

  // Fire both emails concurrently — non-critical failures don't block response
  await Promise.allSettled([
    sendEmail({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: "New Education Access Request — Andy'K Music Lab",
      html: adminEmailHtml({ name: nameTrimmed, email: emailLower, website: website?.trim() || null, students_count: studentsNum, type: type || null, message: message?.trim() || null }),
    }),
    sendEmail({
      from: FROM,
      to: emailLower,
      subject: "Education Access Request Received — Andy'K Music Lab",
      html: confirmationEmailHtml(nameTrimmed),
    }),
  ]);

  return NextResponse.json({ ok: true });
}
