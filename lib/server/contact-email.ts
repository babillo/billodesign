// Notification email for contact-form submissions (sent to the owner via Resend).
//
// Email HTML is not web HTML: clients like Gmail and Outlook ignore <style>
// blocks, flexbox and CSS variables, so the layout uses tables and inline
// styles only. Colors mirror the site tokens in app/globals.css.

const COLOR = {
  page: "#0b0b0b",
  card: "#141414",
  field: "#1c1c1c",
  border: "#262626",
  cyan: "#00adcc",
  cyanDeep: "#03869e",
  text: "#f2f2f2",
  muted: "#9f9b9b",
};
const MONO = "'IBM Plex Mono', SFMono-Regular, Menlo, Consolas, monospace";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export type ContactMessage = {
  name: string;
  email: string;
  message: string;
  /** Page the form was sent from, e.g. "/projects/orbitai" (from the Referer header). */
  page?: string;
};

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function row(label: string, valueHtml: string) {
  return `<tr>
  <td style="padding:6px 0;width:72px;vertical-align:top;font:600 12px/20px ${MONO};letter-spacing:1px;text-transform:uppercase;color:${COLOR.muted};">${label}</td>
  <td style="padding:6px 0;vertical-align:top;font:15px/20px ${SANS};color:${COLOR.text};">${valueHtml}</td>
</tr>`;
}

export function buildContactEmail({ name, email, message, page }: ContactMessage) {
  const firstName = name.split(/\s+/)[0];
  const subject = `New transmission from ${name.slice(0, 80)}`;
  const replyHref = `mailto:${email}?subject=${encodeURIComponent("Re: Your message to Billodesign")}`;
  const preheader = message.replace(/\s+/g, " ").slice(0, 120);

  const text = [
    `New transmission from the Billodesign website`,
    ``,
    `Name:  ${name}`,
    `Email: ${email}`,
    ...(page ? [`Page:  ${page}`] : []),
    ``,
    `Message:`,
    message,
    ``,
    `Reply to this email to answer ${firstName} directly.`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${COLOR.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLOR.page};">
<tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${COLOR.card};border:1px solid ${COLOR.border};border-top:3px solid ${COLOR.cyan};border-radius:8px;">
    <tr><td style="padding:28px 28px 8px;">
      <div style="font:700 12px/16px ${MONO};letter-spacing:4px;text-transform:uppercase;color:${COLOR.cyan};">New transmission</div>
      <div style="margin-top:10px;font:700 22px/28px ${MONO};color:${COLOR.text};">Message from ${escapeHtml(name)}</div>
    </td></tr>
    <tr><td style="padding:12px 28px 4px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${row("Name", escapeHtml(name))}
        ${row("Email", `<a href="mailto:${escapeHtml(email)}" style="color:${COLOR.cyan};text-decoration:none;">${escapeHtml(email)}</a>`)}
        ${page ? row("Page", escapeHtml(page)) : ""}
      </table>
    </td></tr>
    <tr><td style="padding:16px 28px 8px;">
      <div style="font:600 12px/20px ${MONO};letter-spacing:1px;text-transform:uppercase;color:${COLOR.muted};">Message</div>
      <div style="margin-top:8px;padding:16px 18px;background:${COLOR.field};border-left:3px solid ${COLOR.cyanDeep};border-radius:4px;font:15px/24px ${SANS};color:${COLOR.text};white-space:pre-wrap;word-break:break-word;">${escapeHtml(message)}</div>
    </td></tr>
    <tr><td style="padding:20px 28px 28px;">
      <a href="${escapeHtml(replyHref)}" style="display:inline-block;padding:12px 22px;background:${COLOR.cyanDeep};border-radius:4px;font:700 14px/18px ${MONO};color:#ffffff;text-decoration:none;">Reply to ${escapeHtml(firstName)} &rarr;</a>
    </td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">
    <tr><td style="padding:16px 28px;font:12px/18px ${SANS};color:${COLOR.muted};text-align:center;">
      Sent from the contact form on <a href="https://billodesign.com" style="color:${COLOR.muted};">billodesign.com</a>.<br>
      Hitting reply in your mail app also answers ${escapeHtml(firstName)} directly.
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, text, html };
}
