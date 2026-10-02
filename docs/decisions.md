# Architecture Decision Log

## ADR-001 — Local content files instead of a headless CMS

Date: 2026-09-29

Decision:
Store projects and testimonials as local typed content in the repo, generated from the official Webflow CSV exports. No headless CMS.

Context:
Webflow code export excludes CMS content. The owner exported the Projects (10 items) and Testimonials (4 items) collections as CSV.

Reason:
Small, rarely-changing dataset with a single editor. Local content is versioned, free, fast (static generation), and has no runtime dependency.

Alternatives:
Sanity/Contentful/other headless CMS; keeping Webflow as a CMS via its API.

Trade-offs:
Editing requires a code change and deploy (acceptable for one developer-owner). Revisit if content volume or non-technical editors appear.

## ADR-002 — AI chat moves behind a Next.js Route Handler

Date: 2026-09-29

Decision:
Rebuild the chat backend as `/api/chat` in the Next.js app; keep the existing browser UI and request/response shape.

Context:
The existing endpoint is a Webflow Cloud Astro app with no CORS support, so `billodesign.com` browsers can't call it after migration. It has no rate limiting. Model/prompt are not visible from outside.

Reason:
Removes the Webflow dependency, keeps the API key server-side, allows rate limiting, and keeps the frontend contract (`{message, conversationHistory}` → `{response}`) so the UI port is straightforward.

Alternatives:
Proxy to the old Webflow Cloud endpoint from a Next.js route (a possible short-term bridge); call the provider from the browser (rejected, it exposes the key).

Trade-offs:
Needs the provider API key and a system prompt (recover the original, or rewrite if unrecoverable). Model choice stays the same as the original once confirmed.

## ADR-003 — Keep gpt-4o-mini and the original generation settings for the chat

Date: 2026-09-29

Decision:
The new `/api/chat` uses OpenAI `gpt-4o-mini`, `max_tokens: 500`, `temperature: 0.9`, the same as the original Astro app.

Context:
Confirmed from the original `src/pages/api/chat.ts`. The owner asked not to upgrade the model just for the sake of it.

Reason:
Reproduce the existing behavior first; evaluate models/cost separately later.

Alternatives:
Newer/cheaper models (deferred to a later, evidence-based evaluation).

Trade-offs:
Behavior parity now; any model change becomes a deliberate, documented decision.

## ADR-004 — Best-effort in-memory rate limiting for /api/chat

Date: 2026-09-29

Decision:
Limit each IP to 10 chat requests per minute using an in-memory map in the route handler.

Context:
The original endpoint had no rate limiting at all (8 rapid requests all succeeded). Every request costs OpenAI tokens.

Reason:
Zero dependencies and zero infrastructure. It stops casual bursts.

Alternatives:
Upstash Redis rate limiter (shared across instances, needs an account and env vars); a Vercel Firewall rate-limit rule (configured in the dashboard, no code).

Trade-offs:
Vercel serverless instances don't share memory, so a determined abuser spread across instances isn't stopped. Revisit with a Vercel Firewall rule at deployment (Phase 5).

## ADR-005 — Plain CSS: global tokens + CSS Modules, no Tailwind

Date: 2026-09-29

Decision:
Design tokens and base typography live in `app/globals.css`; every component has a colocated `*.module.css`.

Context:
The Webflow design is a hand-tuned, token-driven system (Client-First) with specific rem values and three breakpoints.

Reason:
Webflow values translate 1:1 into CSS, which makes the migration auditable (every rule cites its Webflow class). No build plugin, no utility-class translation layer.

Alternatives:
Tailwind (fast to write, but every value would need mapping, and arbitrary values proliferate); CSS-in-JS (runtime cost, poor fit for server components).

Trade-offs:
Slightly more CSS files; media queries are repeated per module instead of shared utilities.

## ADR-006 — Interactions are triggered through data attributes

Date: 2026-09-29

Decision:
Server components mark elements with attributes (`data-open-contact`, `data-sound-click`, `data-sound-hover`, `data-reveal`, `data-text`). A few client providers listen at document level.

Context:
The original site used the same pattern (custom attributes plus a global script). Most sections are static and should ship no JavaScript.

Reason:
Keeps the homepage sections as server components. A button can open the modal or play a sound without its parent becoming a client component.

Alternatives:
Make each interactive section a client component (more JS, more hydration); pass callbacks through props (not possible from server components).

Trade-offs:
Behavior is less discoverable from the markup alone. It's documented in `docs/animations.md` and in the provider files.

## ADR-007 — Replace small libraries with tiny local components

Date: 2026-09-29

Decision:
Drop jQuery, Typed.js, SplitType, the Webflow slider and the Webflow IX2 runtime. Rebuild them as `TypedText`, `Slider`, CSS keyframes (preloader, pulse dot) and GSAP SplitText.

Reason:
Each replacement is under about 150 lines and covers exactly what the site used. jQuery and the duplicate GSAP were only needed by the old scripts.

Alternatives:
Keep Typed.js (about 6 KB) or use Embla/Swiper for sliders.

Trade-offs:
Local code to maintain, but no dependency updates to chase and a smaller bundle.

Kept as dependencies (each earns its place): **GSAP** (ScrollTrigger + SplitText text effects), **Lenis** (the site's signature smooth scroll), **@splinetool/react-spline** (the orb, a core experience), **lottie-web** (tech-stack animation, SVG-only build), **howler** (audio: loaded only after the visitor enables sound).

## ADR-008 — Rich text stored as sanitized HTML, not MDX

Date: 2026-09-29

Decision:
CMS rich-text fields are cleaned by `scripts/import-webflow.mjs` and stored as HTML strings in `content/projects.json`. They're rendered with `dangerouslySetInnerHTML`.

Context:
The content comes from Webflow CSVs as HTML with figures, lists, embedded videos and headings.

Reason:
Lossless and simple. Converting 6 projects' HTML to MDX would risk formatting drift for no functional benefit.

Alternatives:
MDX per project; a structured block format.

Trade-offs:
Editing a case study means editing HTML inside JSON, which is awkward. If projects start being edited often, migrate them to MDX files then. The HTML is trusted, because it's the owner's own content, not user input.

## ADR-009 — Embed Wistia directly instead of through Embedly

Date: 2026-09-29

Decision:
Rewrite `cdn.embedly.com/widgets/media.html?src=…wistia…` iframes to `https://fast.wistia.net/embed/iframe/<id>`.

Reason:
The same video with one less third party and one less redirect layer.

Trade-offs:
None visible.

## ADR-010 — Social preview image converted from AVIF to JPEG

Date: 2026-09-29

Decision:
`public/images/og-image.jpg` (1200×630), generated from the original AVIF `og:image`.

Reason:
Facebook, LinkedIn and X don't render AVIF preview images, so the original share image most likely never showed.

Trade-offs:
A small crop to the standard 1.91:1 ratio.

## ADR-011 — Contact form: Resend + Cloudflare Turnstile

Date: 2026-09-30

Decision:
`/api/contact` verifies a Turnstile token, then sends the submission through the Resend REST API to the Zoho business inbox, with reply-to set to the visitor.

Context:
Webflow Forms stops working after migration. Owner priorities: reliable delivery, spam protection, server-side handling, minimal infrastructure, low cost. Options are compared in migration.md §3.

Reason:
Resend handles SPF/DKIM on a sending subdomain (better deliverability than SMTP from serverless) and has a free tier of 3,000 emails/month. Turnstile is free and invisible for most visitors (`appearance: interaction-only`), so the form design is unchanged. Both are called with `fetch`, so no SDK dependency.

Alternatives:
Zoho SMTP via nodemailer (plan-dependent, slower from serverless); hosted form services (a third party holds the data).

Trade-offs:
Two accounts to set up and DNS records for a sending subdomain. Layered defenses: Turnstile, honeypot, validation, per-IP rate limit, HTML escaping in the email body.

## ADR-012 — Chatbot knowledge generated from site content

Date: 2026-09-30

Decision:
Keep the original persona prompt verbatim, and append "Projects" and "What clients say" sections generated at build time from `content/*.json`.

Context:
The original bot knew only generic project types, not Muhammad's actual projects.

Reason:
A single source of truth: adding or editing a project automatically updates what the bot knows. Instructions forbid inventing projects, clients or prices.

Alternatives:
Hand-written project list in the prompt (goes stale); retrieval/embeddings (overkill for 6 projects).

Trade-offs:
About 3.8k input tokens per request (≈ $0.0006 with gpt-4o-mini; OpenAI caches the repeated prefix automatically).

Also fixed: the original endpoint read `history` while the widget sent `conversationHistory`, so the bot never saw earlier messages. It now does, up to 10.

## ADR-013 — Phase 3 refactors: shared Container, dialog hook, server helpers

Date: 2026-09-30

Decision:
- `components/ui/Container`: the Webflow Client-First wrapper (padding-global → container-large → padding-section-*), repeated in 10 sections.
- `useModalDialog(open)`: the `<dialog>` open/close sync shared by the contact modal and the AI chat. `CloseIcon` shared by both.
- `lib/server/rate-limit.ts` (`createRateLimiter`, `clientIp`) shared by `/api/chat` and `/api/contact`; `lib/motion.ts` (`prefersReducedMotion`) replaces 6 inline checks.
- The `@next/next/no-img-element` lint rule is turned off in `eslint.config.mjs` (with the rationale) instead of 18 inline disables.

Context:
Phase 3 review for duplicated code and noise.

Reason:
Each abstraction had at least 2 real uses. The layout was verified identical before and after (section geometry compared at 1440/390 on home and OrbitAI).

Alternatives:
Leave the duplication (fewer files but drift risk); a generic Section component with heading props (premature: sections differ too much).

Trade-offs:
One more indirection when reading a section. The lint rule is off globally, so reviewers must keep using `next/image` for photos (documented in architecture.md).

## ADR-014 — Remembered sound and once-per-visit intro

Date:
2026-10-01

Decision:
(1) A remembered "sound on" starts audio on the next visit: immediately if the browser allows autoplay, otherwise on the first interaction. (2) The homepage preloader and intro play once per browser tab. Back/Forward restores the previous scroll position without replaying them; a reload replays them.

Context:
After launch the owner compared the site with Webflow: there, sound came back on revisit, and going back to the homepage returned to the same spot without the preloader (full page loads plus the browser's back-forward cache). Client-side navigation in Next.js re-mounted the homepage, replaying the intro and resetting the scroll position.

Reason:
Preserve the original experience (CLAUDE.md: the Webflow site is the reference). Browser autoplay rules still apply, and no site can bypass them.

Alternatives:
Keep "always start muted" (earlier choice, replaced by the owner). Disable client-side navigation (loses fast navigation and prefetching).

Trade-offs:
Returning sound-on visitors download about 400 KB of audio on page load (the 1.4 MB ambient track loads when it starts). A `sessionStorage` flag and an inline head-script check add a little complexity; reduced-motion visitors are unaffected (no intro).

## ADR-015 — Optimize rich-text images at render time, not in the content files

Date:
2026-10-02

Decision:
Rewrite case-study `<img>` tags when the page renders (static, so at build) with `getImageProps` from `next/image`, so they go through the Next.js image optimizer. `content/projects.json` keeps the original paths.

Context:
The rich text is HTML from the Webflow CMS export, rendered with `dangerouslySetInnerHTML`, so it never used `next/image`. Pages shipped the original uploads (up to 3060 px) into an 800 px column: 18.4 MB of images on OrbitAI.

Reason:
One small function (`lib/rich-text.ts`) fixes every current and future project. `getImageProps` produces the same URLs and `srcset` as `<Image>`, so it follows the config (formats, widths). No generated files in the repo, and the importer stays unchanged.

Alternatives:
Generate AVIF/WebP variants in the importer (≈3 files per image in the repo, a build step to remember); parse the HTML into React elements and use `<Image>` (more code, a parser dependency).

Trade-offs:
Uses Vercel image transformations (cached; small numbers here). The `<img>` fallback `src` points at the largest width, which only browsers without `srcset` support would use.

## ADR-016 — Orb: poster first, runtime after load, paused when unseen

Date:
2026-10-02

Decision:
Show a still render of the Spline scene immediately, start loading the Spline runtime after the window `load` event plus an idle moment, and `stop()` the scene while a modal is open or an opaque section covers it. Spline stays; the scene is unchanged.

Context:
Phase 7 baseline: the orb's runtime (~700 KB gzip) started at idle and overlapped page loading, and the scene rendered every frame even when nothing could see it. CLAUDE.md: optimize the orb, never remove it; Layer 1 = immediate visual.

Reason:
The camera scales the scene with the canvas height and centres it, so one 13 KB wide image with `object-fit: cover` matches the live orb at every viewport (verified at 390–1920 px). Visitors see the orb at once, and the expensive part no longer competes with first paint or the case-study header.

Alternatives:
Replace Spline with Three.js/R3F (large rewrite, fidelity risk, rejected for now); load on first interaction (the main-thread freeze would land exactly when the visitor acts); keep idle loading (baseline behaviour).

Trade-offs:
The poster must be re-rendered if the scene's look changes. The live orb appears slightly later than before on fast machines (after `load`), hidden by the poster. Lab Total Blocking Time is still dominated by the runtime's own start-up; that's what round 2 (P4e adaptive quality, P4f scene check) targets.
