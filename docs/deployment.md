# Deployment

**Status (2026-10-01):** live at https://billodesign.com (Vercel, from `main`). `www.` and `http://` redirect to the apex; post-deployment checks below done on 2026-10-01.

## How deployment works

- **Vercel project** is connected to GitHub `babillo/billodesign`.
  - Every push to `main` → **production** deployment.
  - Every other branch / pull request → **preview** deployment with its own URL. Use it to review a pull request before merging.
- **Build:** framework preset Next.js, default command `next build`, no custom settings. Pages are static; `/api/chat` and `/api/contact` run as serverless functions.
- **Workflow:** Claude works on a branch and opens a pull request; you review (optionally on the preview URL) and merge; Vercel deploys `main`.

## Environment variables

Set in Vercel → Project → Settings → Environment Variables. Listed in `.env.example`.

| Variable | Scope | Purpose | Status |
|---|---|---|---|
| `OPENAI_API_KEY` | server | AI chat; without it the chat uses fallback replies | ✅ verified 2026-09-30 (real answers about the projects) |
| `RESEND_API_KEY` | server | contact form delivery | set; awaiting a real-browser test email |
| `CONTACT_TO_EMAIL` | server | your Zoho inbox (never exposed to the browser) | set; awaiting a real-browser test email |
| `CONTACT_FROM_EMAIL` | server | e.g. `Billodesign <contact@send.billodesign.com>` | set; awaiting a real-browser test email |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | public, **baked in at build time** | Turnstile widget | ✅ in the build; widget renders |
| `TURNSTILE_SECRET_KEY` | server | Turnstile verification; required in production | set; awaiting a real-browser test email |
| `NEXT_PUBLIC_SITE_URL` | public | optional, defaults to `https://billodesign.com` | default is correct |

**Important:** variables are read when a deployment is built. After adding or changing any variable, **redeploy** (Deployments → latest → ⋯ → Redeploy). `NEXT_PUBLIC_*` values in particular are compiled into the JavaScript.

## Contact form setup (one time)

1. **Resend** (resend.com): add the domain **`send.billodesign.com`** (a subdomain, so your Zoho MX records on `billodesign.com` stay untouched). Add the DNS records Resend shows (SPF TXT, DKIM TXT, MX for bounces) in Cloudflare with the proxy **off** (grey cloud), and wait for "Verified". Create an API key with sending access → `RESEND_API_KEY`.
2. **Turnstile** (Cloudflare → Turnstile → Add widget): hostnames `billodesign.com`, `www.billodesign.com`, `billodesign.vercel.app` (and `localhost` for local tests), mode **Managed**. Site key → `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, secret → `TURNSTILE_SECRET_KEY`.
3. Set `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`, then **redeploy**.
4. Test on the live site **in a normal browser**: the email arrives with Reply-To = the visitor. (Automated/headless browsers never get a Turnstile token, so they always see "Spam check failed"; that is expected.)

## Domain cutover: billodesign.com → Vercel

Today `billodesign.com` 301-redirects to `billodesign.webflow.io` through a **Cloudflare redirect rule**.

1. **Vercel → Project → Settings → Domains:** add `billodesign.com` and `www.billodesign.com`. Choose `billodesign.com` as primary, so `www` redirects to it. Vercel then shows the exact DNS records to create.
2. **Cloudflare → Rules:** delete or disable the redirect rule that sends `billodesign.com` to `billodesign.webflow.io`.
3. **Cloudflare → DNS:** create or replace the records exactly as Vercel shows them (typically an `A` record for the apex and a `CNAME` for `www`). Set them to **DNS only (grey cloud)**. Vercel provides the CDN and SSL certificates, and Cloudflare's proxy in front of Vercel interferes with certificate issuance.
   - **Do not touch** the Zoho `MX`/`TXT` records (email) or the Resend records.
4. Wait for Vercel to show both domains as **Valid Configuration** (usually minutes; DNS can take up to a few hours).
5. **Webflow:** ✅ done 2026-10-01. Keep the site published for now as a fallback, with "Webflow subdomain indexing" **Off** so `billodesign.webflow.io` stops competing with the new site in search.
6. Run the post-deployment checks below on `https://billodesign.com`.

## Post-deployment checks

- [x] `https://billodesign.com` loads; `http://` and `www.` redirect to it
- [x] All 6 project URLs load; `/projects/gwp` (removed) → `/`; unknown URL → 404 page
- [x] `/robots.txt` allows crawling and lists the sitemap; `/sitemap.xml` lists 7 URLs on `billodesign.com`
- [x] Response headers on `billodesign.com` have **no** `X-Robots-Tag: noindex` (that header is only for `*.vercel.app`)
- [x] Share preview: paste the URL into LinkedIn Post Inspector / opengraph.xyz and check the image and title
- [x] AI chat answers with real project knowledge (not the canned fallback)
- [x] Contact form: submit a test message and receive it in Zoho
- [x] Google Analytics Realtime shows your visit (GA4 `G-MVZCKN2L6C`)
- [x] Spline orb on a real phone and laptop
- [x] Google Search Console: add the `billodesign.com` property (DNS verification in Cloudflare) and submit `sitemap.xml`

## Production settings already in the code

- Security headers on every response: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`, `Permissions-Policy` (`next.config.ts`).
- `X-Robots-Tag: noindex` on any `*.vercel.app` host; robots.txt also disallows everything on preview deployments.
- Error page (`app/error.tsx`) and 404 page (`app/not-found.tsx`).
- GA4 loads only in production builds.

## Rollback

- **Bad deployment:** Vercel → Deployments → pick the last good one → ⋯ → **Promote to Production** (instant, no rebuild).
- **Bad merge:** revert the pull request on GitHub (Revert button); Vercel redeploys `main`.
- **Emergency (site down after cutover):** re-enable the Cloudflare redirect rule to `billodesign.webflow.io` while you investigate.
