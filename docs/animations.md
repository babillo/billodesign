# Animations & Interactions

Every item respects `prefers-reduced-motion` unless noted.

## Preloader
- **Where:** homepage only, `components/home/Preloader.tsx` + `.module.css`
- **Trigger:** page load
- **Behavior (~3.2s):** teal overlay with black curtains. The orb GIF, pixel icon and "W e l c o m e" slide up; the progress bar grows, fills in two layers and shrinks; the items slide down; the curtains part; the overlay fades out.
- **Tech:** pure CSS keyframes with delays (timeline documented at the top of the CSS file). Rebuilt from the Webflow IX2 "Preloader" action list.
- **Reduced motion:** not shown.
- **Note:** the original showed only once Webflow's JS ran. This version shows before hydration.

## Spline orb
- **Where:** `components/experience/SplineOrb.tsx`, a fixed layer behind the content (z-index −2). Home: left 30%. Projects: left 44%.
- **Loading:** dynamic import after `requestIdleCallback`, fades in (0.6s) when the scene loads, wrapped in an error boundary.
- **Reduced motion:** unchanged for now (Phase 7 topic).

## Orb speech bubbles (typewriter)
- **Where:** `OrbSpeech` + `TypedText`. Hero (disappears after 8.5s), CTA ×2, contact modal.
- **Behavior:** types each line, pauses (`backDelay`), deletes instantly, then types the next; optional loop. Plays the typing sound while a bubble is on screen.
- **CTA logic** (`CtaOrbTips`): reaching the footer marker shows the "waiting" bubble; hovering the CTA button swaps it for the "press it NOW" bubble; opening the modal hides both.
- **Reduced motion:** first line shown statically.

## Scroll reveal ("subtle slide from bottom")
- **Where:** any element with `data-reveal` (section eyebrows, hero and CTA buttons, service cards, bio portrait, project cards and meta). `data-reveal="delay"` adds 0.5s.
- **Behavior:** opacity 0 → 1, translateY 10px → 0, 0.5s ease-in, once, when the element enters the viewport.
- **Tech:** IntersectionObserver (`ScrollEffects`) + CSS transitions (`globals.css`). The hidden state only applies when `html.motion` is set, so there's no hidden content without JS.

## Text effects (GSAP)
- `data-text="letters-fade-in"`: CTA heading letters fade in one by one (2s total stagger), play at 60% of the viewport, reset when scrolled back out of view.
- `data-text="scrub-words"`: words go from 40% to 100% opacity as the element scrolls between 90% and 50% of the viewport. Used on section intros and the bio paragraph.
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
- **Default: muted.** Nothing downloads until the visitor turns sound on. The choice is saved in `localStorage.soundOn`; a saved "on" resumes after the first interaction (browser autoplay rules).
- **Sounds:** ambient loop; click beep (`data-sound-click`); hover beep + happy orb, and a sad orb on leave (`data-sound-hover`); happy/sad orb on modal open/close; typing loop while an orb bubble is visible; chat typing while the assistant types. Loops pause when the tab is hidden.
- **Files:** `public/audio/*.mp3`. `click-beep.mp3` and `hover.mp3` came from a third party's GitHub via jsDelivr; the owner confirmed they are free to use.
