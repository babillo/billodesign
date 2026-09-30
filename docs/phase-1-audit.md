# Phase 1 — Reconnaissance / Audit Report

Date: 2026-09-29
Sources: `webflow/export/` (Webflow code export) and the live site `https://billodesign.webflow.io/` (used for CMS content, which the export does not contain).

## 1. Current website architecture

- Built and hosted on Webflow (site id `68f3884d9e35f473a885d321`). Static export of the Designer output, not the CMS content.
- **One long single-page homepage** with anchor navigation (`#portfolio`, `#about-me`, Contact opens a modal).
- **One CMS collection ("Projects")** rendered as `/projects/[slug]` from a single template.
- A dark, sci-fi/"AI orb" themed experience: 3D Spline orb, sound effects, typewriter text, GSAP text animation, Lenis smooth scroll, Lottie tech-stack graphic, an AI chat widget.
- `billodesign.com` currently returns a **301 (Cloudflare) to `billodesign.webflow.io`**. So the custom domain has no independent live site or sitemap today.

## 2. Page / route inventory

| Route | Source | Notes |
|---|---|---|
| `/` | `index.html` | Home: preloader, hero, "We got your back", services, tech stack, selected work slider, testimonials, bio, CTA, footer, contact modal, AI chat |
| `/projects/elegantnast` | CMS | |
| `/projects/flexibank---online-banking-mobile-app` | CMS | Slug contains `---`; keep exactly to preserve the URL |
| `/projects/macrostate-landing-page` | CMS | |
| `/projects/orbitai` | CMS | |
| `/projects/personal-brand-it-portfolio` | CMS | |
| `/projects/timms-team-landing-page` | CMS | |
| `404` | `404.html` | "Page Not Found / Go Home" |
| `401` | `401.html` | Webflow password-protected page. Not needed unless pages are password-protected |
| `detail_testimonial.html` | Webflow | Template for a Testimonials collection. Empty; testimonials appear only inline on the homepage. **Not routed publicly, confirm with owner** |
| `style-guide.html` | Webflow | Internal style guide; not a public page. Useful as a design-token reference |

## 3. Component / section inventory

Homepage sections (class names from export): `nav_fixed` (navbar), `c-preloader` (preloader), `section_home-hero` (with Spline orb + Typed text + sound button), `section_home-wegotyou` (scrub-per-word statement + performance dashboard image), `section_home-services` (3 services), `section_home-tech-stack` (Lottie), `section_home-project` (6-project slider), `section_home-testimoinal` (sic; 4 testimonials, slider), `section_home-bio`, `section_home-cta` (+ social icons), `section_footer`, plus global overlays: **contact modal** (`modal_*`, Webflow form), **AI chat** (`ai-chat-*`).

Project template sections (same on every project): hero (title, Visit Site), meta list (Role, Timeline, Tools, Client, Industry, Market), Project Overview, The Challenge/Problem (Problem Statement, Goal Statement), Research & Insights, Design Process (Low Fidelity Wireframes, Design System, Final Designs & Prototype, High Fidelity), The Solution, The Result, Visual Showcase, Case Study, Client Feedback, "Next Project" card, CTA, footer.

Candidate React components: `Navbar`, `Preloader`, `Hero`, `OrbScene` (client), `TypedText` (client), `SoundToggle` (client), `SplitTextReveal` (client), `SectionHeading`, `ServiceCard`, `TechStackLottie` (client), `ProjectSlider`/`ProjectCard`, `TestimonialSlider`, `Bio`, `CtaSection`, `SocialLinks`, `Footer`, `ContactModal` (client), `AiChat` (client), `ProjectPage` sections + `RichText`.

## 4. CMS / content model

Only **Projects** is populated. Fields observed (from the template and 6 live pages):

- Name (h1), Slug, SEO meta description, Thumbnail/OG image, short description, external "Visit Site" URL, tools (icon logos: Webflow/Figma/JS), thumbnail image(s)
- Meta: Role, Timeline, Tools, Client, Industry, Market
- Rich-text blocks: Project Overview, Problem Statement, Goal Statement, Research & Insights, Low-fi Wireframes, Design System, Final Designs & Prototype, High-fi Wireframes, The Solution, The Result, Visual Showcase (images), Case Study, Client Feedback
- Next Project (reference to the next item)

Six items, rarely changing, written by one person → **a headless CMS is not justified**. Recommendation: typed local data + MDX per project (see §11). Full field values still need to be extracted from the live pages; this is the main content-migration task for Phase 2.

Testimonials (4) and services (3) are static on the homepage; keep as local data.

## 5. Animation / interaction inventory

| Interaction | Tech today | Trigger |
|---|---|---|
| Smooth scrolling | Lenis 1.3.11 (duration 2), `console.log` on scroll left in | Always |
| Preloader ("c-preloader") | Webflow IX2 + GIF | Page load |
| Hero headline letters fade in | GSAP + SplitType, `[letters-fade-in-delay]` | Load |
| Text reveals: `words-slide-up`, `words-rotate-in`, `words-slide-from-right`, `letters-slide-up`, `letters-fade-in` | GSAP timelines + ScrollTrigger (play at `top 60%`, reset on leave back) | Scroll |
| Scrub each word (opacity 0.4→1) | GSAP ScrollTrigger scrub, `[scrub-each-word]` | Scroll |
| Typewriter text (hero, footer button, footer, modal) | Typed.js 2.1.0 | Load / loop |
| 3D orb | Spline scene `prod.spline.design/mFnZxSV0j4KZp6WS/scene.splinecode` via Webflow's Spline element | Always; reacts to hover |
| Tech stack graphic | Lottie (`documents/tech-stack-lottie2.json`, 71 KB) | Scroll into view |
| Sound design | Howler 2.2.3: hover/click beeps, background loop, orb sounds, typing loop, mute toggle persisted in `localStorage("soundOn")`, pause on hidden tab | Hover/click/visibility |
| Section headings (`h2`) fade/translate-in | Webflow IX2 (`data-w-id`, 27 elements) | Scroll |
| Project slider, testimonial slider | Webflow native slider (14 `w-slider` refs) | Click/swipe |
| Contact modal open/close | Webflow IX2 (jQuery version commented out) | Click |
| Nav: backdrop-blur fixed bar, mobile menu | Webflow navbar component | Click |
| Scroll position save/restore | `sessionStorage` script | unload/load |
| Hover: buttons/thumbnails | Webflow IX2 + CSS | Hover |

## 6. Asset inventory

- **`images/`: 59 files, 9.2 MB.** Mostly AVIF with responsive Webflow variants (`-p-500…-p-2600`), plus JPG/PNG/GIF/SVG. Two GIFs (`bouncing-blinking-orb*.gif`, a screen-recording GIF used in the preloader) are heavy and should be replaced with video or CSS/Lottie. Testimonial avatars, logos (`logos_figma`, `skill-icons_webflow`), UI icons (`SOUND.svg`, `Group-44.svg`), favicon + webclip.
- `documents/tech-stack-lottie2.json`: reusable as-is.
- **Not in the export, must be sourced from the Webflow CDN:** all per-project CMS images (hundreds across 6 projects, `cdn.prod.website-files.com/68fd6a2864b106242e25ca06/...`), and 9+ MP3 sound files (`…/*.mp3` on Webflow CDN and `cdn.jsdelivr.net/gh/bedantpixeto/audio/*`, a **third-party GitHub-hosted** sound pair to replace with owned files).
- Fonts: Google Fonts **IBM Plex Mono 300–700** (headings/buttons) and **Lato 100–900** (loaded but body uses `system-ui`). Lato appears only once in CSS, so probably unnecessary. Verify before dropping.
- OG image: `…/69662aac3531692f1f0045bc_thumbnail.avif`.

## 7. SEO inventory

- Home: `<title>` "Billodesign — Building Beyond Limits."; description "Webflow Certified Partner crafting custom, speed-optimized, AI-ready websites. From UI/UX design to clean code—build digital experiences that evolve."; OG title/description/image/type; Twitter `summary_large_image`.
- Project pages: unique title + meta description + OG image per item (from CMS).
- JSON-LD on home: `WebPage` with `ProfessionalService`, founder `Person` (email hello@billodesign.com, sameAs Behance, LinkedIn), `OfferCatalog` of services. **Its `url` is the relative `"/"`, which is invalid; fix during migration.**
- **No canonical tags, sitemap.xml (404 on webflow.io) or robots.txt confirmed.** The production domain redirects to webflow.io, so there's no existing indexed URL set on billodesign.com to preserve. Need to check Google Search Console for what is indexed (probably `billodesign.webflow.io` URLs).
- Heading hierarchy: the project template uses `h2` for the meta labels ("Role", ":"), which is semantically wrong. Fix during migration. Homepage has h1→h2→h3 usage designed around visual style.
- Image alt text: mostly descriptive, some empty (`[IMG:]`) for decorative icons.

## 8. Custom-code inventory

1. Google Fonts via WebFont loader (IBM Plex Mono, Lato)
2. JSON-LD structured data
3. **Google Analytics 4 `G-MVZCKN2L6C`** (gtag)
4. Scroll position save/restore (sessionStorage)
5. Lenis init
6. GSAP + SplitText + ScrollTrigger from Webflow's CDN **and** GSAP 3.12.2 + ScrollTrigger from cdnjs (duplicate, loaded twice) + SplitType
7. Text animation attribute system (`[text-split]`, `[words-slide-up]`, etc.)
8. Typed.js instances ×4 (`#typer-hero`, `#typer-footer-button`, `#typer-footer`, `#typer-modal`)
9. Howler sound system + jQuery (jQuery loaded twice: 3.5.1 Webflow and 3.6.0 from code.jquery.com)
10. Commented-out legacy modal/no-scroll code (dead code)
11. **AI chat widget**: custom HTML/CSS/JS, `POST https://billodesign.webflow.io/assistant/api/chat` with `{message, conversationHistory}` → `{response}`, quick-question buttons, typing sound. The backend (`/assistant/api/chat`) is presumably a Webflow Cloud app and is **not in the export**.
12. Custom CSS: `@property` rules for the orb/gradient, `.no-scroll`, `ai-chat-*` styles
13. Awwwards badge link (`awwwards.com/sites/billodesign-living-portfolio`)
14. Contact form (`email-form`, Webflow forms, method GET): submission handled by Webflow Forms.

## 9. Dependencies / integrations

Webflow Forms (contact, delivery address unknown), Webflow Cloud AI assistant API (LLM provider unknown), Spline, Google Analytics 4, Google Fonts, Lenis, GSAP (+ SplitText, ScrollTrigger), SplitType, Typed.js, Howler, jQuery, lottie (Webflow runtime), Awwwards, external profile links (LinkedIn, Behance, Upwork, Contra, Webflow profile, X). Cloudflare in front of billodesign.com.

## 10. Migration risks

1. **CMS content is not in the export**: must be scraped/re-authored from the live site, including all images (licensing/original quality). Ask the owner for a Webflow CMS CSV export if possible.
2. **AI chat backend** lives outside the export: needs a new endpoint (Next.js Route Handler + LLM API key) or a decision to keep pointing at the Webflow Cloud app. Needs owner input (provider, system prompt, rate-limiting, cost).
3. **Contact form**: Webflow Forms will stop working; needs an email backend (Resend/Formspree/etc.) plus spam protection.
4. **Webflow IX2 interactions** are encoded as JSON in `webflow.js`/data attributes (27 `data-w-id`); must be reverse-engineered visually against the live site.
5. **Spline scene** needs `@splinetool/react-spline`, which is heavy (~MBs). Needs lazy loading, mobile fallback, reduced-motion handling.
6. **Audio autoplay** is blocked by browsers; current behavior relies on the first user click. Accessibility + UX concerns (sound on by default).
7. **Duplicate libraries** (GSAP ×2, jQuery ×2) suggest interactions may depend on a specific GSAP version. Verify after consolidating.
8. **SEO**: `billodesign.com` currently 301s to `webflow.io`; the cutover must remove that redirect and keep the `webflow.io` site from being indexed as duplicate content (noindex or password-protect after cutover).
9. **Performance**: 9 MB images, GIFs, Spline, Lottie, Howler, and several audio files. Need a lazy strategy to keep Lighthouse high (the site itself claims a 97 Lighthouse score).
10. Trademark/branding: "Webflow Certified Partner" copy. Product decision to revisit later, not now.

## 11. Recommended Next.js architecture

- **Next.js App Router, TypeScript, static generation.** Routes: `/`, `/projects/[slug]` (`generateStaticParams`), `not-found.tsx`, `sitemap.ts`, `robots.ts`, `api/chat` and `api/contact` Route Handlers.
- **Content: local typed data (`content/projects/*.mdx` with frontmatter) + `content/site.ts`**. No CMS (6 static items, single editor). See ADR-001 to be recorded.
- **Styling: plain CSS with CSS variables/CSS Modules, tokens lifted from the Webflow variables.** Tailwind isn't needed to reproduce a token-driven, hand-tuned design and would add translation risk. See ADR-002.
- **Server components by default.** Client components only for: OrbScene, TypedText, SoundToggle/audio, SplitTextReveal (GSAP), Lenis provider, ContactModal, AiChat, sliders, Lottie.
- **Animation: GSAP + ScrollTrigger (already the site's engine) and Lenis**; drop jQuery, SplitType (use GSAP SplitText, which is now free), and duplicate GSAP. Typed.js kept or replaced by a tiny custom hook (decide during Phase 2).
- **Assets:** `next/image` with AVIF, Lottie via `lottie-react` (or `@lottiefiles/dotlottie`), audio self-hosted in `public/audio`.
- **Analytics:** GA4 via `@next/third-parties`. **Forms:** Route Handler + email provider. **Deploy:** Vercel, domain `billodesign.com`.

## 12. Must remain visually identical

Black background with cyan `#00adcc` accent; IBM Plex Mono uppercase headings (h1 3.5rem/700, h2 1.6rem with 0.7rem letter-spacing, h3 2.4rem, h4 1.8rem), the white→grey radial gradient text fill, `padding-global` 2.5rem / container 80rem, glowing `button` (`box-shadow 0 0 5px #46dbff80`), blurred fixed navbar, hero (min-height 100svh, Spline orb + typed speech), section order and copy, the project slider layout, modal look (blur, 1px #272727 border), preloader, all text-reveal animation styles, sound toggle, project page section order, existing project slugs. Breakpoints: 991 / 767 / 479 (Webflow defaults).

## 13. Can be safely improved later (Phase 6 or safe now)

Not visual: duplicate library removal, dead code removal, Lighthouse/CLS fixes, valid JSON-LD, canonical URLs, fixed heading semantics on project pages, self-hosted audio, GIF→video/Lottie, sitemap/robots, proper alt text, reduced-motion support, keyboard/ARIA on modal and chat, sound default OFF (a design decision to confirm), lazy-load Spline/Howler/audio. Visual/UX enhancements wait for Phase 6.

## Follow-up (2026-09-29)

The open questions below were answered/investigated. See [migration.md](migration.md) for Confirmed / Assumption / Decision / Needs-investigation findings. Key corrections to this report: **10 projects exist, not 6** (4 aren't on the homepage but are live), and CMS content now comes from the official CSV exports.

## Original open questions for the owner

1. Can you export the **Projects CMS collection as CSV** from Webflow (CMS → Export)? Scraping is the fallback.
2. **AI chat**: which LLM/provider and system prompt does `/assistant/api/chat` use? Keep, rebuild, or drop?
3. **Contact form**: where should submissions go (email address) and which provider is preferred?
4. Is the `detail_testimonial` collection used anywhere public? Is `401` (password page) needed?
5. Should sound remain **on by default**, or is that something to change later?
6. Any URLs currently indexed on `billodesign.webflow.io` or `billodesign.com` in Search Console we must preserve/redirect?
7. Is the X (Twitter) link real? The footer labels ("Behance link" ×3, "X link") suggest placeholder alt text; some social icons may point to the wrong destination.
