# Content

All content is local. There is no CMS (ADR-001). Case studies are MDX files (ADR-018).

| What | Where |
|---|---|
| Projects (6) | `content/projects/<slug>.mdx`, one file per project, read by `lib/content.ts` |
| Testimonials (4) | `content/testimonials.json`, typed by `Testimonial` |
| Navigation, social links, services, SEO defaults, orb speech lines | `lib/site.ts` |
| Homepage section copy | inside each component in `components/home/` |
| AI chat system prompt | `lib/chat/system-prompt.ts`: original persona + project/testimonial knowledge generated from the content files (ADR-012) |

## A project file

`content/projects/orbitai.mdx` → the page `/projects/orbitai`. The file name is the URL, so don't rename existing files (old links would break; add a redirect in `next.config.ts` if you must).

```mdx
---
order: 2                         # position in the homepage grid
title: OrbitAI — Calm, Intelligent AI for Focus and Deep Work
summary: OrbitAI is a personal AI productivity hub…   # page description + share text
publishedOn: 2026-01-14
thumbnail: /media/projects/orbitai/437d6fe2-thumbnail.jpg   # header image, "Next Project" card, share image
thumbnailSize: { width: 2880, height: 2160 }
websiteUrl: https://orbitaix.webflow.io/                  # "Visit Site"; null hides it
video: { wistiaId: 6i7mxoljjb, aspect: 1.853 }            # replaces the header image; null = image
meta:                                                     # header facts; null hides a row
  role: Product Designer & Webflow Developer
  timeline: Iterative design sprint
  tools: Figma, Webflow, GSAP
  scope: …                                                # kept, not displayed (as on Webflow)
  client: null
  industry: null
  market: null
testimonial: null                # a testimonial slug from testimonials.json → "Client Feedback"
results:                         # optional "Key results" strip under the header (real figures only)
  - { value: "5★", label: "Client recommendation" }
  - { value: "2–3 wks", label: "Design → Webflow launch" }
nextProject: timms-team-landing-page
card:                            # homepage grid tile
  title: OrbitAI
  description: …
  tag: AI productivity app · Product design & Webflow
  image: /media/projects/orbitai/card-thumbnail.jpg
  imageAlt: …
  imageSize: { width: 2880, height: 1964 }
  tools: [Webflow, Figma, JavaScript]                     # icons, names from lib/site.ts toolIcons
---

# Project Overview

**OrbitAI** is a personal AI productivity hub…

<Spacer />

# Visual Showcase {visual}

<Figure src="/media/projects/orbitai/thumbnail.jpg" alt="OrbitAI Hero" width={2880} height={1964} caption="OrbitAI Hero" />
```

### Key results (`results`)
Optional list of up to four `{ value, label }` pairs, shown as a thin bordered strip under the header facts (Phase 7, V2). Keep values short (`98`, `+40%`, `5★`, `3 wks`) and labels to a few words. Leave it out and nothing is shown. Only use figures you can stand behind (measured, or confirmed by the client).

### Share image
Each case study gets a generated share card (title, subtitle after the dash, `card.tag`, the orb) for LinkedIn, X, WhatsApp etc. It updates automatically from the frontmatter; nothing to do.

### Cards: `# Title`
Every line starting with `# ` (one hash) starts a new case-study card with that title, in file order.
- `# Title {visual}`: an image-heavy card (screenshots keep their colours; no screen blend).
- `# Title {hidden}`: kept in the file but not shown. "Strategy" and "User Flow" (FlexiBank) are hidden this way: the Webflow CMS had them, but the live template never displayed them.

The AI chat reads the cards titled **"Project Overview"** and **"The Result"**; keep those titles for the chat to know a project.

### Inside a card
Normal Markdown:
- paragraphs (one per line, blank line between them);
- `**bold**`, `*italic*`;
- `- ` bullet lists;
- `###`, `####`, `#####` sub-headings (chapters; they appear in the "Sections" menu);
- `<br />` for a line break inside a paragraph.

Plus three tags:

| Tag | Use |
|---|---|
| `<Figure src alt width height caption? layout? />` | an image. `width`/`height` are the file's pixel size (reserves space while loading). `caption` is optional; `layout="normal"` keeps a small image at its natural size instead of full width. Images are served optimized (AVIF/WebP at screen size), so upload full-size screenshots. Click to enlarge works automatically. |
| `<WistiaVideo id ratio />` | a Wistia video; `ratio` = height as % of width (16:9 → `56.25`). |
| `<Spacer />` | an empty line of vertical space (Webflow editors used these; 33px). |

Characters that Markdown/MDX treat specially need a backslash when you mean them literally: `\*`, `\_`, `\{`, `\}`, `\<` (and `\#` at the start of a line).

A mistake (for example `<Spacer>` without `/>`) fails the build with the file, card and line: `MDX error in content/projects/orbitai.mdx → Project Overview: Expected a closing tag for <Spacer> (7:1-7:9)`. Line numbers count from the line after the card's `# Title`.

## How to add a project

1. Put its images in `public/media/projects/<slug>/` (full size is fine).
2. Copy an existing `.mdx` file to `content/projects/<slug>.mdx` and edit it. Give `order` the grid position you want (renumber others if needed).
3. Point the previous project's `nextProject` at the new slug, and the new one at the next (the six currently form a loop: personal-brand → orbitai → timms-team → elegantnast → macrostate → flexibank → personal-brand).
4. Run `npm run build` (or `npm run dev` and open `/projects/<slug>`). The route, sitemap entry, metadata and homepage tile are generated automatically.

Image sizes: `node -e "require('sharp')('public/media/projects/x/y.jpg').metadata().then(m=>console.log(m.width,m.height))"`.

## How to change navigation or social links

Edit `navLinks` / `socialLinks` in `lib/site.ts`. "Contact" in the navbar opens the contact modal and is defined in `components/layout/Navbar.tsx`.

## Animated images
**Adding an animated GIF:** convert it instead of committing it (ffmpeg):
```
ffmpeg -i in.gif -c:v libvpx-vp9 -crf 34 -b:v 0 out.webm
ffmpeg -i in.gif -movflags +faststart -pix_fmt yuv420p -c:v libx264 -crf 28 -preset veryslow -tune animation out.mp4
```
and save its first frame as `out-poster.webp`. Then use `<Figure src="/media/…/out.gif" …/>`: a `.gif` path plays `out.webm`/`out.mp4` with the poster (the GIF itself isn't needed). GIFs with transparency (like the orb animations) can't be MP4; use animated WebP instead (`sharp(gif, { animated: true }).webp({ quality: 70 })`).

## Image alt text
Write a real description in `alt` (screen readers and search engines read it). Images migrated from Webflow without alt text got their caption, or "<Project name> screenshot" (Webflow wrote `alt="__wf_reserved_inherit"`).

## Where the data came from (migration history)

The six projects came from the official Webflow CMS CSV export (`webflow/export/billodesign - Projects.csv`), imported with `scripts/legacy/import-webflow.mjs` into a JSON file during Phases 2–7, then converted to MDX on 2026-10-03 (docs/migration.md). The importer is retired and refuses to run. The import:
- kept only the 6 homepage projects (owner decision) in slider order, and re-pointed `nextProject` links into a loop;
- fixed typos (Webfow/Weblow → Webflow, Photoshp, Hgh-performance, Fadi Al Ibahim, …);
- downloaded every image into `public/media/projects/<slug>/` and `public/media/testimonials/`;
- rewrote Embedly-wrapped Wistia videos to direct embeds (ADR-009);
- added image dimensions and replaced Webflow's placeholder alt text.

Card tags (`card.tag`) and homepage card texts were hand-written (they weren't in the CMS). Testimonials are still in `content/testimonials.json`.

## Site-wide figures (Phase 6)
In `lib/site.ts`:
- `site.availability`: navbar status pill text.
- `performanceStats`: uptime, Lighthouse scores, response time (same figures as the dashboard image).
- `bioStats`: bio strip. Years are computed from `CAREER_START_YEAR = 2022` (web design & development professionally; coding background since 2018) and refresh on each deploy (the homepage is static). Other figures from the owner: 15+ projects, Webflow Certified Partner, Google UX Certified Professional (Google UX Design Professional Certificate). ("Awwwards Nominee" was dropped from the strip on 2026-10-02: "Nominee" only means a site was submitted, so it's a weak credential; the Awwwards ribbon on the right edge stays.)
