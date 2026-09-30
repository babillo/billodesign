# SEO

## Implemented (Phase 2)

- **Metadata** (`app/layout.tsx`): `metadataBase` = `NEXT_PUBLIC_SITE_URL` (default `https://billodesign.com`); title template `%s | Billodesign`; default title and description identical to Webflow; Open Graph + Twitter `summary_large_image`; favicon and Apple touch icon.
- **Homepage:** canonical `/`, JSON-LD `WebPage` → `ProfessionalService` → `Person`, carried over from Webflow.
- **Project pages** (`generateMetadata`): title = project title, description = CMS summary (the same text Webflow used), canonical `/projects/<slug>`, OG image = project thumbnail.
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
| Alt text | some wrong (OrbitAI text on Fadi's card; JS logo called a "yellow bird") | corrected | accuracy |

## Deployment hosts (Phase 5)

- `*.vercel.app` URLs send `X-Robots-Tag: noindex` (`next.config.ts`), so only `billodesign.com` is indexed. Canonical tags already point to `billodesign.com`.

## Open items (Phase 5 / 7)

- After cutover: redirect or noindex `billodesign.webflow.io` so it isn't duplicate content (migration.md §6).
- Owner to check Search Console for indexed URLs and queries.
- Ask Awwwards / Made in Webflow / Contra to update links to `billodesign.com`.
- Per-project OG images are large originals (up to ~3000px). Consider resized OG variants.
