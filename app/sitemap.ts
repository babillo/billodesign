import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/content";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    ...getProjects().map((p) => ({
      url: `${site.url}/projects/${p.slug}`,
      lastModified: p.publishedOn,
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
