import type { NextConfig } from "next";

// Projects that were published on Webflow but intentionally not migrated
// (owner decision, docs/migration.md §1). Old links land on the homepage.
const REMOVED_PROJECTS = [
  "beelo-pure-honey",
  "gwp",
  "handwerkerseiten",
  "majer-sales---conversion-focused-webflow-website",
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // Only billodesign.com should be indexed; *.vercel.app deployment URLs
        // (production alias and previews) stay out of search results.
        source: "/:path*",
        has: [{ type: "host", value: "(?<subdomain>.*)\\.vercel\\.app" }],
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
  async redirects() {
    return REMOVED_PROJECTS.map((slug) => ({
      source: `/projects/${slug}`,
      destination: "/",
      permanent: true,
    }));
  },
};

export default nextConfig;
