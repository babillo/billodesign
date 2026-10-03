# SEO

## Implemented (Phase 2)

- **Metadata** (`app/layout.tsx`): `metadataBase` = `NEXT_PUBLIC_SITE_URL` (default `https://billodesign.com`); title template `%s | Billodesign`; default title and description identical to Webflow; Open Graph + Twitter `summary_large_image`; favicon and Apple touch icon.
- **Homepage:** canonical `/`, JSON-LD `WebPage` → `ProfessionalService` → `Person`, carried over from Webflow.
- **Project pages** (`generateMetadata`): title = project title, description = CMS summary (the same text Webflow used), canonical `/projects/<slug>`. Share image (Open Graph + X): a branded 1200×630 card per case study (Phase 7, V3): project name, subtitle and tag, the orb, logo and domain, generated at build time by `app/projects/[slug]/opengraph-image.tsx` (`twitter-image.tsx` reuses it; design in `lib/og/case-study-card.tsx`, fonts and orb image in `assets/og/`). The homepage keeps `public/images/og-image.jpg`.
- **Sitemap** `/sitemap.xml`: home + 6 projects. **robots.txt**: allow all except `/api/`; disallow everything on Vercel preview deployments.
- **Redirects:** 4 removed projects → `/` (308).
- **404:** real 404 status for unknown URLs.

## Changes vs Webflow

| Area | Webflow | Now | Why |
|---|---|---|---|
| Project titles | "OrbitAI — …" | "OrbitAI — … \| Billodesign" | brand in the title template |
| Canonical | none | on every page | avoid duplicates (webflow.io vs custom domain) |
| Sitemap | 404 | generated | discoverability |
| JSON-LD `url` | `"/"` (invalid) | absolute URL | valid structured data |
| JSON-LD `sameAs` | Behance, LinkedIn | all 5 profiles | complete |
| Heading outline (projects) | meta labels were `h2` ("Role", ":") | `<dl>`; section titles `h2` styled as h3 | correct hierarchy, same look |
| OG image | AVIF | JPEG 1200×630 | social platforms don't render AVIF (ADR-010) |
| Rich-text image alt (Phase 6) | `__wf_reserved_inherit` placeholder on all 31 case-study images | figure caption, or "<Project> screenshot" | screen readers, image search |
| Alt text | some wrong (OrbitAI text on Fadi's card; JS logo called a "yellow bird") | corrected | accuracy |

## Deployment hosts (Phase 5)

- `*.vercel.app` URLs send `X-Robots-Tag: noindex` (`next.config.ts`), so only `billodesign.com` is indexed. Canonical tags already point to `billodesign.com`.

## Open items (Phase 5 / 7)

- ✅ Webflow subdomain indexing turned off after cutover (2026-10-01), so `billodesign.webflow.io` sends `Disallow: /`.
- ✅ `billodesign.com` property set up in Search Console with `sitemap.xml` submitted (2026-10-01). Check coverage and queries after a few weeks.
- Ask Awwwards / Made in Webflow / Contra to update links to `billodesign.com`.
- ~~Per-project OG images are large originals~~ replaced by generated 1200×630 cards (~130 KB PNG each).
- `og:description` is 149 characters (the original Webflow text); opengraph.xyz warns that previews may truncate around 110. Candidate for Phase 6/7 copy tightening.
