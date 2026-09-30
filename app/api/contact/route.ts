// Contact form endpoint: Cloudflare Turnstile (spam protection) + Resend
// (delivery to the business inbox). Owner decision, docs/decisions.md ADR-011.
//
// Environment variables (server-only unless NEXT_PUBLIC_):
//   RESEND_API_KEY        Resend API key
//   CONTACT_TO_EMAIL      where submissions are delivered (Zoho inbox); never sent to the browser
//   CONTACT_FROM_EMAIL    verified sender on a Resend-verified domain, e.g. "Billodesign <contact@send.billodesign.com>"
//   TURNSTILE_SECRET_KEY  Turnstile secret (widget site key is NEXT_PUBLIC_TURNSTILE_SITE_KEY)

import { clientIp, createRateLimiter } from "@/lib/server/rate-limit";

const LIMITS = { name: 256, email: 256, message: 5000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 5 submissions per 10 minutes per IP (ADR-004).
const isRateLimited = createRateLimiter({ windowMs: 10 * 60_000, max: 5 });

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Local development without Turnstile keys; production must be configured.
    return process.env.NODE_ENV !== "production";
  }
  if (!token) return false;
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  });
  const data = (await res.json().catch(() => null)) as { success?: boolean } | null;
  return data?.success === true;
}

export async function POST(request: Request) {
  const ip = clientIp(request);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const str = (key: string) => (typeof body[key] === "string" ? (body[key] as string).trim() : "");
  const name = str("name");
  const email = str("email");
  const message = str("message");

  // Honeypot filled in: pretend success so bots don't learn anything.
  if (str("company")) return Response.json({ ok: true });

  if (!name || !email || !message || name.length > LIMITS.name || email.length > LIMITS.email || message.length > LIMITS.message || !EMAIL_RE.test(email)) {
    return Response.json({ error: "Please fill in all fields with a valid email." }, { status: 400 });
  }

  if (isRateLimited(ip)) return Response.json({ error: "Too many messages. Please try again later." }, { status: 429 });

  if (!(await verifyTurnstile(str("turnstileToken"), ip))) {
    return Response.json({ error: "Spam check failed. Please try again." }, { status: 403 });
  }

  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
    console.error("Contact form: Resend is not configured");
    return Response.json({ error: "Contact form is not configured." }, { status: 503 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({
      from: CONTACT_FROM_EMAIL,
      to: [CONTACT_TO_EMAIL],
      reply_to: email,
      subject: `New transmission from ${name.slice(0, 80)}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${escapeHtml(name)}<br><strong>Email:</strong> ${escapeHtml(email)}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    }),
  });

  if (!res.ok) {
    console.error("Resend error", res.status, await res.text().catch(() => ""));
    return Response.json({ error: "Could not send your message." }, { status: 502 });
  }
  return Response.json({ ok: true });
}
