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
