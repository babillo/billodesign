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
  async redirects() {
    return REMOVED_PROJECTS.map((slug) => ({
      source: `/projects/${slug}`,
      destination: "/",
      permanent: true,
    }));
  },
};

export default nextConfig;
