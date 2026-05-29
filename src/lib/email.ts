const FONT = `Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`;

const LOGO = `
  <tr>
    <td style="padding:32px 40px 28px;">
      <span style="font-size:15px;font-weight:700;color:#111111;letter-spacing:-0.02em;font-family:${FONT};">Andy&rsquo;K</span>
      <span style="font-size:15px;color:#d4d4d4;margin:0 8px;font-family:${FONT};">/</span>
      <span style="font-size:13px;font-weight:500;color:#737373;font-family:${FONT};">Music Lab</span>
    </td>
  </tr>
  <tr><td style="height:1px;background:#e5e5e5;font-size:0;line-height:0;">&nbsp;</td></tr>`;

const FOOTER = `
  <tr><td style="height:1px;background:#e5e5e5;font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr>
    <td style="padding:20px 40px 24px;">
      <p style="margin:0;font-size:11px;color:#a3a3a3;line-height:1.6;font-family:${FONT};">
        &#8471; &amp; &copy; 2026 ANDY&rsquo;K GROUP INTERNATIONAL LTD &nbsp;&middot;&nbsp; lab.djandykofficial.com
      </p>
    </td>
  </tr>`;

function wrap(inner: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:${FONT};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:540px;background:#ffffff;border:1px solid #e5e5e5;">
        ${LOGO}
        ${inner}
        ${FOOTER}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Template 1: Waitlist confirmation (to user) ───────────────────────────────

export function confirmationHtml(email: string, name: string | null, planLabel: string): string {
  const displayName = name || email.split("@")[0];
  return wrap(`
  <tr>
    <td style="padding:40px 40px 48px;">
      <h1 style="margin:0 0 28px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.02em;line-height:1.25;font-family:${FONT};">
        You&rsquo;re on the list
      </h1>

      <p style="margin:0 0 10px;font-size:15px;color:#111111;line-height:1.7;font-family:${FONT};">
        Hi <strong>${displayName}</strong>,
      </p>
      <p style="margin:0 0 10px;font-size:15px;color:#111111;line-height:1.7;font-family:${FONT};">
        You&rsquo;re on the waitlist for <strong>${planLabel}</strong>.
        We&rsquo;ll email you the moment Andy&rsquo;K Music Lab goes live.
      </p>
      <p style="margin:0 0 36px;font-size:15px;color:#737373;line-height:1.7;font-family:${FONT};">
        Thank you for your interest.
      </p>

      <a href="https://lab.djandykofficial.com"
         style="display:inline-block;padding:14px 28px;background:#111111;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.01em;font-family:${FONT};">
        lab.djandykofficial.com &rarr;
      </a>
    </td>
  </tr>`);
}

// ── Template 2: Admin notification ───────────────────────────────────────────

export function adminHtml(email: string, name: string | null, planLabel: string, timestamp: string): string {
  const rows: [string, string][] = [
    ["Name",    name || "—"],
    ["Email",   email],
    ["Plan",    planLabel],
    ["Time",    timestamp],
  ];

  const tableRows = rows.map(([label, value]) => `
    <tr>
      <td style="padding:13px 0;border-bottom:1px solid #e5e5e5;font-size:11px;font-weight:600;color:#a3a3a3;text-transform:uppercase;letter-spacing:0.08em;width:80px;vertical-align:top;font-family:${FONT};">${label}</td>
      <td style="padding:13px 0 13px 20px;border-bottom:1px solid #e5e5e5;font-size:14px;color:#111111;line-height:1.5;font-family:${FONT};">${value}</td>
    </tr>`).join("");

  return wrap(`
  <tr>
    <td style="padding:40px 40px 48px;">
      <h1 style="margin:0 0 32px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.02em;line-height:1.25;font-family:${FONT};">
        New signup
      </h1>

      <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e5e5;">
        ${tableRows}
      </table>
    </td>
  </tr>`);
}

// ── Template 3: Launch notification (to user) ─────────────────────────────────

export function launchHtml(email: string, name: string | null): string {
  const displayName = name || email.split("@")[0];
  return wrap(`
  <tr>
    <td style="padding:40px 40px 48px;">
      <h1 style="margin:0 0 28px;font-size:22px;font-weight:700;color:#111111;letter-spacing:-0.02em;line-height:1.25;font-family:${FONT};">
        Andy&rsquo;K Music Lab is live
      </h1>

      <p style="margin:0 0 10px;font-size:15px;color:#111111;line-height:1.7;font-family:${FONT};">
        Hi <strong>${displayName}</strong>,
      </p>
      <p style="margin:0 0 36px;font-size:15px;color:#111111;line-height:1.7;font-family:${FONT};">
        Andy&rsquo;K Music Lab is now live. BPM detection, mastering tools, and DJ set planning — ready to use.
        Join here: <a href="https://lab.djandykofficial.com" style="color:#111111;font-weight:600;">lab.djandykofficial.com</a>
      </p>

      <a href="https://lab.djandykofficial.com"
         style="display:inline-block;padding:14px 28px;background:#111111;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.01em;font-family:${FONT};">
        Open the Lab &rarr;
      </a>
    </td>
  </tr>`);
}
