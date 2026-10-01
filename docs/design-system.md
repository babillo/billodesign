# Design System

All values below are **original Webflow values**, reproduced as-is. No Phase 6 changes have been made yet. When they are, record them in a separate "Phase 6 values" section.

Tokens live in `app/globals.css` (`:root`).

## Colors

| Token | Value | Use |
|---|---|---|
| `--color-black` | `#000` | page background |
| `--color-white` | `#fff` | body text |
| `--color-cyan` | `#00adcc` | eyebrow headings, links, nav hover, arrows, bubbles |
| `--color-cyan-deep` | `#03869e` | card borders, h1 gradient end |
| `--color-cyan-bright` | `#00a9c9` | animated gradient border |
| `--color-grey-radial` | `#9f9b9b` | h3–h5 gradient end, dividers, copyright |
| `--color-surface` | `#010101` | button/card fill inside gradient border |
| `--color-surface-hover` | `#00262d` | button hover |
| `--color-field` | `#181818` | form fields, mobile menu |

## Typography

- **IBM Plex Mono** 300–700: all headings, buttons, orb text. Loaded via `next/font`.
- **System UI stack**: body text and paragraphs (weight 300).
- **Lato 900**: only the giant background words ("SERVICES", "PORTFOLIO").

| Tag | Desktop | ≤991 | ≤767 | ≤479 | Notes |
|---|---|---|---|---|---|
| h1 | 3.5rem/700/1.1 | 3.2rem | 2.5rem | 2rem | uppercase, radial gradient white → #03869e |
| h2 | 1.6rem/700/1.4 | 1.2rem | 1rem | 0.9rem | cyan, uppercase, letter-spacing .7 → .4 → .3rem |
| h3 | 2.4rem/700/1.2 | 2.2rem | 1.5rem | — | gradient white → #9f9b9b |
| h4 | 1.8rem/500/1.4 | — | 1.25rem | — | same gradient |
| h5 | 1.25rem/500/1.5 | — | 1rem | — | same gradient |
| p | 1.375rem/300 | 1.2rem | — | 1.2rem | |

`.as-h3` applies the h3 look to another heading level (semantic outline fixes).

## Layout

- `--padding-global`: 2.5rem (1.25rem ≤767)
- `.container-large`: max-width 80rem (1280px)
- `.padding-section-large`: 8rem / 6rem (≤991) / 4rem (≤767) top and bottom
- **Breakpoints** (Webflow): 991px, 767px, 479px (max-width)

## Components / patterns

- **Button** (`components/ui/Button`): 0.75rem 1.5rem padding, 0.25rem radius, glow `0 0 5px #46dbff80`, pulsing dot, rotating gradient border.
- **Rotating gradient border** (`.gradient-border`): `@property --angle` animated 0 → 360° over 8s. Used on buttons, service cards, the contact modal and the submit button.
- **Cards:** 1px `#03869e` border, `backdrop-filter: blur(5–10px)`, often `mix-blend-mode: screen`, with two blurred ellipse glows (`Ellipses`).
- **Orb speech bubble:** 1px cyan border, radius `30px 0 30px 30px`, blur 20px.
- **Slider dots:** bars 5rem × 0.75rem (2rem × 0.3rem ≤767), active `#00afcd`, inactive `#383838`.

## Owner adjustments after launch (not Webflow values)

- **Sound toggle position:** Webflow placed the 32px icon 13px from the left, with its top 48px above the viewport bottom. It now shares a row with the AI chat launcher: inset 24px (20px at ≤768px), in a 60px-tall (56px) hit area with the icon vertically centred (`SoundToggle.module.css`). The icon stays 32px.

## Phase 6 values

New values introduced in Phase 6, approved by the owner (see `phase-6-proposals.md`). Everything not listed here is still the original Webflow value.

| Item | Original Webflow | Phase 6 | Where |
|---|---|---|---|
| Awwwards badge on ≤767px (#1) | 53×171px | 34×110px, same position | `AwwwardsBadge.module.css` |
| Navbar after scrolling > 8px (#4) | transparent, `blur(5px)` | `rgb(0 0 0 / 0.7)`, `blur(12px)`, bottom border `rgb(255 255 255 / 0.06)`, 0.4s fade; unchanged at the top of the page | `Navbar.module.css` |
| Slider dot hit area (#6) | same as the bar (80×12px, 32×4.8px on ≤767px) | 32px tall (bar unchanged, drawn by `::before`); width unchanged, so no overlap | `Slider.module.css` |
| Social-share description (#10) | the 149-character meta description | `site.shareDescription` (101 characters) for Open Graph and X; the meta description is unchanged | `lib/site.ts` |
| Services heading | "What I&nbsp;&nbsp;Build" (two spaces) | "What I Build" | `Services.tsx` |
| Project grid (round 2) | slider, about 2.5 cards visible | 2 columns, gap 3rem × 2rem (1 column ≤767px, gap 2.5rem); 16:10 image, 1px `--color-cyan-deep` border, **square corners**; hover: `--color-cyan` border + `0 0 40px rgb(0 173 204/.25)` glow, image scale 1.04 (0.8s); "View case study →" button: square, 1px `--color-cyan`, `rgb(0 0 0/.75)`, mono 0.85rem (0.75rem ≤767px); title mono 1.35rem (1.15rem ≤767px); tag grey 0.95rem; tool icons 26px | `ProjectTile.module.css` |
| Services hover glow (round 2) | none | `radial-gradient(240px circle at pointer, rgb(0 173 204/.32), transparent 70%)` + `0 0 28px rgb(0 173 204/.22)`; fades in 0.4s; hover-capable devices only | `Services.module.css` |
| Image lightbox (#5) | none | backdrop `#000000f2`; round 3rem cyan-outline buttons (contact-modal style); caption in mono 0.875rem grey, counter cyan | `ImageLightbox.module.css` |
| Reading progress (#7) | none | 2px `--color-cyan` line with a 6px cyan glow, fixed at the top (z 11) | `CaseStudyNav.module.css` |
| Sections menu (#7) | none | 44px pill, `rgb(0 0 0 / 0.7)` + blur(8px), `--color-cyan-deep` border, `--button-glow`; panel max 22rem / 60svh, radius 12px; sub-items indented, grey 0.8rem; current item cyan | `CaseStudyNav.module.css` |
| Footer (#8) | divider + copyright only | **Reverted by the owner (2026-10-02)**: original footer kept | `Footer.module.css` |
