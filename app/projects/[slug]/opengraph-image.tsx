import { notFound } from "next/navigation";
import { getProject, getProjects } from "@/lib/content";
import { caseStudyCard, OG_SIZE } from "@/lib/og/case-study-card";

// Branded share image per case study (Phase 7, V3), rendered at build time.
export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Billodesign case study";

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const project = getProject((await params).slug);
  if (!project) notFound();
  return caseStudyCard(project);
}
