# Components

Client components are marked **(client)**. Everything else is a server component.

## Layout (`components/layout/`)

> `Footer`: the original Webflow footer (divider line + copyright) and the `#page-end` marker. A fuller Phase 6 footer (#8) was built and then reverted by the owner (2026-10-02): the empty space under the CTA is where the orb's speech bubble appears, and extra footer content made that area crowded.
| Component | Purpose | Notes |
|---|---|---|
| `Navbar` (client) | fixed blurred navbar, logo, Portfolio / About me / Contact | collapses to a burger ≤767px; "Contact" has `data-open-contact` |
| `Footer` | divider line, copyright, `#page-end` marker | the marker triggers the CTA bubble |
| `SocialLinks` | LinkedIn, Upwork, Contra, Webflow, Behance icons | data in `lib/site.ts`; accessible names fixed |
| `AwwwardsBadge` | fixed ribbon on the right edge | |

## UI primitives (`components/ui/`)
| Component | Props | Notes |
|---|---|---|
| `Button` | `href?`, `children`, any link/button props | renders `<Link>` or `<button>`; includes `PulseDot`; `.gradient-border` |
| `SectionHeading` | `eyebrow`, `title`, `intro?` | h2 eyebrow + h3 title (+ scrub paragraph) |
| `Slider` (client) | `label`, `slides[]`, `maskClassName?` | infinite loop, arrows, bar dots, swipe, arrow keys |
| `Ellipses` | `variant: service / project / modal` | decorative corner glows |
| `ShadowTitle` | `children` | giant faint Lato background word |
| `Container` | `spacing?: large/small`, `className?`, `id?` | Client-First wrapper: padding-global → container-large → padding-section-*; used by every section |
| `CloseIcon` | — | "×" icon for the modal and the chat |

## Projects (`components/projects/`)
| Component | Used by | Notes |
|---|---|---|
| `ProjectCard` | homepage slider, "Next Project" | `next/image` thumbnail with hover zoom, Visit Site, View Project, tool logos |
| `ProjectHeader` | project page | h1, Wistia video **or** thumbnail, Visit Site, meta `<dl>` (empty rows hidden) |
| `ProjectSection` | project page | one case-study card: a `# Title` section of the project's MDX file. Props: `slug`, `title`, `source` (MDX), `visual` (disables the screen blend) |
| `CaseStudyMdx` (server) | `ProjectSection` | Compiles and renders a card's MDX at build time (`@mdx-js/mdx` `evaluate`). Provides `Figure` (optimized image, or looping video for a `.gif` path; Webflow figure markup + lightbox `data-full`), `WistiaVideo` and `Spacer`. Build errors name the file and card. No client JS. |
| `ProjectResults` | `ProjectHeader` | Phase 7 V2. "Key results" strip from frontmatter `results` (`{ value, label }[]`); bordered thin strip like the bio stats, one row per result on phones; renders nothing without results. |
| `RichTextVideos` (client) | project page | Phase 7. Plays the rich-text videos made from GIFs (`video[data-autoplay-visible]`) while in view; poster + controls with reduced motion. No props. |
| `VisitSiteLink` | cards, header | external link with arrow |
| `CaseStudyNav` (client) | project page | Phase 6 #7. 2px cyan reading-progress line at the top of the viewport (transform written directly, no re-render per frame) and a square "Sections" button at the bottom centre (rectangular like the rest of the site since Phase 7, V1) (shown after 60% of a screen of scrolling) that lists the card titles (h2) and rich-text chapters (h3), highlights the current one and jumps there via `scrollToElement` (`lib/scroll.ts`). Headings get ids on mount; `scroll-margin-top: 96px` (globals.css) keeps them clear of the navbar. |
| `ProjectTile` | homepage "Selected Work" grid | Phase 6 round 2. Screenshot (16:10, `object-fit: cover`, top-aligned), title, one-line `card.tag`, tool icons, "Visit site ↗". The title link is stretched over the card (`::after`), so the whole card opens the case study while "Visit site" (z-index 2) stays separate. Hover/focus: cyan border glow, image zoom 1.04, rectangular "View case study →" button; on touch screens the button is always shown. Square corners. |
| `ImageLightbox` (client) | project page | Phase 6 #5. Turns every `main .rich-text figure img` into a keyboard-focusable "Enlarge image" button and opens it in a native `<dialog>`: caption + counter, ←/→ keys, swipe, Escape/backdrop to close, focus back to the image. `data-lenis-prevent` stops the page scrolling behind. Opens the image's `data-full` (1920 px optimized version) rather than the column-sized one. No props. |

## Home (`components/home/`)
`Hero`, `WeGotYou`, `Services`, `TechStack` (+ `TechStackLottie`, client), `Projects`, `Testimonials`, `Bio`, `Preloader` (CSS-only). Each maps 1:1 to a Webflow section. See routes.md.

## Shared sections
- `sections/Cta`: closing CTA (title/text props), button, socials, `CtaOrbTips` (client).
- `testimonials/TestimonialCard`: stars, quote(s), avatar, name and role.

## Experience layer (`components/experience/`, all client)
| Component | Purpose |
|---|---|
| `SoundProvider` / `useSound()` | Howler sounds, mute state, `data-sound-*` listeners |
| `SoundToggle` | speaker button |
| `ContactModalProvider` / `useContactModal()` | modal state, `data-open-contact` listener |
| `ContactModal` | `<dialog>` contact form → `/api/contact` |
| `AiChat` | floating chat button + `<dialog>` → `/api/chat` |
| `RealUserMetrics` (layout) | Vercel Speed Insights: real-visitor Core Web Vitals, `/lab/` excluded (Phase 7, S2) |
| `SplineOrb` (+ `OrbErrorBoundary`) | 3D orb layer: poster image at once, Spline after `load` + idle, paused while covered (`data-orb-cover`) or behind a modal (animations.md#spline-orb) |
| `OrbSpeech` | glass speech bubble with `TypedText`; typing sound while visible |
| `TypedText` | typewriter (replaces Typed.js) |
| `SmoothScroll` | Lenis |
| `useModalDialog(open)` | hook: syncs a native `<dialog>` with React state |
| `ScrollEffects` | `data-reveal` and `data-text` effects |

### Home additions (Phase 6 round 2)
- `components/home/Projects.tsx`: the slider was replaced by a 2-column grid of `ProjectTile` (1 column ≤767px). `Slider` is still used by Testimonials; `ProjectCard` is still used for "Next Project" on case-study pages.
- `components/home/CursorGlow.tsx` (client): pointer-following cyan glow inside `[data-glow]` elements (the service cards). It only writes `--glow-x/--glow-y`; the gradient is `.card::after` in `Services.module.css`. Disabled on touch screens (`hover: none`).

### Phase 6 round 3 (2026-10-02)
- `home/Hero`: "Work With Me" + "View my work ↓" (`#portfolio`, hidden ≤767px: one button on phones) in `.actions` (gap 2.5rem); decorative scroll cue (mouse icon + "Scroll") at the bottom of the hero.
- `layout/Navbar`: "Available for projects" status pill (`site.availability`), a button that opens the contact form; hidden ≤767px.
- `home/WeGotYou` + `home/PerformanceStats` (client): the dashboard image is a **fixed backdrop** inside the section (`clip-path: inset(0)` + `position: fixed`), and the heading and three glass stat cards (uptime, Lighthouse rings, response time; data `performanceStats` in `lib/site.ts`) scroll over it. Numbers count up once when scrolled in (1.6s ease-out); server/no-JS/reduced motion show final values; screen readers get the final values.
- `home/Testimonials`: slider at all widths (a desktop 2×2 grid was built, then dropped by the owner, who prefers the slider).
- `home/Bio`: stats strip `<dl>` from `bioStats` in `lib/site.ts`.
- `ui/SectionHeading`: eyebrow h2 has `data-text="decode"` (see animations.md).

## Lab (`components/lab/`, not used on live pages)
| Component | Purpose |
|---|---|
| `LabOrb` (client) | `/lab/orb` page body: renders the live `SplineOrb` or `ThreeOrb` in the same fixed orb layer (`SplineOrb.module.css`), plus a stats readout. |
| `ThreeOrb` (client) | Three.js rebuild of the Spline orb scene from extracted data (`public/lab/orb/`). Props: `shadows`, `freezeAt` (seconds, for screenshots), `onStats`. Loads `three` with a dynamic import. See docs/orb-rebuild.md for how each material maps to Spline's layers. |

## Generated images
| File | Purpose |
|---|---|
| `lib/og/case-study-card.tsx` | `caseStudyCard(project)`: the 1200×630 share card (next/og `ImageResponse`). Name in the uppercase gradient heading style (size steps down for long names), subtitle from the title after "—", `card.tag`, orb (`assets/og/orb.png`), logo, domain, 1px cyan frame. |
| `app/projects/[slug]/opengraph-image.tsx`, `twitter-image.tsx` | per-project share image routes, static at build. |
