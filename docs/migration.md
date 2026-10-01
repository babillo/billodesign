# Webflow → Next.js Migration

Status: Phase 1 complete (audit + follow-up investigation). Phase 2 not started.
Audit report: [phase-1-audit.md](phase-1-audit.md)

Labels used below:
- **Confirmed**: verified from the export, CSVs, or live requests
- **Assumption**: believed but not verified
- **Decision**: explicitly chosen by the owner
- **Needs investigation**: still open, with what's needed to close it

Investigation date: 2026-09-29.

---

## 1. CMS content (Projects, Testimonials)

**Confirmed**
- Official Webflow CSV exports are in `webflow/export/billodesign - Projects.csv` and `billodesign - Testimonials.csv`.
- **Projects: 10 published items** (none draft/archived). The homepage slider only shows 6; the other 4 are live at `/projects/<slug>` (all 10 return 200):

  | Slug | On homepage |
  |---|---|
  | `personal-brand-it-portfolio` | yes |
  | `orbitai` | yes |
  | `elegantnast` | yes |
  | `timms-team-landing-page` | yes |
  | `macrostate-landing-page` | yes |
  | `flexibank---online-banking-mobile-app` | yes |
  | `beelo-pure-honey` | no |
  | `gwp` | no |
  | `handwerkerseiten` | no |
  | `majer-sales---conversion-focused-webflow-website` | no |

- Project fields: Title, Slug, Published On, Role, Timeline, Tools, Scope, Client, Industry, Market, Summary (markdown-ish, `**bold**`), rich-text HTML fields (Project Overview, The Challenge, The Strategy, The Solution, The Result, Visual Showcase, Problem Statement, Goal Statement, Research & Insights, Design Process, User Flow, Low Fidelity Wireframes, Design System, High Fidelity Wireframe, Final Designs & Prototype, Case Study), Thumbnail (image URL), video thumbnail (Wistia URL), website link, Testimonial (reference → testimonial slug), Next project (reference → project slug).
- Fields are sparse: each project fills a different subset. The template hides empty sections; the new template must do the same.
- `Next project` references form a cycle through all 10 projects (not strictly; `beelo-pure-honey` and `timms-team-landing-page` both point to `elegantnast`, so it is not a perfect ring). Reproduce exactly from data.
- Rich text contains Webflow-specific markup (`w-richtext-figure-type-image`, `-type-video` embeds, `id=""` attributes) that must be converted/sanitized.
- **55 unique Webflow CDN asset URLs** in the CSV (38 jpg, 14 png, 1 avif, 1 gif, plus embeds). Images in rich text are *not* in `webflow/export/images/`.
- Two projects use Wistia videos (`msalmanbabillo.wistia.com`), an external service, not Webflow.
- Testimonials: 4 items (David Mueller, Fadi Al Ibrahim, Robert Jensen, Tim Kozak) with company, feedback, avatar URL.
- CSV data quality issues to keep as-is for now but flag: "Webfow"/"Weblow" typos in Tools, "Hgh-performance" in Summary, "Fadi Al Ibahim" in Client, "Adobe Photoshp", stray quote in Robert Jensen's feedback, one `The Result` starts with a stray `<li>`.

**Decision**
- Use the official CSV export, not scraping. Preserve every field.
- Download all assets into the repo; the new site must not depend on the Webflow CDN.

**Needs investigation (Phase 2)**
**Decision (2026-09-29)**
- Migrate **only the 6 homepage projects**. The other 4 (`beelo-pure-honey`, `gwp`, `handwerkerseiten`, `majer-sales---conversion-focused-webflow-website`) will be removed by the owner. Note: they are currently *published and live* (200), so they may be indexed. Plan: 301 them to `/` in the new site so any existing links land somewhere useful.
- Fix typos in content during conversion (e.g. Webfow/Weblow → Webflow, Photoshp → Photoshop, Hgh → High, Ibahim → Ibrahim, stray quotes/list tags). Original CSVs stay untouched as the source record.
- `Next project` references that point to a removed project are re-pointed so the 6 form a loop (documented in content.md).
- Wistia: keep embeds or self-host video (decide per performance budget).

## 2. AI chat

**Confirmed**
- The homepage widget is custom code in the page (`ai-chat-*`), `POST https://billodesign.webflow.io/assistant/api/chat`, body `{ message, conversationHistory }` → `{ response }`. Empty message → `400 {"error":"Message is required"}`.
- `/assistant` is a separate **Webflow Cloud app built with Astro** (page title "Portfolio Assistant", served via `wf-app-prod.cosmic.webflow.services`). Its landing page is unedited template content ("Project 1/2/3").
- **Conversation history is client-side only**: the browser keeps it and sends the last 5 messages; the server is stateless.
- **No API keys or credentials in the exported/public code.** The key lives in the Webflow Cloud app.
- **The system prompt is not in the export.** From responses, it contains: persona "friendly AI assistant representing Muhammad… web designer and certified Webflow developer", email hello@billodesign.com, "pricing varies, ask for quote", generic project *types* (Branding, SaaS, E-commerce, Portfolio, Landing Pages, Complex Webflow). **It does not know the actual project names**, so it has no CMS/project context.
- It refuses to reveal its system prompt.
- **No rate limiting observed**: 8 back-to-back requests all returned 200. No abuse protection visible.
- **No CORS headers** (preflight → 404). Browsers on `billodesign.com` can't call it directly after migration; it only works same-origin today.

**Confirmed (2026-09-29, from the app source in Webflow Cloud, via owner screenshots)**
- App code is **not under version control** and can't be downloaded; files can only be copied by hand from the Webflow Cloud editor.
- Structure: Astro app with `src/pages/api/chat.ts` (the endpoint), `src/middleware.ts`, `src/pages/index.astro` (the unused template landing page), `.env` (holds the key; never copy it), docs `CHATBOT_README.md`, `CUSTOMIZE_CHATBOT…`, `OPENAI_SETUP_GUI…`, `WEBFLOW_CHATBOT…`, `test-openai.js`.
- Provider **OpenAI** via the official SDK: `openai.chat.completions.create({ model: 'gpt-4o-mini', messages, max_tokens: 500, temperature: 0.9 })` (chat.ts, around line 113).

**Confirmed (2026-09-30, from the files the owner added in `webflow/export/chatbot files/chatbot/`)**
- Full system prompt recovered (`src/pages/api/chat.ts`), reused verbatim in `lib/chat/system-prompt.ts` (ADR-012).
- Keyword fallback replies when there's no key or OpenAI errors, ported to `lib/chat/fallback.ts`.
- **Bug in the original:** the endpoint read `body.history`, but the widget sent `conversationHistory`, so conversation history was never used. Fixed in the new route.
- `AIChatbot.tsx` / `ChatbotTrigger.tsx` are the Astro template's Tailwind widget, **not** the widget on the live site (which is custom code in the Webflow page). They were not used, which avoided adding `openai`, `lucide-react` and Tailwind.

**Decision (2026-09-30)**
- Improve the bot with knowledge of the real projects and testimonials, generated from site content.

**Decision**
- Keep the AI chat. New flow: browser UI → Next.js Route Handler (`/api/chat`) → LLM provider. API key server-side only. Don't upgrade the model just to upgrade.

**Needs investigation**
- Owner to open the Astro app's source in Webflow Cloud (or its env vars) to confirm provider, model and system prompt. If it's unrecoverable, we write a new system prompt (and can now give it real project data from the CSV, a clear improvement to agree on first).
- Rate limiting for the new endpoint (e.g. Vercel Firewall rule or a small Upstash Redis limiter).

## 3. Contact form

**Confirmed**
- Webflow Forms form `email-form` (fields: name/email/message style, Webflow handles delivery). It stops working once off Webflow.

**Decision**
- Submissions go to the Zoho business inbox. No address or credentials client-side. Propose options before implementing (below).

**Decision (2026-09-30): Option A, Resend + Turnstile** (ADR-011). Implemented in `app/api/contact/route.ts` and `components/experience/Turnstile.tsx`. Setup steps are in deployment.md.

**Options that were considered**

| Option | How | Cost | Pros | Cons |
|---|---|---|---|---|
| **A. Route Handler + Resend + Turnstile (recommended)** | `/api/contact` validates, checks Cloudflare Turnstile + honeypot, sends via Resend to the Zoho address (from env var) | Free tiers (Resend 3k emails/mo, Turnstile free) | Reliable delivery, proper SPF/DKIM, doesn't touch Zoho MX, minimal code | One new vendor; DNS records for a sending subdomain |
| B. Route Handler + Zoho SMTP (nodemailer) | Send through your own Zoho mailbox | $0 extra | No new vendor | Needs a Zoho plan with SMTP access (free Zoho Mail plans restrict this, verify your plan); app-password management; SMTP from serverless is slower |
| C. Hosted form service (Formspree/Web3Forms) | Form posts to a third party | Free tier limits | Least code | Third party holds submissions; weaker control over spam/branding |

## 4. `detail_testimonial` and `401`

**Confirmed**
- `detail_testimonial.html` is the auto-generated template page for the Testimonials collection. Live `/testimonials/<slug>` and `/testimonial/<slug>` return **404**, meaning the template pages are disabled/unpublished. No link, script or nav in the export references them.
- `/401` is Webflow's built-in password-protection page (returns 200 at `/401` as a system page). No pages are linked to it and no pages were found to be password-protected.
- `/style-guide` and `/detail_projects` return 404 live, so they're internal.

**Decision**
- Do not recreate `detail_testimonial`, `401` or `style-guide` as routes. Testimonials stay data-only (homepage + referenced from projects).

## 5. Sound

**Confirmed**
- Howler 2.2.3; sound state in `localStorage.soundOn`, **defaults to ON**; background loop tries to play on load (blocked by browsers until a gesture); sound effects on hover/click/modal/orb; typing loop when a typing box is on screen; pause on hidden tab. ~11 MP3s loaded eagerly on `document.ready`, 2 of them from a third party's GitHub (`cdn.jsdelivr.net/gh/bedantpixeto/audio`).

**Decision**
- Keep sound + mute toggle. **Start muted**, no audio until the user explicitly enables it; respect autoplay rules; lazy-load audio only after sound is enabled; respect reduced motion for the associated effects.

**Confirmed (owner, 2026-09-30):** the two jsDelivr sounds (click beep, hover) are free to use.

**Decision (owner, 2026-10-01):** a visitor who turned sound on gets it again on the next visit, as on Webflow: it plays immediately where the browser allows autoplay, otherwise after the first interaction. First visits still start muted (ADR-014).

## 6. Indexed URLs / Search Console

**Confirmed**
- `billodesign.com`, `www.billodesign.com` and deep paths (e.g. `/projects/orbitai`) **301 → the same path on `billodesign.webflow.io`** via Cloudflare. So the custom domain has no indexed content of its own.
- `billodesign.webflow.io` is indexed (home and at least `/projects/elegantnast` appear in search results).
- `robots.txt` on webflow.io is empty (allow all); `sitemap.xml` is 404.
- External backlinks exist and point to `billodesign.webflow.io`: Awwwards nominee page (`awwwards.com/sites/billodesign-living-portfolio`, plus an Awwwards inspiration entry), Webflow Made-in-Webflow showcase, Contra work entries, Webflow profile.

**Decision (proposed, per CLAUDE.md "preserve URLs")**
- Keep the exact URL structure on the new site: `/` and `/projects/<slug>` for all 10 slugs (including the `---` slugs). Then the existing Cloudflare redirects flip meaning: old `webflow.io` links need a redirect to `billodesign.com`.

**Needs investigation**
- **Owner:** Search Console data (indexed pages, queries, clicks), which only you can access.
- Whether Webflow can 301 `billodesign.webflow.io/*` → `billodesign.com/*` after cutover (Webflow site-level redirects or a "set custom domain as default" setting), otherwise noindex/unpublish the webflow.io site. Decide in Phase 5.
- Ask Awwwards / Made-in-Webflow / Contra to update their links to `billodesign.com`.

## 7. Social links and labels

**Confirmed**: homepage CTA icons (all SVG icons, no `alt`; accessible text comes from visually hidden `.hide` divs):

| Destination | Hidden label today | Correct? | Link status |
|---|---|---|---|
| linkedin.com/in/muhammad-salman-370223182 | "Linkedin link" | ✅ | LinkedIn blocks bots (999), can't verify automatically |
| upwork.com/freelancers/~01dd19fd0c2e16e78b | "Behance link" | ❌ should be Upwork | Upwork blocks bots (403), can't verify automatically |
| contra.com/billodesign (with a referral query) | "X link" | ❌ should be Contra | 200 |
| webflow.com/@billodesign-work | "Behance link" | ❌ should be Webflow | 200 |
| behance.net/muhammadsalman201 | "Behance link" | ✅ | 200 |

- **There is no X/Twitter link anywhere.** "X link" is just a mislabel.
- Awwwards badge link → `awwwards.com/sites/billodesign-living-portfolio` (valid per search results; blocked our direct check).
- Search results also show a Webflow profile at `webflow.com/@billodesign` (the site links `@billodesign-work`). Both respond 200.

**Decision**
- Use accurate accessible names ("LinkedIn", "Upwork", "Contra", "Webflow profile", "Behance"). Don't invent profiles.

**Needs investigation (owner)**
- Please confirm the LinkedIn and Upwork URLs open your profiles, and which Webflow profile is current: `@billodesign` or `@billodesign-work`.
- Should the Contra link keep its referral query string?

---

## Webflow → Next.js mapping (Phase 2)

| Webflow | Next.js |
|---|---|
| Homepage sections (static HTML) | `components/home/*` server components |
| Projects CMS + template page | `content/projects.json` + `app/projects/[slug]/page.tsx` |
| Hardcoded slider cards & testimonials | `card` fields in projects.json, testimonials.json |
| Webflow slider | `components/ui/Slider` |
| IX2: subtle slide from bottom | `data-reveal` + CSS + IntersectionObserver |
| IX2: preloader | CSS keyframes (`Preloader`) |
| IX2: modal open/close | `<dialog>` + `ContactModalProvider` |
| IX2: nav burger | `Navbar` CSS transitions |
| IX2: tech stack scroll Lottie | `TechStackLottie` + ScrollTrigger |
| IX2: orb bubbles show/hide | `OrbSpeech`, `CtaOrbTips` |
| Attribute text-animation script (SplitType + GSAP) | `ScrollEffects` (GSAP SplitText) |
| Typed.js ×4 | `TypedText` |
| Howler + jQuery sound script | `SoundProvider` |
| Lenis init | `SmoothScroll` |
| Custom-code AI chat widget | `AiChat` + `/api/chat` |
| Webflow Forms | `ContactModal` + `/api/contact` (pending) |
| Spline element | `SplineOrb` (@splinetool/react-spline) |
| gtag snippet | `next/script` in layout (production only) |

### Reproduced exactly
Layout, spacing, type scale, colors, breakpoints, section order, copy, slider behavior, preloader timeline, reveal timing, text effects, Lottie scroll mapping, bubble timings, sound mapping, chat UI and model settings, all 6 URLs.

### Implemented differently (same experience)
- Preloader in CSS: it appears immediately instead of after Webflow's JS runs.
- Spline orb loads after the browser is idle and fades in; an error boundary prevents a failed load from crashing the page.
- Contact and chat use native `<dialog>`, which adds focus trapping, Escape to close and an inert background.
- Wistia videos embedded directly (no Embedly).

### Intentionally changed (owner-approved or bug fixes)
- Sound starts **muted** on a first visit; a remembered "on" resumes on revisit (owner decisions §5, ADR-014).
- Only 6 projects; 4 removed URLs redirect to `/` (§1).
- Content typos fixed; "What People Says" → "What People Say"; "What are your waiting for" → "What are you waiting for?".
- Accessibility labels: social links, the wrong card alt text, JS logo alt text, form labels, a real `mailto:` link for the email.
- Heading outline on project pages (same look).
- The Fadi testimonial now has quote marks like the others.

### Dropped (no longer needed)
jQuery ×2, duplicate GSAP 3.12, SplitType, Typed.js, WebFont loader, Webflow IX2 runtime, the scroll-position save/restore script (browsers restore scroll natively), `console.log` on every scroll, and commented-out dead code.

---

## Phase 4 visual QA, first pass (2026-09-30)

With browser access to the live site, section heights were compared at 1440 / 1024 / 768 / 390 after the full scroll-through.

**Found and fixed**
- **Missed feature: homepage intro.** The live page hides its content after the preloader while the orb speaks, then reveals it. My Phase 1 reading of the IX2 data wrongly treated this as a no-op. Now reproduced (`HomeIntro`).
- Project card thumbnails stretched (missing `align-items: flex-start`).
- "Visit Site" links are underlined on the original.
- Navbar highlights the link of the section in view (Webflow `w--current` scroll-spy).
- Testimonial slider broken on mobile (CSS order bug, see troubleshooting).
- Rich-text spacer paragraphs were stripped by the importer.

**Result (homepage):** every section within ±7px of the original at all four widths, except "Selected Work", which is taller only because my version reserves space for card images the live site hasn't lazy-loaded yet (no layout shift).

**Known remaining differences (intentional or architectural)**
- The Spline orb doesn't render in the headless QA browser (no GPU) on either site, so it's not visually compared. It needs a check on a real device.
- The live site's "Next Project" card title is an `h4`; mine is an `h3` (heading outline).

### Final QA results (2026-09-30, pass 3)

Position of every section heading and total page height compared at 1440 and 390, after scrolling the full page.

| Page | Result |
|---|---|
| Home | all sections within ±7px at 1440/1024/768/390 (Selected Work taller only because the live site hadn't lazy-loaded some card images) |
| Timms-Team | identical (≤1px) |
| Macrostate, Elegantnast | within ±35px (only the Next Project card differs) |
| OrbitAI | identical until Next Project |
| FlexiBank | identical until Next Project |
| Personal Brand | −24px: the CMS's stray `<li><br>` outside a list is removed on purpose (invalid HTML) |

**Intentional:** "Next Project" cards differ where the live site links to a removed project (FlexiBank → Beelo, OrbitAI → Handwerkerseiten, Macrostate → MAJER Sales).

**Fixed in pass 3:** `<strong>` weight (normalize.css sets `bold`; the browser default `bolder` gave 400 on 300-weight paragraphs, which changed line wrapping).

**Not verifiable in headless QA:** the Spline orb (no GPU); check it on a real device.
