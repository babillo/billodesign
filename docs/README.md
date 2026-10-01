# Billodesign docs

Portfolio of Muhammad (Billodesign), migrated from Webflow to Next.js. It will be deployed on Vercel at https://billodesign.com.

**Status (2026-10-01):** Phases 1–5 done. Live at https://billodesign.com (Vercel). Phase 6: proposals ready for selection (phase-6-proposals.md).

## Stack
Next.js 16 (App Router) · React 19 · TypeScript · CSS Modules · GSAP + Lenis · Spline · lottie-web · Howler · OpenAI (chat) · Vercel

## Development
```bash
npm install
cp .env.example .env.local      # add OPENAI_API_KEY to enable the chat
npm run dev                     # http://localhost:3000
npm run lint && npx tsc --noEmit
npm run build && npm start      # production build
node scripts/import-webflow.mjs # regenerate content/*.json from the Webflow CSVs (see content.md)
```

## Documentation
| Doc | What's in it |
|---|---|
| [phase-1-audit.md](phase-1-audit.md) | original site audit |
| [phase-4-visual-qa.md](phase-4-visual-qa.md) | side-by-side comparison checklist |
| [phase-6-proposals.md](phase-6-proposals.md) | Phase 6 design-enhancement proposals (prioritized) |
| [migration.md](migration.md) | migration log: Confirmed / Assumption / Decision / Needs investigation, and the Webflow → Next mapping |
| [architecture.md](architecture.md) | structure, server/client split, services |
| [routes.md](routes.md) | every URL and redirect |
| [components.md](components.md) | component inventory |
| [content.md](content.md) | content model, how to add a project |
| [design-system.md](design-system.md) | tokens, typography, patterns |
| [animations.md](animations.md) | every animation and interaction |
| [seo.md](seo.md) | metadata, sitemap, SEO changes vs Webflow |
| [deployment.md](deployment.md) | Vercel and domain (Phase 5) |
| [decisions.md](decisions.md) | architecture decision records |
| [troubleshooting.md](troubleshooting.md) | problems and fixes |
| [learning-notes.md](learning-notes.md) | concepts worth remembering |
| [changelog.md](changelog.md) | changes by phase |

## Current status
- ✅ Visual rebuild of all pages, side-by-side QA against Webflow (Phase 4)
- ✅ AI chat live (gpt-4o-mini, real project knowledge)
- ✅ Contact form live (Turnstile → Resend → Zoho, branded notification email)
- ✅ Phase 5: billodesign.com on Vercel, `www`/`http` → apex, GA4, sitemap in Search Console, Webflow subdomain indexing off, Spline orb verified on real devices
- ⏳ Phase 6 design enhancement: 11 proposals awaiting selection
- Later (Phase 7): `og:description` is 149 characters (kept from Webflow; previews may truncate), per-project OG image sizes, performance budget
