# Learning Notes

## Server vs client components (`"use client"`)
In the App Router every component is a **server component** by default: it renders to HTML on the server and ships no JavaScript. Add `"use client"` only when a component needs state (`useState`), effects (`useEffect`), event handlers or browser APIs (`window`, `localStorage`). A client component can still receive server-rendered children. That's how `SplineOrb` wraps the server-rendered `OrbSpeech` props and how `Slider` receives server-rendered cards as `slides`.

## Triggering client behavior from server markup
Server components can't pass `onClick` handlers. The pattern used here: mark elements with a data attribute (`data-open-contact`), and have one client provider listen for clicks on `document` and check `event.target.closest("[data-open-contact]")`. This is the same idea as the Webflow attribute scripts, done once (ADR-006).

## Static generation of dynamic routes
`app/projects/[slug]/page.tsx` exports `generateStaticParams()` to list the slugs, so every project page is built as static HTML at `next build`. `dynamicParams = false` makes any other slug a 404. In Next 15+, `params` is a **Promise**: `const { slug } = await params`.

## Metadata
Export `metadata` (static) or `generateMetadata()` (per page) from a page or layout. Next merges them from the layout down, and `title.template` in the root layout adds " | Billodesign" to child titles. `metadataBase` turns relative OG image paths into absolute URLs.

## `next/image`
Converts images to AVIF/WebP on demand and serves the size that fits the device (`sizes` tells it how wide the image will display). `width`/`height` reserve space to prevent layout shift, which is why the importer records image dimensions.

## `next/font`
Downloads Google Fonts **at build time** and serves them from the site itself. No request to Google at runtime, and fonts are preloaded, which avoids a flash of unstyled text.

## Webflow → Next.js concept map
| Webflow | Here |
|---|---|
| Page / CMS template page | `app/page.tsx` / `app/projects/[slug]/page.tsx` |
| CMS collection | `content/*.json` + types in `lib/content.ts` |
| Symbol / component | React component |
| Class (Client-First) | CSS Module class; tokens in `globals.css` |
| Interactions (IX2) | CSS transitions/keyframes, IntersectionObserver, GSAP |
| Custom code embed | client component (e.g. `AiChat`) |
| Page settings SEO | `metadata` / `generateMetadata` |
| 301 redirects panel | `redirects()` in `next.config.ts` |

## Rendering React errors safely
If a component throws during render, React unmounts the whole tree up to the nearest **error boundary**, which must be a class component with `getDerivedStateFromError`. Wrap risky third-party widgets in one so a failure only removes that widget (see `OrbErrorBoundary`).

## Standalone SVG vs inline SVG
Inline `<svg>` in HTML is forgiving: the HTML parser fixes attribute casing (`viewbox` → `viewBox`). A `.svg` file is XML: case-sensitive and strict about nesting. SVGs copied out of an HTML export often need repair (see troubleshooting.md).

## React Compiler lint rules
ESLint (`react-hooks`) flags `setState` called synchronously inside `useEffect` and ref reads during render. Fixes used here: set state from timer or event callbacks; "adjust state when a prop changes" during render using previous-value state (`CtaOrbTips`); keep previous values in state instead of refs (`Slider`).

## `background-clip: text` and positioned children
Gradient text is `background-image` + `background-clip: text` + transparent `-webkit-text-fill-color`. Text inside a **positioned** (`relative`/`absolute`) descendant isn't part of the parent's clip, yet it inherits the transparent fill, so it disappears. Text-splitting libraries often add `position: relative` to each word, so reset it to `static` on gradient headings.

## Before-paint scripts
React effects run after the browser has painted the server HTML. State that must be true from the very first frame (hide content, theme class, motion flags) belongs in a small inline `<script>` in `<head>`. `suppressHydrationWarning` on `<html>` lets it change attributes without hydration warnings.

## HTML email is not web HTML
Gmail, Outlook and others strip `<style>` blocks, CSS variables, flexbox and grid, and often block images until the reader allows them. Reliable emails use nested `<table role="presentation">` layouts, inline `style=""` on every element, web-safe font stacks, and a plain-text alternative. The contact notification (`lib/server/contact-email.ts`) follows these rules, and every visitor-supplied value is HTML-escaped.

## `useSyncExternalStore` for browser-stored preferences
A value that lives outside React (localStorage, `matchMedia`, a module variable) shouldn't be copied into `useState` from an effect: that renders twice and the React Compiler lint rejects it. `useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)` reads it directly. The server snapshot (e.g. `false`) is used for SSR and hydration, then React re-renders with the real client value. Example: the sound preference in `SoundProvider.tsx`.

## Browser autoplay rules
An `AudioContext` created without a user gesture starts `suspended` in Safari and Firefox, and in Chrome unless the site has a high Media Engagement score. `ctx.resume()` only works during a user activation (click, tap, key press; scrolling doesn't count). Listen in the **capture** phase, because components such as canvases may stop propagation, and clicks inside iframes never reach the parent page. Howler queues `play()` calls while locked and fires them all on unlock, so gate your own calls on `ctx.state === "running"`.

## Scroll restoration with client-side navigation
Browsers restore scroll on Back for full page loads (or the back-forward cache). With client-side routing the new page renders asynchronously, so restoration fails if the content isn't there yet: here the homepage intro hid the content. Save positions per path yourself (on link clicks and `popstate`) and restore after render; with Lenis, use `lenis.scrollTo(y, { immediate: true })` so its internal position stays in sync.

## Reserving space for images (CLS)
`width`/`height` attributes give the browser an aspect ratio before the image loads, and with `width: 100%; height: auto` the image stays fluid. That only works if its container has a definite width: a shrink-to-fit wrapper (`inline-block`, `display: table`, floats, `width: max-content`) sizes from its content, and an unloaded image has none, so it collapses to 0 anyway.

## `scroll-margin-top`
Sets how far below the top of the viewport an element stops when scrolled to (anchor links, `scrollIntoView`, Lenis). Use it to clear a fixed header instead of hard-coding offsets in JavaScript.

## Fixed backgrounds that work on iOS
`background-attachment: fixed` is ignored on iOS Safari. Instead, put a `position: fixed` layer inside a section with `clip-path: inset(0)`: the clip limits the fixed layer to the section's box, so the image appears still while the section scrolls. Avoid `transform`, `filter` or `backdrop-filter` on that section, because they make it the containing block for fixed children (they'd scroll with it).

## Animating numbers accessibly
Render the final value on the server, animate a copy marked `aria-hidden`, and keep the real value in visually hidden text. No-JS users, screen readers and reduced-motion users all get the correct number, never a half-counted one.

## Gradient borders on translucent elements
The `padding-box`/`border-box` background trick paints the gradient under the whole element, which shows through a semi-transparent background. For glass cards, draw the border on a `::before` with `padding: 1px` and a mask `linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0)`: only the 1px ring stays visible (`.gradient-border-glass` in globals.css).

## `getImageProps`: next/image without the component
`getImageProps({ src, width, height, sizes, alt })` from `next/image` returns the props `<Image>` would render (`src`, `srcSet`, `sizes`), following `next.config` (formats, widths). Useful when the markup isn't JSX, like CMS rich text: rewrite the `<img>` tags with those values. The optimizer picks AVIF/WebP from the browser's `Accept` header. `sizes` should describe the real rendered width; with plain `100vw`, phones download a size larger than needed.

## LCP and hidden start states
An element at `opacity: 0` isn't painted, so it can't be the Largest Contentful Paint until it becomes visible. If JavaScript reveals it, LCP waits for that JavaScript, and on a busy phone that took 10 s. A CSS animation (`animation: reveal-in 0.5s both`) starts with the first frame instead, so the same fade costs almost nothing.

## A poster that matches a 3D scene
A perspective camera with a fixed vertical field of view (Spline's default) keeps the scene's size proportional to the canvas **height** and centred horizontally. Changing the width only reveals more or less of the sides. `object-fit: cover` does the same to an image wider than the container, so one wide render lines up at every viewport. Measure it before relying on it (here: orb diameter / canvas height = 0.133 at five viewports).

## Lab vs real devices for WebGL
Headless Chrome without a GPU (this sandbox, and many CI and lab environments) draws WebGL in software (SwiftShader), so scene start-up and every frame are many times slower. Treat lab TBT for 3D pages as worst case. The main-thread task time (`TaskDuration`) doesn't include GPU-process work either; to see whether a scene is rendering, count WebGL draw calls (wrap `drawElements`/`drawArrays`).

## Animated images: GIF vs WebP vs video
GIF is the least efficient option. Animated WebP is a drop-in `<img>` with transparency, typically 85–90% smaller here, and it isn't blocked by iOS Low Power Mode. Video (MP4/WebM) is smaller still for large opaque animations, but needs `muted playsinline`, has no alpha in MP4, and won't autoplay in Low Power Mode, so give it a poster frame.

## Looking inside a Spline scene
Spline's web runtime is built on Three.js. Load a scene with `@splinetool/runtime` (`new Application(canvas).load(url)`) and the public API gives objects and events (`getAllObjects()`, `getSplineEvents()`). The private fields `_data` (scene JSON: materials, states, events), `_scene` (Three.js objects with `matrixWorld`, geometry and uniforms) and `_renderer` show everything else. Wrapping `WebGLRenderingContext.prototype.shaderSource` before loading captures the compiled shaders, which is how the material formulas were matched exactly (docs/orb-rebuild.md).

## Matching another Three.js renderer's colours
Three things decide the final colour beyond the material: colour management (are inputs treated as sRGB or raw?), the output transform (sRGB encoding or linear), and the light falloff model (Three.js changed to physically based falloff in r155; older code used a linear falloff to the light's range). Spline uses raw inputs, linear output and the legacy falloff. Getting any one wrong makes a faithful copy look paler or darker. Compare sampled pixel values per channel, not just screenshots by eye.

## Layout shift (CLS) and moving things without "shifting" them
The browser counts a layout shift when a visible element's position in the layout changes between frames, unless it follows recent user input. Changes made with `transform` don't count. Two practical consequences:
- An absolutely positioned box anchored on the right (`right: 26%`) moves its left edge whenever it grows, so a typing bubble shifts. Anchor it on the left and pull it back with `transform: translateX(-100%)`: same place, no shift.
- Text effects that change characters re-wrap text in proportional fonts. Lock the element's size during the effect.
Measure with `new PerformanceObserver(cb).observe({ type: "layout-shift", buffered: true })`; each entry's `sources` names the elements that moved.

## MDX in server components
MDX is Markdown that can contain JSX tags. `evaluate(source, { ...runtime })` from `@mdx-js/mdx` compiles and runs it, returning a component; pass your own tags with `<Content components={{ Figure, Spacer }} />`. In a Next.js server component on a statically generated page this happens once at build time, so visitors download only the resulting HTML. Plain Markdown maps to ordinary HTML tags (`**x**` → `<strong>`), which is why existing CSS for "rich text" keeps working. Files read at runtime by an API route with `fs` aren't detected by Next's file tracing; list them in `outputFileTracingIncludes`.

## Verifying a refactor by comparing the DOM
For a change that should be invisible, serialize the rendered page (each element's tag, sorted attributes, normalized text) before and after and diff the two. That checks every element at once, where screenshots only check what you look at, and the few differences that remain are easy to judge one by one.

## Generated share images (next/og)
A file named `opengraph-image.tsx` next to a page makes Next.js generate that page's share image and add the `og:image` tags; with `generateStaticParams` it's rendered once at build. The renderer (Satori) draws a subset of CSS with flexbox only: every container needs `display: flex`, `inset` isn't supported (use top/right/bottom/left), fonts must be TTF/OTF/WOFF (not WOFF2), and images are easiest as data URLs. Check the result by opening `/<page>/opengraph-image` in the browser; preview it as it'll appear on social platforms with LinkedIn Post Inspector or opengraph.xyz.
