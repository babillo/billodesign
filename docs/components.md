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
| `ProjectSection` | project page | one case-study card with rich-text HTML; `visual` disables the screen blend |
| `VisitSiteLink` | cards, header | external link with arrow |
| `CaseStudyNav` (client) | project page | Phase 6 #7. 2px cyan reading-progress line at the top of the viewport (transform written directly, no re-render per frame) and a "Sections" pill at the bottom centre (shown after 60% of a screen of scrolling) that lists the card titles (h2) and rich-text chapters (h3), highlights the current one and jumps there via `scrollToElement` (`lib/scroll.ts`). Headings get ids on mount; `scroll-margin-top: 96px` (globals.css) keeps them clear of the navbar. |
| `ProjectTile` | homepage "Selected Work" grid | Phase 6 round 2. Screenshot (16:10, `object-fit: cover`, top-aligned), title, one-line `card.tag`, tool icons, "Visit site ↗". The title link is stretched over the card (`::after`), so the whole card opens the case study while "Visit site" (z-index 2) stays separate. Hover/focus: cyan border glow, image zoom 1.04, rectangular "View case study →" button; on touch screens the button is always shown. Square corners. |
| `ImageLightbox` (client) | project page | Phase 6 #5. Turns every `main .rich-text figure img` into a keyboard-focusable "Enlarge image" button and opens it in a native `<dialog>`: caption + counter, ←/→ keys, swipe, Escape/backdrop to close, focus back to the image. `data-lenis-prevent` stops the page scrolling behind. No props. |

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
| `SplineOrb` (+ `OrbErrorBoundary`) | lazy 3D orb layer |
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
