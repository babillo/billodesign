# Deployment

_Phase 5: not started. Placeholder with what's already known._

- **Platform:** Vercel, framework preset Next.js, build `next build`, no custom settings needed.
- **Environment variables:**
  - `OPENAI_API_KEY` (server-only, Production + Preview): enables `/api/chat`.
  - `NEXT_PUBLIC_SITE_URL` (optional): defaults to `https://billodesign.com`.
- **Preview deployments** are automatically `Disallow: /` in robots.txt (`VERCEL_ENV`).
- **Domain:** `billodesign.com` currently 301s to `billodesign.webflow.io` via Cloudflare. At cutover, point the domain to Vercel and remove that redirect. DNS steps will be documented here in Phase 5.
- **Analytics:** GA4 `G-MVZCKN2L6C` loads only in production builds.
