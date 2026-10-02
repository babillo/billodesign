# Phase 7 — Baseline, optimizations & results

**Status:** baseline measured 2026-10-02 on the live site (https://billodesign.com). Round 1 (P1–P3, P4a–c, P5–P10) approved and implemented 2026-10-02; see [Round 1 results](#round-1-results). Round 2 (P4d, P4e, P4f) not started.

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

## Round 1 results

Approved by the owner: P1, P2, P3, P4a, P4b, P4c, P5, P6, P7, P8, P9, P10. Deferred to round 2: P4d (one persistent orb) and P4e (adaptive quality), plus P4f (scene check, owner).

### How before/after was measured
Same machine, same production build served locally (`next start`), before and after, with the Spline CDN reachable in both. That's not the setup of the first table (production over the internet), so compare within this section only. Lighthouse mobile ran twice per page.

### Lighthouse (mobile unless noted)

| Page | Perf | A11y | FCP | LCP | TBT | CLS | Weight (first screen) |
|---|---|---|---|---|---|---|---|
| Home, before | 34–35 | 100 | 2.9–3.0 s | 6.1–6.3 s | 6.4–6.9 s | 0.023 | 2,353 KB |
| Home, after | 49–50 | 100 | 1.1 s | 3.8–3.9 s | 5.7–6.8 s | 0.035–0.05 | 1,767 KB |
| Home desktop, before | 56 | 100 | 0.8 s | 1.6 s | 1.4 s | 0.015 | 2,353 KB |
| Home desktop, after | 60 | 100 | 0.3 s | 0.8 s | 4.9 s | 0.008 | 1,768 KB |
| OrbitAI, before | 32–33 | 93 | 2.9 s | 9.8 s | 4.3–4.6 s | 0 | 5,629 KB |
| OrbitAI, after | 49–50 | **100** | 2.3–2.7 s | **3.7–3.8 s** | 7.3–7.5 s | 0 | 2,058 KB |
| FlexiBank, before | 33 | 93 | 3.2 s | 12.8 s | 4.7 s | 0 | 2,948 KB |
| FlexiBank, after | 52 | **100** | 2.3 s | **3.7 s** | 7.4 s | 0 | 2,060 KB |

Best practices: 96–100 before, 100 after. SEO 100 throughout.

### Full page weight (scrolled to the bottom, 390 px, 3× screen)

| Page | Before | After | Images before → after |
|---|---|---|---|
| Home | 2,351 KB | 1,766 KB | 604 → 114 KB |
| OrbitAI | 11,859 KB | 1,935 KB | 10,180 → 285 KB |
| FlexiBank | 5,030 KB | 2,033 KB | 3,354 → 386 KB |
| OrbitAI at 1440 px | 20,614 KB | 1,998 KB | 18,927 → 340 KB |

What's left on every page is the JavaScript (~1.24 MB transferred, of which the Spline runtime is most) plus the Spline scene and decoder (323 KB).

### What the numbers say
- **Big wins:** case-study LCP 9.8–12.8 s → 3.7 s; case studies 60–90% lighter; first paint 2–3× faster on Home; accessibility 100 on every page.
- **Not improved: Total Blocking Time.** In both runs it's almost entirely the Spline runtime starting up: one chunk accounts for ~13.8 s of throttled scripting. Moving it after `load` takes it off the critical path (FCP/LCP improved), but Lighthouse keeps measuring until the CPU is quiet, so the start-up is still counted, and the numbers vary by ±1–3 s between runs. The sandbox has no GPU, so this is a worst case; real devices compile shaders and draw frames on the GPU. Round 2 (P4e) and the scene check (P4f) are the levers for this.
- **CLS** on Home comes from the hero speech bubble growing while it types (pre-existing, right-anchored bubble). It stays under 0.05. Optional fix below.

### Optimization decision log

**P1 — Case-study images through the image optimizer**
- **Problem:** rich-text screenshots served as uploaded (up to 3060 px, 1–3.7 MB each).
- **Evidence:** OrbitAI 18.4 MB of images; Lighthouse "properly size images" −2.9 MB, "modern formats" −1.7 MB on the first screen alone.
- **Solution:** `lib/rich-text.ts` rewrites `<img>` with `getImageProps` (AVIF/WebP, `srcset`, `sizes` = measured column width: viewport − 106 px on phones, − 146 px on tablets, 800 px max). The lightbox uses a 1920 px version (`data-full`). ADR-015.
- **Result:** OrbitAI images 10.2 MB → 285 KB (phone) and 18.9 MB → 340 KB (desktop). Small UI text in screenshots checked side by side at 1920 px: no visible difference.
- **Trade-off:** Vercel image transformations (cached, a few hundred in total).
- **Decision:** keep.

**P2 — GIFs → animated WebP / video**
- **Problem:** 9 MB of GIFs, including the 550 KB preloader orb (the homepage's first big download).
- **Evidence:** Lighthouse "use video formats for animated content".
- **Solution:** orb GIFs (preloader, contact modal, chat) → animated WebP, which keeps their transparency and stays an `<img>`: 550 → 47 KB, 2.5 MB → 224 KB, 2.4 MB → 378 KB. FlexiBank's 3.6 MB GIF → WebM 270 KB / MP4 410 KB + 14 KB poster, played in view by `RichTextVideos`. Frames compared side by side: identical.
- **Trade-off:** a video won't autoplay in iOS Low Power Mode (shows the poster), which is why the orbs use WebP instead.
- **Decision:** keep.

**P3 — No homepage prefetch from the navbar**
- **Problem:** case-study pages downloaded the homepage's images (~600 KB) through the prefetch of `/`.
- **Solution:** `prefetch={false}` on the logo and nav links (all point at `/`).
- **Result:** no homepage images on case-study pages.
- **Trade-off:** going Home fetches its page data on click (small; images then load as usual).
- **Decision:** keep.

**P4a — Orb runtime after `load`**
- **Problem:** the runtime started at idle (2 s timeout) and overlapped page loading.
- **Solution:** start after the window `load` event + `requestIdleCallback` (3 s timeout).
- **Result:** FCP and LCP improved on every page (table above). TBT isn't reduced, because the start-up still happens inside the lab window.
- **Trade-off:** the live orb appears a moment later; the poster (P4b) covers that.
- **Decision:** keep.

**P4b — Orb poster**
- **Problem:** blank space where the orb would be until the runtime arrived.
- **Solution:** a 13 KB still render (2880×1200) behind the canvas with `object-fit: cover`; the camera scales the scene with the canvas height, so it lines up at every size (checked at 390, 768, 1024, 1440 and 1920 px, home and project variants). ADR-016.
- **Result:** the orb is visible from first paint; the live scene cross-fades over it.
- **Trade-off:** re-render it if the scene's look changes (below).
- **Decision:** keep.

**P4c — Pause the orb while unseen**
- **Problem:** the scene rendered every frame, even under opaque sections and modals.
- **Solution:** `stop()`/`play()` driven by open dialogs and `data-orb-cover` sections that fill the viewport.
- **Result:** WebGL draw calls 85/s (desktop) and ~200/s (phone) → 0 while covered or behind a modal, resuming on return. (Tab switches were already paused by the browser.)
- **Trade-off:** none visible: the last frame stays on the canvas.
- **Decision:** keep.

**P5 — Above-the-fold content without JavaScript**
- **Problem:** the case-study header started hidden and waited for JavaScript (LCP render delay 10 s).
- **Solution:** `data-reveal="load"`: the same fade as a CSS animation from first paint.
- **Result:** case-study LCP 9.8–12.8 s → 3.7 s (lab, mobile).
- **Trade-off:** none; the fade looks the same.
- **Decision:** keep.

**P6 — Analytics after load**
- **Solution:** GA `lazyOnload`.
- **Result:** gtag (174 KB) is out of the critical window.
- **Trade-off:** visits that leave within the first seconds may not be counted.
- **Decision:** keep.

**P7 — Lottie when near**
- **Solution:** the player and JSON load when Tech Stack is a screen away.
- **Result:** −65 KB gzip of JavaScript at start on Home.
- **Decision:** keep.

**P8 — Accessibility**
- **Solution:** SplitText `aria: "none"` for scrub-words; start opacity 40% → 50% (~5.3:1 contrast).
- **Result:** Lighthouse accessibility 93 → 100 on all pages.
- **Trade-off:** words start slightly brighter than on Webflow.
- **Decision:** keep.

**P9 — Preloader sizes**
- **Solution:** width/height on the preloader orb (the icon already had them); poster image sized too.
- **Result:** preloader shifts are ~0.006; the remaining home CLS is the speech bubble.
- **Decision:** keep.

**P10 — Unused font weight**
- **Solution:** dropped IBM Plex Mono 600.
- **Result:** fonts 65 → 55 KB.
- **Decision:** keep.

### Orb poster: how to re-render it
With a production server running, open a case-study page at 2880×1200 with the orb element set to `left: 0`. Hide everything except the canvas (`* { visibility: hidden } canvas { visibility: visible }`), wait for the scene to settle, then screenshot the canvas and save it as WebP quality 80 to `public/images/orb-poster.webp`. Any headless browser with WebGL works (Playwright was used).

### Budgets (confirmed after round 1)

| Budget | Target | Now |
|---|---|---|
| Initial JavaScript, excluding the orb | ≤ 300 KB gzip | ~240 KB (Phase 3 figure; GSAP included) |
| **Orb** | runtime ≤ 750 KB gzip + scene ≤ 250 KB + decoder ≤ 100 KB; after `load`; paused when unseen; poster ≤ 40 KB | ~700 KB + 225 KB + 85 KB; after `load` ✅; paused ✅; poster 13 KB ✅ |
| Homepage images, full scroll | ≤ 800 KB | 114 KB ✅ |
| Case-study images | ≤ 300 KB per image at 1600 w; page ≤ 1 MB on phones | ~25–80 KB each; 285–386 KB per page ✅ |
| Third-party scripts | ≤ 200 KB, after idle | GA 174 KB, `lazyOnload` ✅ |
| Lab LCP (mobile), case studies | ≤ 3 s | 3.7 s ❌ (FCP 2.3–2.7 s; the rest is the orb runtime competing) |
| CLS | < 0.05 | 0–0.05 (bubble) ⚠️ |
| Lighthouse a11y / SEO / best practices | 100 / 100 / ≥ 96 | 100 / 100 / 100 ✅ |

### Round 2 candidates (not started)
- **P4e adaptive quality:** cap the orb's render resolution on high-density phones, poster-only with Save-Data. Needs a real-phone check.
- **P4f scene check (owner, Spline editor):** polygon counts, texture sizes, lights, post-processing, unused objects. Directly reduces the start-up time that dominates TBT.
- **P4d one persistent orb:** keep the scene alive across page changes (~0.7 s re-create per navigation today).
- **Optional:** anchor the hero speech bubble so typing doesn't register as layout shift (CLS 0.03–0.05 → ~0).
