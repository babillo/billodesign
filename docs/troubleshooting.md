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

---

## Wrong images on project pages: filename collisions in the importer

**Problem:** OrbitAI's case-study header and "Next Project" card showed a different image from the live site (a 2880×1964 image instead of the 2880×2160 thumbnail).

**Cause:** The importer stripped Webflow's 24-character ID prefix from CDN filenames, and `download()` skipped files that already existed. Different images with the same base name (the homepage card `thumbnail.jpg`, and two different `…_Thumbnail.jpg` files in OrbitAI's content) resolved to one local file, and whichever came first won. 3 images were silently lost.

**Solution:** card images get a `card-` prefix. `download()` tracks which URL produced each local file and adds a short ID when two different URLs share a name. `public/media` was regenerated from scratch (46 files, previously 43).

**Prevention:** when flattening remote URLs to local names, detect collisions rather than assuming names are unique.

## Rich-text videos and images sized differently from the live site

**Cause:** (1) the importer kept the stored `padding-bottom` ratio, but Webflow renders videos using `data-rt-dimensions` (FlexiBank's video: 40.5% stored vs 67.4% rendered); (2) my rich-text CSS stretched every figure to full width, whereas Webflow's "normal" figures keep their natural size (max 60%).

**Solution:** the importer derives the video ratio from `data-rt-dimensions`; the `.rich-text figure` rules are now ported 1:1 from `webflow.css`.

## Live site: chat gave canned replies, contact form said "Spam check failed"

**Symptoms:** on the first Vercel deployment, `/api/chat` answered every question with the generic fallback, and every contact submission returned 403 "Spam check failed".

**Cause:** environment variables were missing from the production build. `NEXT_PUBLIC_TURNSTILE_SITE_KEY` wasn't in the JavaScript, so the widget never produced a token. `OPENAI_API_KEY` wasn't reaching production, so the route fell back silently.

**Investigation:** `curl` POST to `/api/chat` (a fallback answer means no key, or OpenAI rejected the request; the reason is logged as `Chat API error:` in Vercel → Logs). Grep the loaded JS chunks for `0x4…` to confirm the Turnstile site key was built in.

**Solution:** set the variables for the **Production** environment and redeploy. Verified 2026-09-30: the chat answers with real project knowledge, and the Turnstile widget renders.

**Gotcha:** headless or automated browsers never receive a Turnstile token, so they always get "Spam check failed". Test the contact form in a normal browser.

**Prevention:** after changing env vars, always redeploy (`NEXT_PUBLIC_*` values are compiled into the build), and run the post-deployment checks in `deployment.md`.

## Live-site feedback round (2026-09-30)

**Hero flash on load.** *Cause:* `HomeIntro` set `html[data-intro]` in `useEffect`, so the server-rendered hero painted first and was hidden only after hydration (about 0.5s locally, longer on real networks). *Fix:* set it in the inline head script before the first paint (15s failsafe). *Lesson:* anything that must be hidden from the first frame can't wait for React.

**Tech-stack Lottie didn't react to scroll.** *Cause:* during the intro the sections are `display:none`. ScrollTriggers created in that state (Lottie, word scrub) got start and end positions of 0 and were never re-measured. *Investigation:* compared Lottie SVG output at several scroll offsets; it was identical on the live site and changing after the fix. *Fix:* `ScrollTrigger.refresh()` when the intro ends. *Lesson:* after toggling `display` on large parts of the page, refresh ScrollTrigger.

**"Image overlaps content" in We got your back.** *Cause:* not the layout (geometry was identical to Webflow at 8 viewports). The subtitle uses a gradient with `background-clip: text` and a transparent text fill. GSAP SplitText wraps words in `position: relative` divs, and positioned descendants aren't painted into the parent's text clip, so the words were transparent and the dashboard showed through. Webflow's SplitType words are static. *Fix:* `gsap.set(words, { position: "static" })`.

**Only some sounds played.** *Cause:* the ambient loop is `preload: false`, and Howler's `play()` doesn't load an unloaded sound. *Fix:* call `howl.load()` before `play()` when `state() === "unloaded"`. Verified via `Howler._howls` state in the browser.

**Contact form "nothing was sent".** Headless browsers can't pass Turnstile, so this has to be checked in a real browser with the server logs. The form now refuses to submit without a token and shows Turnstile's error code. `/api/contact` logs `Turnstile verification failed [codes] hostname`, `Resend error <status> <body>`, or `Resend is not configured` (Vercel → Logs). The Resend dashboard → Emails also shows whether a message was accepted or delivered.

**Sandbox note:** in the QA sandbox the agent proxy sometimes returns 502 for the Spline runtime chunk in Chromium, although `curl` gets 200 from Vercel. That's a sandbox artifact, not a site bug; `OrbErrorBoundary` handles it.

## Contact form showed success but no email was sent (honeypot false positive)

**Symptoms:** on a phone (Chrome, Android) the form showed the success message. Vercel showed `POST /api/contact` 200 with **"No outgoing requests"** and no logs; nothing appeared in Resend.

**Cause:** the hidden honeypot input was named `company`. Chrome autofill treats that as an address field, ignores `autocomplete="off"`, and filled it from the visitor's saved profile. The API treats a filled honeypot as a bot and deliberately returns a fake success without calling Turnstile or Resend.

**Investigation:** "No outgoing requests" plus status 200 left only one code path in `app/api/contact/route.ts`: the honeypot early return.

**Solution:** the honeypot is now `hp_check`, a name autofill doesn't recognise, and a filled honeypot is logged (`Contact form: honeypot filled, message dropped`).

**Prevention:** never give a honeypot a realistic field name (`company`, `website`, `phone`, `address`…). Log silent drops so false positives are visible.
