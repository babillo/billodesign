# Billodesign docs

Portfolio of Muhammad (Billodesign), migrated from Webflow to Next.js. It will be deployed on Vercel at https://billodesign.com.

**Status:** Phases 1–4 done. Next: Phase 5 (Vercel deployment). Homepage, 6 case studies, 404, sitemap/robots, redirects and the AI chat endpoint are built; the site builds and runs. Open items are listed under "Current status" below.

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
- ✅ Visual rebuild of all pages (first pass, not yet compared side by side with the live site: Phase 4)
- ✅ AI chat: original prompt + generated project knowledge + fallbacks; needs `OPENAI_API_KEY` in Vercel
- ✅ Contact form: Resend + Turnstile implemented; needs accounts/keys (deployment.md)
- ✅ Phase 3 refinement, ✅ Phase 4 visual QA (orb still to check on a real device)
- ⏳ Phase 5 deployment
