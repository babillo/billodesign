# Components

Client components are marked **(client)**. Everything else is a server component.

## Layout (`components/layout/`)

> `Footer` (Phase 6 #8): brand + role + availability (`site.availability` in `lib/site.ts`), nav links + Contact (opens the modal via `data-open-contact`), email, back to top, then the original divider line and copyright. Social icons are deliberately not repeated (the CTA above shows them).
| Component | Purpose | Notes |
|---|---|---|
| `Navbar` (client) | fixed blurred navbar, logo, Portfolio / About me / Contact | collapses to a burger ≤767px; "Contact" has `data-open-contact` |
| `Footer` | brand, availability, nav, email, back to top, divider, copyright | see the Phase 6 note above |
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
