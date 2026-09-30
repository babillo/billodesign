# Routes

## `/`: Homepage

- **Component:** `app/page.tsx`
- **Content:** `components/home/*`, `lib/site.ts`, `content/projects.json` (cards), `content/testimonials.json`
- **Sections (in order):** Preloader → Spline orb + hero speech bubble → Hero → We got your back → Services → Tech Stack (Lottie) → Selected Work slider (`#portfolio`) → Testimonials slider → Bio (`#about-me`) → CTA → Footer
- **SEO:** default title "Billodesign — Building Beyond Limits.", site description, canonical `/`, OG/Twitter image `/images/og-image.jpg`, JSON-LD `WebPage` + `ProfessionalService`
- **Interactions:** preloader, typed orb speech, text reveals, Lottie scroll scrub, sliders, contact modal, sound
- **Migration notes:** same URL as Webflow. `#portfolio` and `#about-me` anchors preserved.

## `/projects/[slug]`: Case study

- **Component:** `app/projects/[slug]/page.tsx` (+ `components/projects/*`)
- **Slugs (unchanged from Webflow):**
  - `personal-brand-it-portfolio`
  - `orbitai`
  - `elegantnast`
  - `timms-team-landing-page`
  - `macrostate-landing-page`
  - `flexibank---online-banking-mobile-app`
- **Content:** `content/projects.json`
- **SEO:** title "<Project title> | Billodesign", description = project summary, canonical, OG image = project thumbnail
- **Interactions:** Spline orb (shifted right), section reveals, Wistia video, CTA bubbles, contact modal
- **Migration notes:** `dynamicParams = false`, so unknown slugs return 404.

## Redirects (`next.config.ts`)

| From | To | Why |
|---|---|---|
| `/projects/beelo-pure-honey` | `/` (308) | project not migrated (owner decision) |
| `/projects/gwp` | `/` (308) | same |
| `/projects/handwerkerseiten` | `/` (308) | same |
| `/projects/majer-sales---conversion-focused-webflow-website` | `/` (308) | same |

## Other

| URL | Source | Notes |
|---|---|---|
| 404 | `app/not-found.tsx` | "Page Not Found / Go Home" |
| `/sitemap.xml` | `app/sitemap.ts` | home + 6 projects |
| `/robots.txt` | `app/robots.ts` | disallows everything on Vercel preview deployments |
| `POST /api/chat` | `app/api/chat/route.ts` | `{message, conversationHistory}` → `{response}` |
| `POST /api/contact` | `app/api/contact/route.ts` | returns 503 until an email option is chosen |

**Not recreated** (see migration.md §4): Webflow `401` password page, `detail_testimonial` template, `style-guide`.
