const SANS  = `'IBM Plex Sans',ui-sans-serif,system-ui,sans-serif`;
const MONO  = `'IBM Plex Mono',ui-monospace,monospace`;
const SERIF = `'Playfair Display',Georgia,serif`;

const GF_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;700&family=IBM+Plex+Mono:wght@400;700&family=Playfair+Display:ital@1&display=swap');`;

// ── Shared blocks ─────────────────────────────────────────────────────────────

const LOGO = `
  <tr>
    <td style="padding:40px 48px 32px;">
      <img src="https://lab.djandykofficial.com/logo-3d.png" alt="Andy'K Music Lab" width="200" style="display:block;margin:0 auto 24px auto;" />
    </td>
  </tr>
  <tr><td style="height:1px;background:#e5e5e5;font-size:0;line-height:0;">&nbsp;</td></tr>`;

const FOOTER = `
  <tr><td style="height:1px;background:#e5e5e5;font-size:0;line-height:0;">&nbsp;</td></tr>
  <tr>
    <td style="padding:24px 48px 28px;">
      <p style="margin:0;font-family:${MONO};font-size:10px;color:#a3a3a3;letter-spacing:0.08em;text-transform:uppercase;line-height:1.7;">
        &#8471; &amp; &copy; 2026 ANDY&rsquo;K GROUP INTERNATIONAL LTD
      </p>
    </td>
  </tr>`;

function wrap(inner: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>${GF_IMPORT}</style>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:${SANS};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:48px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e5e5;">
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

export function confirmationHtml(email: string, name: string | null, planLabel: string, discountCode?: string): string {
  const displayName = name || email.split("@")[0];
  const discountBlock = discountCode ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e5e5;margin:24px 0 32px;">
        <tr><td style="padding:20px 24px;">
          <p style="margin:0 0 8px;font-family:${MONO};font-size:10px;font-weight:700;color:#a3a3a3;letter-spacing:0.2em;text-transform:uppercase;">Your Early Access Code</p>
          <p style="margin:0 0 8px;font-family:${MONO};font-size:20px;font-weight:700;color:#111111;letter-spacing:0.05em;">${discountCode}</p>
          <p style="margin:0;font-family:${SANS};font-size:13px;color:#525252;line-height:1.6;">Use this code at checkout for <strong>40% off</strong> your first year.</p>
        </td></tr>
      </table>` : "";

  return wrap(`
  <tr>
    <td style="padding:48px 48px 56px;">

      <p style="margin:0 0 20px;font-family:${MONO};font-size:10px;font-weight:700;color:#a3a3a3;letter-spacing:0.2em;text-transform:uppercase;">
        WAITLIST &middot; EARLY ACCESS
      </p>

      <h1 style="margin:0 0 32px;font-family:${SANS};font-size:28px;font-weight:700;color:#111111;letter-spacing:-0.02em;line-height:1.2;">
        You&rsquo;re on the <span style="font-family:${SERIF};font-style:italic;font-weight:400;">list</span>
      </h1>

      <p style="margin:0 0 12px;font-family:${SANS};font-size:15px;font-weight:400;color:#111111;line-height:1.75;">
        Hi <strong style="font-weight:600;">${displayName}</strong>,
      </p>
      <p style="margin:0 0 12px;font-family:${SANS};font-size:15px;font-weight:400;color:#111111;line-height:1.75;">
        You&rsquo;re on the waitlist for <strong style="font-weight:600;">${planLabel}</strong>.
        We&rsquo;ll email you the moment Andy&rsquo;K Music Lab goes live.
      </p>
      <p style="margin:0 0 24px;font-family:${SANS};font-size:14px;font-weight:300;color:#8a8a8a;line-height:1.75;">
        Thank you for your interest.
      </p>

      ${discountBlock}

      <a href="https://lab.djandykofficial.com"
         style="display:block;width:100%;box-sizing:border-box;padding:16px 24px;background:#111111;color:#ffffff;font-family:${MONO};font-size:11px;font-weight:700;text-decoration:none;letter-spacing:0.15em;text-transform:uppercase;text-align:center;">
        LAB.DJANDYKOFFICIAL.COM &rarr;
      </a>

    </td>
  </tr>`);
}

// ── Template 2: Admin notification ───────────────────────────────────────────

export function adminHtml(email: string, name: string | null, planLabel: string, timestamp: string): string {
  const rows: [string, string][] = [
    ["Name",  name || "—"],
    ["Email", email],
    ["Plan",  planLabel],
    ["Time",  timestamp],
  ];

  const tableRows = rows.map(([label, value]) => `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #e5e5e5;font-family:${MONO};font-size:10px;font-weight:700;color:#a3a3a3;text-transform:uppercase;letter-spacing:0.1em;width:72px;vertical-align:top;">
        ${label}
      </td>
      <td style="padding:14px 0 14px 24px;border-bottom:1px solid #e5e5e5;font-family:${SANS};font-size:14px;font-weight:400;color:#111111;line-height:1.55;">
        ${value}
      </td>
    </tr>`).join("");

  return wrap(`
  <tr>
    <td style="padding:48px 48px 56px;">

      <p style="margin:0 0 20px;font-family:${MONO};font-size:10px;font-weight:700;color:#a3a3a3;letter-spacing:0.2em;text-transform:uppercase;">
        NEW SIGNUP
      </p>

      <h1 style="margin:0 0 40px;font-family:${SANS};font-size:28px;font-weight:700;color:#111111;letter-spacing:-0.02em;line-height:1.2;">
        New <span style="font-family:${SERIF};font-style:italic;font-weight:400;">waitlist</span> entry
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
    <td style="padding:48px 48px 56px;">

      <p style="margin:0 0 20px;font-family:${MONO};font-size:10px;font-weight:700;color:#a3a3a3;letter-spacing:0.2em;text-transform:uppercase;">
        ANDY&rsquo;K MUSIC LAB &middot; NOW LIVE
      </p>

      <h1 style="margin:0 0 32px;font-family:${SANS};font-size:28px;font-weight:700;color:#111111;letter-spacing:-0.02em;line-height:1.2;">
        The Lab is <span style="font-family:${SERIF};font-style:italic;font-weight:400;">live</span>
      </h1>

      <p style="margin:0 0 12px;font-family:${SANS};font-size:15px;font-weight:400;color:#111111;line-height:1.75;">
        Hi <strong style="font-weight:600;">${displayName}</strong>,
      </p>
      <p style="margin:0 0 44px;font-family:${SANS};font-size:15px;font-weight:400;color:#111111;line-height:1.75;">
        Andy&rsquo;K Music Lab is now open. Join today.
      </p>

      <a href="https://lab.djandykofficial.com"
         style="display:block;width:100%;box-sizing:border-box;padding:16px 24px;background:#111111;color:#ffffff;font-family:${MONO};font-size:11px;font-weight:700;text-decoration:none;letter-spacing:0.15em;text-transform:uppercase;text-align:center;">
        JOIN NOW &rarr;
      </a>

    </td>
  </tr>`);
}
