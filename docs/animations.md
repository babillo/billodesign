# Animations & Interactions

Every item respects `prefers-reduced-motion` unless noted.

## Preloader
- **Where:** homepage only, `components/home/Preloader.tsx` + `.module.css`
- **Trigger:** page load
- **Behavior (~3.2s):** teal overlay with black curtains. The orb GIF, pixel icon and "W e l c o m e" slide up; the progress bar grows, fills in two layers and shrinks; the items slide down; the curtains part; the overlay fades out.
- **Tech:** pure CSS keyframes with delays (timeline documented at the top of the CSS file). Rebuilt from the Webflow IX2 "Preloader" action list.
- **Reduced motion:** not shown.
- **Note:** the original showed only once Webflow's JS ran. This version shows before hydration.

## Homepage intro (orb speaks first)
- **Where:** `components/home/HomeIntro.tsx` + `html[data-intro]` rule in `globals.css`
- **Behavior:** from page load until the hero speech bubble finishes (8.5s), the page content (main sections and footer) is hidden. Only the navbar, the orb and its bubble ("Hey there... Welcome to BilloDesign 👋" → "Let's build beyond pixels." → "Scroll down and I'll guide you.") are visible after the preloader. Then the content appears.
- **Origin:** Webflow IX2. The "Preloader" action hid `.main-wrapper`, and "hide orb text tip delay hero" showed it again after 8.5s. Verified on the live site with a browser timeline (content hidden from about 4.3s to about 12s after navigation).
- **Kept visible:** elements marked `data-intro-keep` (preloader, orb layer).
- **Skip (Phase 6 #2):** after the preloader (3.2s), a scroll, swipe or key press ends the intro immediately (`wheel`, `touchmove`, `keydown` listeners). Visitors who just watch get the full 8.5s.
- **Once per visit:** the intro plays once per browser tab (`sessionStorage.introSeen`). Back/Forward or a link back to the homepage skips the preloader and the welcome bubble (`html[data-intro-seen] [data-intro-once] { display: none }`). A reload plays it again, as a Webflow page load did.
- **Scroll memory:** `SmoothScroll` saves each page's scroll position (on internal link clicks and on `popstate`) and restores it after Back/Forward with `lenis.scrollTo(y, { immediate: true })`.
- **Start before paint:** on a full page load, the inline head script in `app/layout.tsx` sets `data-intro` on `/` before the first paint, and `HomeIntro` takes over after hydration. A 15s failsafe in that script un-hides the content if JavaScript never runs. Setting the flag only in `useEffect` made the hero flash on slower connections.
- **After the intro:** `HomeIntro` calls `ScrollTrigger.refresh()`. Triggers created while the content was `display:none` (Lottie scrub, word scrub) had measured zero-size elements and would not animate otherwise.
- **Reduced motion:** no intro; content is visible immediately. Content is always in the HTML (SEO, no-JS).

## Spline orb
- **Where:** `components/experience/SplineOrb.tsx`, a fixed layer behind the content (z-index −2). Home: left 30%. Projects: left 44%.
- **Loading:** dynamic import after `requestIdleCallback`, fades in (0.6s) when the scene loads, wrapped in an error boundary.
- **Reduced motion:** unchanged for now (Phase 7 topic).

## Orb speech bubbles (typewriter)
- **Where:** `OrbSpeech` + `TypedText`. Hero (disappears after 8.5s), CTA ×2, contact modal.
- **Behavior:** types each line, pauses (`backDelay`), deletes instantly, then types the next; optional loop. Plays the typing sound while a bubble is on screen.
- **CTA logic** (`CtaOrbTips`): reaching the footer marker (`#page-end`) shows the "waiting" bubble; hovering the CTA button swaps it for the "press it NOW" bubble; opening the modal hides both. This relies on the footer staying one line, so the page end coincides with the bubble's spot under the CTA, next to the orb (see the reverted Phase 6 #8). hovering the CTA button swaps it for the "press it NOW" bubble; opening the modal hides both.
- **Reduced motion:** first line shown statically.

## Scroll reveal ("subtle slide from bottom")
- **Where:** any element with `data-reveal` (section eyebrows, hero and CTA buttons, service cards, bio portrait, project cards and meta). `data-reveal="delay"` adds 0.5s.
- **Behavior:** opacity 0 → 1, translateY 10px → 0, 0.5s ease-in, once, when the element enters the viewport.
- **Tech:** IntersectionObserver (`ScrollEffects`) + CSS transitions (`globals.css`). The hidden state only applies when `html.motion` is set, so there's no hidden content without JS.

## Text effects (GSAP)
- `data-text="letters-fade-in"`: CTA heading letters fade in one by one (2s total stagger), play at 60% of the viewport, reset when scrolled back out of view.
- `data-text="scrub-words"`: words go from 40% to 100% opacity as the element scrolls between 90% and 50% of the viewport. Used on section intros and the bio paragraph.
- Split words and characters are forced to `position: static` (`keepGradientText`). SplitText makes them `relative` by default, which breaks the gradient `background-clip: text` of headings, so the text turned invisible.
- **Tech:** GSAP SplitText + ScrollTrigger (`components/experience/ScrollEffects.tsx`).

## Tech stack Lottie
- **Where:** `components/home/TechStackLottie.tsx`, `public/lottie/tech-stack.json` (896×651)
- **Behavior:** scrubbed by scroll while in view: 40% → 100% (at 48%), holds until 52%, back to 40%.
- **Reduced motion:** shows the final frame.

## Smooth scrolling
- Lenis, `duration: 2` (original setting), `anchors: true`, synced with the GSAP ticker. Disabled with reduced motion.

## Hover / micro-interactions (CSS)
- Button: hover darkens the fill; pulsing dot (1.5s loop).
- Project card image: scale 1.3 on hover (0.2s).
- Slider arrows, modal close, chat buttons: color inversion on hover.
- Navbar burger → X (bars translate and rotate, 0.2s).
- Rotating gradient borders (8s loop).

## Sound
- **Where:** `SoundProvider` (logic), `SoundToggle` (bottom-left button).
- **First visit: muted.** Nothing downloads until the visitor turns sound on. The choice is saved in `localStorage.soundOn` and read with `useSyncExternalStore`, so a remembered "on" shows the unmuted icon immediately.
- **Revisit with sound on (owner decision 2026-10-01, as on Webflow):** Howler loads on page load and the ambient loop starts at once if the browser allows autoplay for the site (Chrome does for sites you use often; Safari and Firefox usually don't). Otherwise audio is *locked*: nothing is started while `AudioContext.state !== "running"` (Howler would queue every `play()` and fire duplicates on unlock), the first click, tap or key press (capture-phase listener) resumes the context, and a `statechange` listener then starts the loops. A first click on the toggle itself mutes. `Howler.autoSuspend` is off, so "suspended" always means "locked by the browser".
- **Loops** are started with `howl.play(savedId)`, so repeated starts resume the same sound instead of stacking copies.
- **Sounds:** ambient loop; click beep (`data-sound-click`); hover beep + happy orb, and a sad orb on leave (`data-sound-hover`, **mouse only**: a tap on phones fires pointerover/out and made the orb react to every tap); happy/sad orb on modal open/close; typing loop while an orb bubble is visible; chat typing while the assistant types. Loops pause when the tab is hidden. The ambient track (1.4 MB) isn't preloaded; `start()` calls `howl.load()` first, because Howler never loads a `preload: false` sound on `play()`.
- **Files:** `public/audio/*.mp3`. `click-beep.mp3` and `hover.mp3` came from a third party's GitHub via jsDelivr; the owner confirmed they are free to use.

## Page transitions (Phase 6 #9)
- **Where:** `app/layout.tsx` wraps the page content in React's `<ViewTransition>`; timing in `globals.css` (`::view-transition-*`, 0.3s ease).
- **Trigger:** client-side navigations (link clicks). Next.js navigations are React transitions, so React calls `document.startViewTransition` and the old and new page content crossfade. Browser Back/Forward (popstate) navigates instantly without the crossfade.
- **Technology:** the browser's View Transitions API through React; no library. Unsupported browsers (older Safari, Firefox before support) just navigate.
- **Scroll:** the Back/Forward scroll restore in `SmoothScroll` runs in a layout effect (before paint and before the "after" snapshot), so a restored page never flashes at the top.
- **Orb:** each page still mounts its own `SplineOrb`, so the orb crossfades with the page. Keeping one persistent orb across pages (smoother and avoids re-initialising the scene) changes how the orb loads, so it's a Phase 7 proposal (see CLAUDE.md).
- **Reduced motion:** all view-transition animations are disabled.
- **QA note:** headless screenshots taken mid-transition can come out black, because Chrome pauses rendering while it captures and the visitor keeps seeing the old page. Judge transitions in a real browser.

## Decoding labels (Phase 6)
- **Where:** `ScrollEffects` (`data-text="decode"`), on every `SectionHeading` eyebrow **and title**, "We got your back!", and the **hero h1 and paragraph** (they decode as the intro ends, and on every return to the top).
- **Behaviour:** every time the text scrolls into view (owner request); a running decode is stopped before replaying. When it enters (IntersectionObserver, bottom margin -10%), characters cycle through random glyphs (`A–Z 0–9 #%&/?$@`, case-matched to the original letter) and resolve left to right (rAF). Duration scales with length: 650ms for labels, up to 1.4s for a paragraph. Each text node is scrambled in place, so `<br>` and inline markup survive and the markup is restored exactly. Whitespace is kept.
- **Accessibility:** headings get the real text as `aria-label`; non-heading elements (the hero paragraph) are `aria-hidden` only while scrambling, so screen readers never read the scramble. Skipped with reduced motion (ScrollEffects returns early). The text is restored if the page changes mid-animation.

## Counting stats (Phase 6)
- **Where:** `PerformanceStats`. Uptime, Lighthouse rings (`stroke-dashoffset`) and response time animate from 0 to final in 1.6s (ease-out cubic) when 40% of the cards are visible, once. Reduced motion shows final values. (An earlier "already on screen?" shortcut misfired during the homepage intro, when content is `display:none` and reports top = 0, so the stats stayed static; it was removed.) Re-renders only during the 1.6s count.

## Fixed backdrop (Phase 6)
- "We got your back" image: `position: fixed` inside a `clip-path: inset(0)` section, so content scrolls over a still image. No JS. The section must not get `transform`/`filter`/`backdrop-filter`, which would make the fixed layer scroll with it.

## Hero scroll cue / status pill
- CSS keyframes only (wheel dot 1.8s, status dot pulse 2s); both disabled with reduced motion.
