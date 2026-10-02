# Architecture

## Overview

- **Next.js 16 App Router**, TypeScript, React 19. Every page is statically generated at build time.
- **Content:** local JSON generated from the Webflow CSV exports. No CMS (ADR-001).
- **Styling:** global design tokens + CSS Modules (ADR-005).
- **Interactivity:** a small set of client components, triggered from server-rendered markup via data attributes (ADR-006).
- **Server code:** two route handlers, `/api/chat` (OpenAI) and `/api/contact` (Turnstile + Resend → Zoho inbox, ADR-011).
- **Hosting:** Vercel (Phase 5).

```
app/
  layout.tsx            fonts, default metadata, global chrome, providers, GA4
  globals.css           tokens, typography, shared primitives, rich text, reveal
  page.tsx              homepage (+ JSON-LD)
  projects/[slug]/      case-study template (generateStaticParams, dynamicParams=false)
  not-found.tsx         404
  sitemap.ts, robots.ts
  api/chat/route.ts     AI assistant (server-only OpenAI key)
  api/contact/route.ts  contact form: validation, honeypot, rate limit, Turnstile, Resend
components/
  layout/       Navbar, Footer, SocialLinks, AwwwardsBadge
  home/         homepage sections (Hero, WeGotYou, Services, TechStack, Projects, Testimonials, Bio, Preloader)
  projects/     ProjectCard, ProjectHeader, ProjectSection, VisitSiteLink
  testimonials/ TestimonialCard
  sections/     Cta (+ CtaOrbTips), shared by home and project pages
  ui/           Button/PulseDot, SectionHeading, Slider, Ellipses, ShadowTitle
  experience/   client-side experience layer: SplineOrb, SoundProvider, SoundToggle,
                ContactModalProvider, ContactModal, AiChat, OrbSpeech, TypedText,
                SmoothScroll, ScrollEffects, OrbErrorBoundary
content/        projects.json, testimonials.json (generated; see content.md)
lib/            content.ts (typed accessors), site.ts (site-wide copy/links), gsap.ts, motion.ts,
                chat/ (system prompt, fallbacks), server/ (rate-limit.ts, contact-email.ts)
scripts/        import-webflow.mjs (CSV → content + asset download)
public/         icons/, images/, media/ (project + testimonial assets), audio/, lottie/
webflow/export/ original Webflow export + CMS CSVs (reference only; excluded from lint)
```

## Routing

| URL | Source |
|---|---|
| `/` | `app/page.tsx` |
| `/projects/<slug>` | `app/projects/[slug]/page.tsx`, 6 slugs from `content/projects.json`; unknown slugs → 404 |
| 4 removed project URLs | 308 permanent redirect → `/` (`next.config.ts`) |

Details: [routes.md](routes.md).

## Server vs client components

**Decision:** server components by default. A component is a client component only when it needs browser APIs, state or effects.

| Client component | Why it can't be a server component |
|---|---|
| `Navbar` | mobile menu open/close state |
| `Slider` | current slide state, pointer/keyboard handlers |
| `SplineOrb` (+ `OrbErrorBoundary`) | WebGL runtime; lazy import after idle |
| `TechStackLottie` | Lottie player + ScrollTrigger |
| `SoundProvider`, `SoundToggle` | Howler, localStorage, visibility events |
| `ContactModalProvider`, `ContactModal` | open state, `<dialog>`, fetch |
| `AiChat` | chat state, fetch, typewriter |
| `OrbSpeech`, `TypedText`, `CtaOrbTips` | timers, IntersectionObserver |
| `SmoothScroll`, `ScrollEffects` | Lenis / GSAP need `window` |

Everything else (all sections, cards, headers, footer) renders on the server as static HTML.

**Consequence:** most of the page is plain HTML. JavaScript is limited to the experience layer, and the heaviest parts (Spline, Lottie, Howler) are loaded dynamically.

## Styling

`globals.css` holds the tokens (`--color-cyan`, `--padding-global`, …), the Webflow tag styles (h1–h6, p), layout wrappers (`.padding-global`, `.container-large`, `.padding-section-large`), the animated `.gradient-border`, `.rich-text` and the reveal states. Components use CSS Modules, and each rule comments the Webflow class it replaces. See [design-system.md](design-system.md).

## Animation

See [animations.md](animations.md). In short: CSS for simple loops and transitions; GSAP + ScrollTrigger + SplitText for text effects and Lottie scrubbing; Lenis for smooth scroll; Spline for the orb. Everything respects `prefers-reduced-motion`.

## Assets

- All images and audio are self-hosted under `public/`. Nothing loads from the Webflow CDN.
- `next/image` optimizes cards, thumbnails, avatars and the portrait into AVIF/WebP at the right sizes.
- Case-study images inside rich text are rewritten at build time by `lib/rich-text.ts` to use the Next.js image optimizer (`getImageProps`: AVIF/WebP, `srcset` sized to the measured column width). Content files keep the original paths (ADR-015).
- Animations are animated WebP (orb GIFs: preloader, contact modal, chat) or MP4/WebM video (FlexiBank). No GIFs are served any more.
- Rule of thumb: photos and screenshots use `next/image`. SVG icons, animated images and tiny decorative images use `<img>` (the lint rule is off for this reason, ADR-013).

## JavaScript budget (measured Phase 3)
- Initial JS per page: **about 240 KB gzip**, of which about 160 KB is the React/Next.js runtime and 45 KB is GSAP + ScrollTrigger + SplitText. The rest is app code, Lenis and the providers.
- Loaded on demand: Spline runtime (after the `load` event, ADR-016), lottie-web (SVG build, near Tech Stack), Howler (only after sound is enabled), the Turnstile script (only with the contact modal open).
- Phase 7 candidate: defer GSAP until after first paint.

## External services

| Service | Used for | Where |
|---|---|---|
| Spline (prod.spline.design) | 3D orb scene | `SplineOrb.tsx` |
| Wistia | project videos | rich text + `ProjectHeader` |
| OpenAI | AI chat, `gpt-4o-mini` | `app/api/chat/route.ts` |
| Google Analytics 4 (`G-MVZCKN2L6C`) | analytics (production only, `lazyOnload` since Phase 7) | `app/layout.tsx` |
| Google Fonts | fetched **at build time** by `next/font`, self-hosted | `app/layout.tsx` |

## Deployment

Vercel, static pages + two serverless routes. See [deployment.md](deployment.md) (Phase 5).

### Decision: page transitions with React `<ViewTransition>` (Phase 6)
**Decision →** wrap page content in `<ViewTransition>` (React canary bundled with Next.js 16; no config). **Reason →** native browser API, no JS animation library, progressive (no-op where unsupported). **Alternative considered →** Framer Motion/GSAP route transitions (extra dependency, manual mount/unmount handling, fights Lenis). **Consequence →** crossfade on link navigations only; layout-effect scroll restore so snapshots are correct.
