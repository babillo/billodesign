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
- Whether the homepage's selection of 6 projects is a manual CMS filter/sort (likely a "featured"-type choice not exported as a field) → reproduce with an explicit `featured` flag + order in local data.
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

**Assumption**
- Model is GPT-4o mini (owner's recollection). **Not verifiable from outside**; the response metadata does not name the model.

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

**Proposal (awaiting choice)**

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

**Needs investigation**
- Licensing of the third-party jsDelivr sounds before self-hosting them.

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
