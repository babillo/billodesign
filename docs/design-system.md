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

## Phase 6 values

_None yet._
