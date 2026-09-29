# Troubleshooting / Problem Log

Searchable record of meaningful problems and how they were solved.

---

## SVGs from the Webflow export render partly or not at all

**Problem:** Icons extracted from the Webflow export into `public/icons/*.svg` rendered wrong: the logo lost its "BilloDesign" wordmark, and the email, service and social icons were blank or missing their gradients.

**Symptoms:** The same markup looked fine inline on the Webflow site, but was broken as a standalone `.svg` file loaded via `<img>`.

**Cause:** Two separate export artifacts:
1. **Lowercased attributes and tags.** Webflow's export writes `viewbox`, `maskunits`, `gradientunits`, `lineargradient`, and so on. The HTML parser fixes the casing for inline SVG, but a standalone SVG is XML and case-sensitive, so these attributes were ignored.
2. **Self-closing tags became nested elements.** Filter primitives (`<feFlood/>`, `<feOffset/>`, …) came out of the export as `<feFlood><feColorMatrix>…</feColorMatrix></feFlood>`. That nesting is invalid, so the whole drop-shadow filter failed and the filtered wordmark disappeared.

**Investigation:** Rendered `logo.svg` to PNG with `sharp` (no browser needed). Removing `filter="url(#…)"` made the wordmark appear, which isolated the filter. Printing the `<filter>` block showed the nesting.

**Solution:** A one-off Python pass over `public/icons/*.svg`:
- restore camelCase attributes and tag names (`viewBox`, `maskUnits`, `gradientTransform`, `linearGradient`, `feGaussianBlur`, …)
- make `fe*` primitives self-closing and drop their stray closing tags

Then validated every file with an XML parser, checking that no `path`/`stop`/`rect`/… element has children.

**Prevention:** Don't copy SVGs out of exported HTML as-is. Validate them as XML, or re-export them from Figma.

**Related files:** `public/icons/*.svg`

---

## Whole page replaced by "This page couldn't load" when Spline fails

**Problem:** When the Spline scene request failed, the entire site was replaced by Next.js's error screen.

**Symptoms:** A blank error page with "Reload / Back" buttons, and `TypeError: Failed to fetch` in the console.

**Cause:** `@splinetool/react-spline` catches the load error, stores it in state, and **re-throws it during render**. With no error boundary, React unmounts the whole tree. In production this can happen through ad-blockers, offline visitors or a Spline CDN outage. In the dev sandbox it happens every time, because external HTTPS is intercepted.

**Solution:** `components/experience/OrbErrorBoundary.tsx` wraps the Spline component. On failure the orb simply doesn't render, and the rest of the page is unaffected.

**Prevention:** Wrap any third-party runtime that loads remote assets in an error boundary.

**Related files:** `components/experience/SplineOrb.tsx`, `components/experience/OrbErrorBoundary.tsx`

---

## JS chunks return 500 after rebuilding while `next start` is running

**Problem:** After `npm run build`, pages loaded but client chunks returned 500 and hydration failed.

**Cause:** The previous `next start` process was still serving and had the old build manifest in memory, while `.next/` had been replaced underneath it. The new `next start` failed silently because the port was already in use.

**Solution:** Stop the old server before starting a new one.

**Prevention:** Always restart `next start` after a rebuild. Beware that `pkill -f "next start"` can also kill the shell running the command, since that shell's command line contains the same text. Kill by PID instead.

---

## Headless browser can't load the live Webflow site

**Problem:** Playwright/Chromium in the cloud dev container failed with `ERR_CERT_AUTHORITY_INVALID` for every external HTTPS site (webflow.io, Spline, Wistia).

**Cause:** The sandbox routes outbound traffic through a TLS-intercepting proxy whose CA isn't trusted by Chromium. Trusting that CA from inside the session was not permitted.

**Workaround:** Visual behavior of the original site was reconstructed from the export's code instead: the IX2 interaction JSON in `webflow.js`, the CSS, and inline scripts. Local screenshots of the new app still work, because localhost bypasses the proxy. Side-by-side visual QA against the live site (Phase 4) must be done on a machine with normal network access.
