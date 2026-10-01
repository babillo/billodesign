# Phase 6 — Design enhancement proposals

**Status:** proposals, awaiting owner selection (2026-10-01). Nothing below is built yet except the content typo fixes at the end.

**How this list was made:** I reviewed the live site (billodesign.com) page by page at 1440×900 and 390×844, scrolling through every section with the intro skipped. I also measured tap targets, heading structure, keyboard focus and reading sizes in a local production build. Every proposal keeps the existing identity: dark space theme, the orb, IBM Plex Mono headings, cyan accents.

**Priority** = impact on visitors ÷ effort. Effort: **S** < half a day, **M** about a day, **L** several days.

| # | Proposal | Impact | Effort |
|---|---|---|---|
| 1 | Awwwards badge stops covering text on phones | High | S |
| 2 | Let visitors skip the homepage intro by scrolling | High | S |
| 3 | Keep the orb from covering text while reading | High | M |
| 4 | Navbar backdrop once the page scrolls | Medium | S |
| 5 | Tap to zoom case-study screenshots | High | M |
| 6 | Bigger touch area on slider dots | Medium | S |
| 7 | Case-study progress bar and section jump menu | Medium | M |
| 8 | A real footer | Medium | S |
| 9 | Page transitions | Medium | M |
| 10 | Shorter social-share description | Low | S |
| 11 | Case-study "at a glance" summary | Medium | M (needs content) |

---

## 1. Awwwards badge stops covering text on phones

- **Now:** the vertical "W. Nominee" tab is fixed to the right edge at every screen size. On a 390px phone it covers about 30px of the content column, cutting off words in the hero ("don't just lo…"), the bio ("reinventing a…"), the CTA icons and every case-study paragraph.
- **Improvement:** keep it fully visible on desktop. On phones (≤767px) show a smaller version that doesn't sit over the text column, e.g. a compact horizontal badge at the bottom between the sound and chat buttons, or tucked under the navbar.
- **Why:** reading text that's cut off on the right is the most visible flaw on mobile. The badge stays visible, which matters while it's an Awwwards nominee badge.
- **Implementation:** CSS only, in `AwwwardsBadge` (a mobile variant). No behaviour change.

## 2. Let visitors skip the homepage intro by scrolling

- **Now:** on a first visit the preloader runs about 3.2s, then the page stays hidden for 8.5s while the orb types its welcome. That's roughly 12s before any content. The bubble even says "Scroll down and I'll guide you", but scrolling does nothing during the intro.
- **Improvement:** keep the intro exactly as it is, but end it early as soon as the visitor scrolls, swipes or presses a key: the content fades in and the bubble hides.
- **Why:** first-time visitors, often clients deciding in seconds, can't be locked out for 12s. It also makes the bubble's own instruction work. Visitors who just watch still get the full intro.
- **Implementation:** `HomeIntro` listens for wheel, touchmove and keydown during the intro and finishes it immediately (same code path as the timer). Small and low-risk.

## 3. Keep the orb from covering text while reading

- **Now:** the orb is fixed to the viewport and floats over whatever scrolls past. That's fine over images and empty space, but it covers body text:
  - **Desktop:** the bio paragraph and the "Performance & SEO" card.
  - **Mobile:** most of the case-study text, where the glowing sphere sits in the middle of paragraphs while you read.
- **Improvement:** the orb stays everywhere (it's the signature), but becomes reading-aware.
  - **Mobile case studies:** after the header it shrinks and moves to a corner, or dims to around 30% while long text is under it.
  - **Desktop:** nudge its resting position so it doesn't sit on the bio text.
- **Why:** preserves the orb's presence and character without making visitors read through it.
- **Implementation:** `SplineOrb` position and size per breakpoint and page variant, plus a small IntersectionObserver that sets a "reading" state when rich text is under the orb. CSS transitions on transform and opacity only, so it stays smooth. I'll show before/after screenshots for approval before merging.

## 4. Navbar backdrop once the page scrolls

- **Now:** the navbar is fully transparent, so headings and images scroll straight underneath the logo and links. That's messy on mobile, where text runs behind "BilloDesign" and the menu icon.
- **Improvement:** once the page is scrolled past the top, fade in a subtle dark, blurred backdrop behind the navbar, in the same glass style as the site's cards. At the top of the page it looks exactly as now.
- **Why:** navigation stays readable everywhere; it feels finished without changing the design.
- **Implementation:** a CSS class toggled from the navbar's existing scroll listener; `backdrop-filter: blur()` with a dark translucent background.

## 5. Tap to zoom case-study screenshots

- **Now:** each case study has around 13 UI screenshots inside the 800px text column, or 284px on a phone. The UI details these pages are meant to show off (dashboards, schedules, focus mode) can't be read, and there's no way to enlarge them.
- **Improvement:** click or tap an image to open it full-screen at full resolution, with its caption, keyboard and swipe navigation between the page's images, and Escape or tap to close.
- **Why:** the screenshots are the evidence of the work, and making them legible is the biggest improvement to the case studies.
- **Implementation:** a small lightbox on a native `<dialog>` (same pattern as the contact modal), applied to rich-text images. No library. Images are already self-hosted.

## 6. Bigger touch area on slider dots

- **Now:** the slider dots (Selected Work, Testimonials) are 32×5px on phones and 80×12px on desktop. WCAG 2.2 asks for at least 24×24px.
- **Improvement:** keep the thin bar look, but give each dot an invisible 24–44px tall hit area.
- **Why:** easier to use on touch screens; it's an accessibility fix with no visual change. Swiping already works.
- **Implementation:** padding or a pseudo-element on the dot buttons in `Slider.module.css`.

## 7. Case-study progress bar and section jump menu

- **Now:** case studies are long (OrbitAI is about 12,000px on desktop and 13,800px on mobile), with numbered chapters (1. The Problem … 4. Core Experience, i–iv). There's no sense of where you are or how much is left.
- **Improvement:** a thin cyan reading-progress line under the navbar, plus a small "Sections" menu that jumps to each chapter, built from the page's own headings.
- **Why:** makes long stories easy to scan and revisit, which is how clients read case studies.
- **Implementation:** a client component that reads the headings in the rich text, adds anchor ids, and tracks scroll progress with transform and opacity. Uses Lenis for smooth jumps.

## 8. A real footer

- **Now:** the footer is a single small line ("Muhammad/ © All rights reserved - BilloDesign") on a mostly empty black area.
- **Improvement:** a compact footer in the site's style: nav links, email, social icons, a short availability line ("Available for new projects"), and back-to-top.
- **Why:** the bottom of the page is where interested visitors look for contact options, and it also adds internal links (helps SEO).
- **Implementation:** server component, reusing the existing `SocialLinks`, nav data and tokens.

## 9. Page transitions

- **Now:** moving between the homepage and a project is a hard cut.
- **Improvement:** a short (about 300ms) cross-fade between pages, with the orb staying in place so it feels like one continuous space.
- **Why:** polish that matches the site's cinematic feel, especially now that navigation stays inside the site.
- **Implementation:** the browser's View Transitions API (supported by Next.js and React), no animation library. Skipped automatically with reduced motion and in browsers without support.

## 10. Shorter social-share description

- **Now:** the description is 149 characters, the original Webflow text. opengraph.xyz warns previews may cut it off around 110.
- **Improvement:** a ≤110-character version, for example: *"Webflow Certified Partner building fast, custom, AI-ready websites — from UI/UX design to clean code."* (101 characters).
- **Why:** the full message shows in LinkedIn, WhatsApp and Google previews.
- **Implementation:** one string in `lib/site.ts`. **Needs your wording approval.**

## 11. Case-study "at a glance" summary

- **Now:** case studies open with role, timeline and tools, then long prose. Outcomes, if any, are buried or missing.
- **Improvement:** a short summary block after the header (Challenge → Approach → Result), ideally with one or two concrete outcomes (e.g. Lighthouse score, launch, client quote).
- **Why:** decision-makers skim, and the result is what sells the next project.
- **Implementation:** new optional fields in `content/projects.json` and a small component. **Needs content from you** (results per project), so it's last.

---

## Content fixes (pre-approved: "fix typos everywhere")

Applied in this PR, in `content/projects.json` and in the importer's typo list, so a re-import keeps them:
- "Custom 404 and **maintainance** page" → maintenance
- "to-do **lists.They** struggle" → lists. They
- "adapt to the **tool.OrbitAI** was" → tool. OrbitAI

Left as is, needs your call: the services heading is written "What I&nbsp;&nbsp;Build" (two spaces) in both Webflow and the code. It renders with a slightly wider gap. Is that intentional?

## Not proposed (checked, already fine)

- **Keyboard focus:** visible focus outline on every link and button.
- **Heading order:** one H1, logical H2/H3 sections.
- **Case-study reading size:** body text is 22px desktop and 19px mobile, with about 75 characters per line.
- **Sliders:** swipe already works.
- **Reduced motion:** intro, Lenis and text effects are already skipped.
