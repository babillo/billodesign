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
- Sound toggle: icon and audio could get out of sync after a reload (first click raced the remembered-state resume); the remembered state now shows immediately
- Sound: a remembered "on" plays again on revisit (immediately if the browser allows autoplay, else on the first interaction); no duplicate loops on unlock (owner decision, ADR-014)
- Homepage intro plays once per tab; Back/Forward restores the scroll position without the preloader or welcome message (ADR-014)

## Phase 6 — Design enhancement (started 2026-10-01)

### Added
- `docs/phase-6-proposals.md`: 11 prioritized proposals from a page-by-page review at desktop and mobile

### Fixed
- Content typos in the OrbitAI case study ("maintainance", two missing spaces), also added to the importer's typo list

### Batch A (owner-approved 2026-10-01)
- #1 Awwwards badge smaller on phones (34×110px), same position
- #2 Scroll, swipe or key press skips the rest of the homepage intro (after the preloader)
- #4 Navbar gets a dark glass backdrop after scrolling
- #6 Slider dots: 32px-tall touch areas, bars pixel-identical, no overlap
- #10 Shorter social-share description (`site.shareDescription`)
- "What I Build" heading: double space removed

### Batch B
- #5 Case-study screenshots open full-screen (`ImageLightbox`): keyboard, swipe, captions, counter
- Accessibility: the 31 case-study images had Webflow's placeholder alt text `__wf_reserved_inherit`, which screen readers read out; they now use their caption or "<Project> screenshot" (importer `fixImageAlts`)
- Typo: "OrbitAI Dashboad" → Dashboard

### Batch C
- #7 Case studies: reading-progress line and "Sections" jump menu (`CaseStudyNav`)
- #8 New footer: name, role, availability, nav, contact, email, back to top
- Layout shift fixed: rich-text images now carry width/height (importer `addImageDimensions`), and fullwidth figure wrappers are block-level so the space is reserved. Case-study pages no longer grow by up to about 11,000px while scrolling (OrbitAI: 11,888 → 22,054px before, now 22,185px from the first paint); final figure positions verified identical on all 6 projects at 1440/390

### Batch D
- #9 Page transitions: content crossfades between routes (React `<ViewTransition>`, 0.3s, reduced motion respected)
- Back/Forward scroll restore moved to a layout effect (no flash at the top)

### Fixed (after merge)
- CTA "What are you waiting for?" bubble didn't show on phones after the new footer: it is now triggered by its own spot under the social links instead of the page end

### Reverted (owner decision, 2026-10-02)
- #8 footer: back to the original Webflow footer (divider + copyright). The space under the CTA belongs to the orb's speech bubble ("What are you waiting for?"), which appears next to the orb at the page end; the fuller footer crowded it. The CTA bubble trigger is back to the original `#page-end` marker

### Round 2 (owner-approved 2026-10-02)
- "Selected Work": the slider is replaced by a grid showing all 6 projects (`ProjectTile`): screenshot, title, one-line tag, tools, Visit site; the whole card opens the case study; rectangular "View case study" button
- Services cards: pointer-following cyan glow on hover (`CursorGlow`)

### Round 3 (owner-approved 2026-10-02)
- Hero: "View my work ↓" link next to "Work With Me", plus a scroll cue
- Navbar: "Available for projects" status pill (opens the contact form)
- "We got your back": fixed dashboard backdrop with thin glass stat cards that count up
- Testimonials: 2×2 grid on desktop
- Bio: stats strip (3+ years, 15+ projects, Certified Webflow Partner, Awwwards Nominee)
- Section labels "decode" from random glyphs when scrolled in
- "We got your back": content centred again (row flex had shrunk it to the left)

### Round 3 follow-ups (owner feedback 2026-10-02)
- Hero: only "Work With Me" on phones
- Stats now count on first visits (the counter skipped itself while the intro hid the page)
- Testimonials: back to the slider everywhere (grid dropped)
- Project tiles: "View case study" always visible on touch devices (some phones report hover support); 5rem/4rem row gap
- No hover/orb sounds from taps on touch screens
- Navbar status dot: cyan
- Decoding now also plays on section titles, and replays every time they scroll into view
- Stat cards: cycling cyan border like the service cards (`.gradient-border-glass`, keeps the glass see-through)
- Hero heading and paragraph decode too (text-node based, keeps line breaks; case-matched glyphs; longer text takes longer)
- Bio: years of experience computed from 2022 (owner correction: 4+ years, not 3+)
- Bio: "Nominee · Awwwards" replaced by "Google UX · Certified"; Webflow stat reads "Webflow · Certified Partner"; smaller values on phones so they fit one line
- Bio: "Google UX · Certified Professional"
