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
