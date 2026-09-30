# Deployment

_Phase 5: not started. Placeholder with what's already known._

- **Platform:** Vercel, framework preset Next.js, build `next build`, no custom settings needed.
- **Environment variables** (all listed in `.env.example`):

  | Variable | Scope | Purpose |
  |---|---|---|
  | `OPENAI_API_KEY` | server | AI chat; without it the chat uses fallback replies |
  | `RESEND_API_KEY` | server | contact form delivery |
  | `CONTACT_TO_EMAIL` | server | your Zoho inbox (never exposed to the browser) |
  | `CONTACT_FROM_EMAIL` | server | e.g. `Billodesign <contact@send.billodesign.com>` |
  | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | public | Turnstile widget |
  | `TURNSTILE_SECRET_KEY` | server | Turnstile verification; **required in production** or the form rejects submissions |
  | `NEXT_PUBLIC_SITE_URL` | public | optional, defaults to `https://billodesign.com` |

## Contact form setup (one time)

1. **Resend** (resend.com): create an account, then add the domain **`send.billodesign.com`** (a subdomain, so your Zoho MX records for `billodesign.com` stay untouched). Add the DNS records Resend shows (SPF TXT, DKIM TXT, MX for bounces) at your DNS provider (Cloudflare), and wait until the domain is "Verified". Create an API key with "Sending access" → `RESEND_API_KEY`.
2. **Turnstile** (Cloudflare dashboard → Turnstile): add a widget for hostnames `billodesign.com`, `www.billodesign.com` and `localhost`, mode "Managed". Copy the site key → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, and the secret → `TURNSTILE_SECRET_KEY`. Add your Vercel preview domain too if you want the form to work on previews.
3. Set `CONTACT_TO_EMAIL` (your Zoho address) and `CONTACT_FROM_EMAIL` in Vercel, then redeploy.
4. Test: submit the form on the live site; the email arrives with **Reply-To** set to the visitor.
- **Preview deployments** are automatically `Disallow: /` in robots.txt (`VERCEL_ENV`).
- **Domain:** `billodesign.com` currently 301s to `billodesign.webflow.io` via Cloudflare. At cutover, point the domain to Vercel and remove that redirect. DNS steps will be documented here in Phase 5.
- **Analytics:** GA4 `G-MVZCKN2L6C` loads only in production builds.
