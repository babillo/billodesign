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
