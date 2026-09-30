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
