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

**Update 2026-09-30:** still failing after the environment was switched to full network access. The policy isn't the issue: `curl` reaches the site, but Chromium doesn't trust the proxy CA (the browser trust store in the container appears to be from the previous session). Working around it inside the session isn't permitted, so live-site comparison stays manual (see phase-4-visual-qa.md).

---

## Enabling the headless browser to load external sites (visual QA)

**Problem:** Chromium in the cloud container failed with `ERR_CERT_AUTHORITY_INVALID` for every external HTTPS site, while `curl` worked.

**Cause:** Outbound HTTPS goes through the agent proxy, which re-signs TLS with its own CA (`/root/.ccr/agent-proxy-ca.crt`). The browser NSS store in the container predated the proxy CA's renewal, so Chromium didn't trust it. Allowing the site in robots.txt or the Webflow traffic settings has no effect on this.

**Solution (authorized by the owner, 2026-09-30):** launch the QA browser with Chromium's `--ignore-certificate-errors-spki-list=<sha256 SPKI hashes>`, computed from the proxy CA file:
```bash
openssl x509 -in /root/.ccr/agent-proxy-ca.crt -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64
```
(the file holds two certificates, so hash both). This trusts **only** that proxy's keys. Normal verification stays on for everything else, and it applies only to the browsers launched for comparison scripts.

**Prevention:** in a fresh session the container may already have a correct trust store; try without the flag first.

---

## Component styles overridden depending on CSS load order

**Problem:** On mobile, the testimonial slides were squeezed to 140px and overlapped.

**Cause:** `Slider.module.css` set `.mask { width: 40% }` and `Testimonials.module.css` set `.mask { width: 90% }` inside a media query. Both have the same specificity, so the stylesheet that loads **last** wins, and CSS Modules chunk order isn't guaranteed. For Projects the consumer happened to win; for Testimonials it lost.

**Solution:** shared components don't set properties that consumers override (width now comes only from the consumer). Where an override is intended, raise specificity deliberately (`.content .tip` in `Cta.module.css`, mirroring Webflow's combo classes).

**Prevention:** when a component accepts a `className` to customize a property, don't also give that property a default in the component's own module.

---

## Rebuild looked shorter than the original: lazy images and hidden spacers

**Symptoms:** Section heights differed from the live site by tens to hundreds of pixels.

**Causes found:**
1. **Measurement artifact:** the live site's lazy images below the fold have 0 height until scrolled into view, while `next/image` reserves space. Always scroll the full page before measuring.
2. **Real difference:** the importer stripped `<p>&zwj;</p>` paragraphs from rich text. Webflow editors use them as spacers (33px each). They're now kept.
3. **Real difference:** project card thumbnails stretched to the wrapper height; the Webflow class had `align-items: flex-start`.
