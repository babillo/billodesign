import type { Metadata } from "next";
import { LabOrb } from "@/components/lab/LabOrb";

// Lab: compare the live Spline orb with the Three.js rebuild (docs/orb-rebuild.md).
// Not linked, not in the sitemap, disallowed in robots.txt and noindex.
export const metadata: Metadata = {
  title: "Orb lab",
  robots: { index: false, follow: false },
};

export default async function OrbLabPage({ searchParams }: PageProps<"/lab/orb">) {
  const params = await searchParams;
  const engine = params.engine === "spline" ? "spline" : "three";
  const variant = params.variant === "home" ? "home" : "project";
  const t = typeof params.t === "string" ? Number(params.t) : undefined;
  return <LabOrb engine={engine} variant={variant} shadows={params.shadows === "1"} freezeAt={Number.isFinite(t) ? t : undefined} />;
}
