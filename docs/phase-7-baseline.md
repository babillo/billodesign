# Phase 7 — Baseline measurements & optimization proposals

**Status:** baseline measured 2026-10-02 on the live site (https://billodesign.com). Proposals await owner approval. Nothing below has been changed yet.

## How this was measured

- **Lighthouse 12.8** run against production, mobile (simulated slow 4G + 4× CPU slowdown) and desktop presets, 2 runs each, plus 1 run on `/projects/orbitai`.
- **Orb cost isolation:** the same page loaded in Chromium twice, normally and with the orb's loader blocked; the difference is the orb's price.
- **Per-navigation cost:** main-thread time while navigating home → OrbitAI → back.
- **Asset audit** of `public/` and the case-study content.

**Caveats:**
- **Google API unavailable:** the PageSpeed Insights API was rate-limited (HTTP 429), so Google-hosted runs weren't possible. For real-user data, run https://pagespeed.web.dev on billodesign.com yourself; it shows field data (CrUX) once Google has enough visits.
- **No GPU in the sandbox:** it draws WebGL in software (SwiftShader), so the orb's CPU and FPS numbers are worst-case. Its network size and "renders continuously" behaviour are real on every device.
- **Run-to-run variance is large** because of the orb. In runs where the orb's runtime executed inside the measurement window, scores dropped sharply.

## Scores (lab)

| Page / run | Perf | A11y | Best pr. | SEO | FCP | LCP | TBT | CLS | Weight |
|---|---|---|---|---|---|---|---|---|---|
| Home mobile #1 (orb loaded) | 39 | 93 | 100 | 100 | 1.5 s | 5.3 s | 7,180 ms | 0.112 | 2.4 MB |
| Home mobile #2 | 39 | 100 | 96 | 100 | 3.7 s | 10.0 s | 820 ms | 0.066 | 1.9 MB |
| Home desktop #1 (orb loaded) | 39 | 93 | 96 | 100 | 0.4 s | 5.0 s | 2,010 ms | 0.031 | 2.4 MB |
| Home desktop #2 | 93 | 93 | 100 | 100 | 0.4 s | 1.6 s | 20 ms | 0.034 | 2.1 MB |
| OrbitAI mobile | 53 | 93 | 100 | 100 | 4.4 s | 10.7 s | 320 ms | 0 | 5.0 MB* |

\* First screens only; lazy images below load as you scroll (see images).

SEO is 100 everywhere. The variance on Home is the orb: see below.

## Findings (biggest first)

### 1. Case-study screenshots are full-size originals
The rich-text images bypass Next.js image optimisation and are served as uploaded:

| Project | Images | Total | Widest | Displayed at |
|---|---|---|---|---|
| OrbitAI | 13 | **18.4 MB** | 3060 px | ≤ 800 px |
| FlexiBank | 10 | **8.9 MB** | 2800 px | ≤ 800 px |
| Elegantnast | 3 | 3.3 MB | 2880 px | ≤ 800 px |
| Macrostate | 1 | 1.8 MB | 2880 px | ≤ 800 px |
| Personal Brand | 3 | 1.7 MB | 2880 px | ≤ 800 px |
| Timms-Team | 1 | 1.6 MB | 1366 px | ≤ 800 px |

Lighthouse (OrbitAI, first screen only): responsive images −2.9 MB, modern formats −1.7 MB.

### 2. The Spline orb (core experience: optimise, never remove)

| | With orb | Without | Orb's share |
|---|---|---|---|
| JavaScript | 3,967 KB raw | 889 KB raw | **~3.1 MB raw (~700 KB gzip)**: Spline runtime + three.js, ~20 chunks |
| Scene + Draco decoder | 516 KB | 0 | **225 KB scene (gzip) + 85 KB WASM** |
| Main-thread time to start (throttled mobile) | — | — | **up to 13.9 s** (one chunk); 3.9 s on desktop |
| CPU while idle (sandbox, software GL) | 698 ms/s | 79 ms/s | **renders continuously**, even when nothing moves or the orb is covered |
| JS heap | 22 MB | 11 MB | +11 MB |
| Each page change | | | ~0.7 s main-thread work to re-create the orb (every page mounts its own) |

The orb starts loading at `requestIdleCallback` (2 s timeout), which still overlaps the critical first seconds. Total Blocking Time jumps from 20–800 ms to 2–7 s when its runtime executes inside the load window.

### 3. Animated GIFs

| File | Size | Where |
|---|---|---|
| `media/.../mobile-banking-app.gif` | 3.6 MB | FlexiBank case study |
| `images/orb-blinking.gif` | 2.5 MB | contact modal (when opened) |
| `images/orb-blinking-chat.gif` | 2.4 MB | AI chat (when opened) |
| `images/preloader-orb.gif` | **550 KB** | homepage preloader: the first and largest download |

Lighthouse: "efficient animated content", −368 KB (preloader GIF alone). Video (MP4/WebM) or animated AVIF is typically 80–90% smaller with the same look.

### 4. Homepage images downloaded on every case-study page
Next.js prefetches the homepage when a link to `/` is on screen (logo, navbar), and React then preloads that page's images. On case-study pages this downloads the 550 KB preloader GIF, service icons, stars, etc. (~600 KB) that are never shown (Chrome warns "preloaded but not used").

### 5. Case-study LCP waits 10 s for JavaScript
LCP element: the project header. TTFB 650 ms, load 0 ms, **render delay 10,027 ms**. It starts hidden (scroll-reveal start state) and is revealed by JavaScript, which waits behind the orb's runtime on a busy main thread.

Homepage LCP is governed by the intro (content hidden for 8.5 s by design); that's a deliberate trade-off of the experience.

### 6. Google Analytics
`gtag.js` 174 KB, 473 ms main thread, loaded `afterInteractive` (during the critical window).

### 7. Accessibility (93 → fixable to 100)
- `aria-prohibited-attr` (4): GSAP SplitText adds `aria-label` to `<p>` elements (scrub-words), which isn't allowed on paragraphs.
- `color-contrast` (73 items): scrub-words start at 40% opacity. Lighthouse sees them before you scroll; white at 40% on black is ~3.9:1 (AA needs 4.5:1). 50% gives ~5.3:1.

### 8. Smaller items
- CLS 0.03–0.11 on home, mostly from the preloader content shifting as its GIF and icon load without reserved size.
- Lottie player (65 KB gzip) loads at page start although the Tech Stack section is far down.
- Fonts: IBM Plex Mono 300/400/500/600/700 + Lato 900 preloaded (~68 KB); weight 600 appears unused.
- Render-blocking CSS ~440 ms (Next.js CSS; small).

## Proposals

Visual impact: **none** = looks identical. Each proposal keeps the experience and is measured before and after.

| # | Proposal | Evidence | Expected gain | Visual impact | Trade-off |
|---|---|---|---|---|---|
| P1 | **Responsive, modern case-study images**: generate AVIF/WebP + JPEG at 800/1600/2400 w at import; `srcset`/`sizes`; lightbox uses the largest | 18.4 MB OrbitAI; LH −4.6 MB first screen | ~85–90% less image data on case studies | none | build step; ~3 variants per image in the repo (or generated at build) |
| P2 | **GIFs → video / animated AVIF** (preloader orb, modal orb, chat orb, FlexiBank) | 9 MB of GIFs; LH −368 KB on home | 80–90% smaller; preloader paints sooner | none (same animation) | video needs `muted playsinline autoplay loop`; checking quality per file |
| P3 | **Don't prefetch the homepage from other pages** (`prefetch={false}` on links to `/`) | ~600 KB of unused home images per case-study visit | −600 KB per case-study page | none | going back to Home fetches its page data on click (~100–200 ms) |
| P4a | **Orb loads after the page has loaded** (window `load` + idle), not just at idle | TBT 2–7 s when its runtime lands in the load window | TBT/INP and LCP much better on first load | the 3D orb appears a little later; the preloader still covers it on Home | on very slow devices the orb fades in a moment after the intro starts (P4b covers this) |
| P4b | **Orb poster**: a static orb image (~30 KB) shown instantly, crossfading to the live 3D orb when ready (CLAUDE.md "Layer 1") | perceived performance; orb visible even before the runtime arrives | orb on screen immediately; no blank area | none (same pose) | one asset to keep in sync if the scene changes |
| P4c | **Pause the orb when it can't be seen**: `stop()` when the tab is hidden, while an opaque full-screen section covers it, and while the contact modal or lightbox is open; `play()` when visible | renders continuously (≈9× idle CPU) | lower CPU/GPU, battery, smoother scrolling elsewhere | none | small observer logic |
| P4d | **Keep one orb across pages** (mounted in the layout; position per page) | ~0.7 s re-create per page change; fade-in each time | instant orb on navigation, smoother transitions | slightly different: the orb glides instead of re-appearing | medium refactor of `SplineOrb` |
| P4e | **Adaptive quality on weak devices**: cap render resolution on high-DPR phones (e.g. 1.5×), and poster-only for Save-Data / very low-memory devices | high fill-rate on 3× phone screens | big GPU saving on phones | slightly softer orb on 3× screens; static orb for Save-Data users | needs real-device check |
| P4f | **Scene check in the Spline editor (owner)**: polygon count, texture sizes, lights, post-processing, unused objects | 225 KB scene + decoder | depends on the scene | none if done carefully | needs your Spline account; I'll give a checklist |
| P5 | **Show above-the-fold content without waiting for JavaScript** (no hidden start state for elements already on screen at load) | case-study LCP render delay 10 s | case-study LCP ~10.7 s → ~2–3 s (lab) | header no longer fades in on first paint (could use a pure-CSS fade instead) | — |
| P6 | **Analytics after idle** (`lazyOnload`) | 174 KB, 473 ms main thread | lighter critical path | none | visitors leaving within the first seconds may not be counted |
| P7 | **Load the Lottie player when Tech Stack approaches** | 65 KB gzip at start | lighter start | none | — |
| P8 | **Accessibility**: SplitText without `aria-label` on `<p>`; scrub-words start at 50% (not 40%) opacity | LH a11y 93 | a11y 100 | words start slightly brighter before brightening | — |
| P9 | **Reserve preloader asset sizes** | CLS 0.03–0.11 | CLS → ~0 | none | — |
| P10 | Drop the unused font weight (600) | 5 weights preloaded | ~13 KB | none | — |

### Proposed budgets (to confirm after the first round)

| Budget | Target |
|---|---|
| Initial JavaScript, excluding the orb | ≤ 300 KB gzip |
| **Orb budget** (explicit, by design) | runtime ≤ 750 KB gzip + scene ≤ 250 KB + decoder ≤ 100 KB; loads after the page `load` event; paused when not visible; poster ≤ 40 KB |
| Homepage images before scrolling | ≤ 800 KB |
| Case-study images | ≤ 300 KB per image at 1600 w; first screen ≤ 1 MB |
| Third-party scripts | ≤ 200 KB, after idle |
| Lab LCP (mobile), case studies | ≤ 3 s |
| Lab LCP, homepage | intro-governed (documented exception) |
| CLS | < 0.05 |
| Lighthouse a11y / SEO / best practices | 100 / 100 / ≥ 96 |
