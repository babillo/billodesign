# Changelog

## Phase 1 — Reconnaissance / audit
### Added
- `docs/phase-1-audit.md`: 13-section migration report
- `docs/README.md`: docs index
- `docs/migration.md`: investigation of CMS exports, AI chat, contact form, template pages, sound, indexing, social links
- `docs/decisions.md`: ADR-001 (local content, no CMS), ADR-002 (chat via Next.js Route Handler)
### Changed
- Audit corrected: 10 projects (not 6)

## Phase 2 — Initial Next.js implementation

### Added
- Next.js 16 App Router app: homepage, 6 case-study pages, 404, sitemap, robots, redirects
- Content importer `scripts/import-webflow.mjs`: CSV → `content/*.json`, all assets self-hosted
- Design tokens and Webflow typography in `globals.css`; CSS Modules per component
- Experience layer: Spline orb, preloader, typed orb bubbles, scroll reveals, GSAP text effects, Lottie scroll scrub, Lenis, sound system (muted by default), contact modal, AI chat
- `/api/chat` (OpenAI gpt-4o-mini, server-side key, validation, rate limiting); `/api/contact` placeholder
- JSON-LD, canonical URLs, OG/Twitter metadata, JPEG OG image
- Docs: architecture, routes, components, content, design system, animations, SEO, decisions (ADR-003 to ADR-010), troubleshooting, learning notes

### Changed
- Webflow slider, IX2, Typed.js, SplitType, jQuery replaced by small local components / CSS
- Sound defaults to muted
- Content typos and incorrect alt text fixed

### Fixed
- SVGs extracted from the export (attribute casing and filter nesting)
- Page crash when the Spline scene fails to load

### Added (2026-09-30)
- Contact form delivery: Resend + Cloudflare Turnstile, honeypot, validation, rate limit (ADR-011)
- Chatbot: original system prompt restored; project and testimonial knowledge generated from content (ADR-012); keyword fallback replies

### Fixed (2026-09-30)
- Chat conversation history was never sent to the model in the original (`history` vs `conversationHistory`)
- Fallback keyword matching ("this" matched "hi", "working" matched "work")
- Reference chatbot files excluded from TypeScript and ESLint so they can't break the build

## Phase 4 — Visual QA (first pass, 2026-09-30)

### Added
- Homepage intro sequence (content revealed after the orb's greeting), reproduced from the live site
- Navbar scroll-spy highlight

### Fixed
- Project card thumbnail stretching; "Visit Site" underline
- Testimonial slider width on mobile (CSS cascade order)
- Rich-text spacer paragraphs restored
- CTA bubble max-width specificity
- Importer filename collisions (3 case-study images were replaced by same-named files)
- Rich-text figure sizing ported 1:1 from Webflow; video ratio from `data-rt-dimensions`
- Project card title weight identical for h3/h4
- `<strong>` rendered at 700 like Webflow (normalize.css), which fixed line wrapping differences

## Phase 3 — Architecture refinement (2026-09-30)

### Improved
- `Container` component replaces the wrapper repeated in 10 sections
- `useModalDialog` hook + `CloseIcon` shared by the contact modal and the AI chat
- Shared server helpers: `createRateLimiter`, `clientIp`; `prefersReducedMotion()` helper
- Lint config: one documented rule instead of 18 inline `eslint-disable` comments
- Removed unused CSS (Webflow center/float figure alignments, Bio anchor class)

### Accessibility
- "Skip to content" link
- Sound toggle: stable "Sound" label with `aria-pressed`
- AI chat: the typewriter reply is hidden from the live region; the finished reply is announced once

### Verified
- Layout identical before and after (home at 1440/390, OrbitAI at 390)
- Dependencies: all used; initial JS measured (see architecture.md)

## Phase 5 — Production / deployment (completed 2026-10-01)

### Added
- Deployed on Vercel: https://billodesign.vercel.app (verified: all routes, redirects, 404, sitemap, robots, assets, no client errors at 1440/390, layout identical to the local build)
- Security headers; `noindex` on `*.vercel.app` hosts
- Error page (`app/error.tsx`)
- deployment.md rewritten: environment-variable status, contact form setup, domain cutover steps, post-deploy checks, rollback

### Fixed (live-site feedback, 2026-09-30)
- Hero content flashed before the intro hid it: the intro flag is now set before the first paint
- Tech-stack Lottie and word-scrub animations froze: ScrollTriggers are re-measured when the intro ends
- "We got your back" subtitle was invisible (looked as if the dashboard image covered it): split words kept `position: static`
- Ambient background sound never played: non-preloaded sounds are loaded before playing
- Contact form: no submission without a Turnstile token; widget errors are shown; the server logs Turnstile error codes
- Contact form silently dropped real messages: Chrome autofill filled the honeypot (`company`); renamed to `hp_check` and drops are logged
- Contact notification email redesigned (`lib/server/contact-email.ts`): branded dark layout, sender details, source page, message block, "Reply to …" button, plain-text version
- Sound toggle: the muted (slashed) icon stayed visible under the "on" icon; the icons now cross-fade. Icon size back to the original 32px (was stretched to 51px)
- Sound toggle moved onto the same row as the AI chat launcher (24px inset, vertically centred; 20px on ≤768px). Owner change, not in the Webflow original

### Completed (2026-10-01)
- billodesign.com served by Vercel (apex primary; `www` and `http` redirect), Webflow subdomain indexing off
- Verified: share previews (LinkedIn, opengraph.xyz), GA4 Realtime, Spline orb on real phone and laptop, sitemap submitted in Search Console, contact email delivery, AI chat
