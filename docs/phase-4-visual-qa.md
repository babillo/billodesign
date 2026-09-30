# Phase 4 — Visual QA checklist

Compare the new site with https://billodesign.webflow.io side by side. The cloud dev container's browser can't load external sites (troubleshooting.md), so run this on your own machine.

## Setup
```bash
npm install && npm run build && npm start   # http://localhost:3000
```
Open the live site and localhost in two windows at the same width (Chrome DevTools → device toolbar → Responsive). Use **reduced motion off**, and scroll slowly so reveals and scrubs play.

Widths: **1440 · 1280 · 1024 · 768 · 480 · 390 · 375**

For each difference, note: page · width · section · what differs · **intentional / architectural / bug** (see migration.md "Intentionally changed").

## Homepage
- [ ] Preloader: timing, curtains, bar, "W e l c o m e"
- [ ] Navbar: logo size, link spacing, blur; burger ≤767 (open/close animation, menu background)
- [ ] Hero: headline size and line breaks, paragraph, button; orb position; speech bubble position and timing (disappears after about 8.5s)
- [ ] "We got your back": heading over the dashboard image, spacing, section height
- [ ] Services: 3 columns → stacked ≤991, card borders rotating, icons, ellipse glows, "SERVICES" shadow word
- [ ] Tech stack: Lottie size, scroll-scrub feel
- [ ] Selected Work: card size, peek of next cards, thumbnail hover zoom, tool logos, arrows and bar dots position, swipe on touch
- [ ] Testimonials: same as above; avatar sizes
- [ ] Bio: portrait/text columns, divider line, email row; single column ≤479
- [ ] CTA: letters fade in, bubbles at page end and on button hover, social icons
- [ ] Footer, sound button (bottom left), Awwwards ribbon, chat button (bottom right)
- [ ] Contact modal: size, orb GIF, fields, submit button, close button, backdrop
- [ ] AI chat modal: header orb, bubbles, quick questions, input

## Project pages (check all 6)
- [ ] Title, video/thumbnail, "Visit Site", meta rows (Role/Timeline/…)
- [ ] Card order and headings match the live page; empty sections hidden
- [ ] Rich text: images full width, lists, headings, embedded videos
- [ ] Client Feedback (only Personal Brand and Elegantnast), Next Project card, CTA "Let's Build Yours"

## Global
- [ ] No horizontal scroll at any width
- [ ] Fonts identical (IBM Plex Mono headings, system body)
- [ ] Hover states on buttons, links, arrows
