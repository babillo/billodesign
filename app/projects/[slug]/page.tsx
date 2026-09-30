import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SplineOrb } from "@/components/experience/SplineOrb";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { ProjectSection } from "@/components/projects/ProjectSection";
import { Cta } from "@/components/sections/Cta";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { getProject, getProjects, getTestimonial, type ProjectSectionKey } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import styles from "./page.module.css";

// Order and headings of the Webflow project template. "strategy" and
// "userFlow" exist in the CMS but were never shown on the live site, so they
// are intentionally not rendered (docs/content.md).
const SECTIONS: { key: ProjectSectionKey; title: string; visual?: boolean }[] = [
  { key: "overview", title: "Project Overview" },
  { key: "challenge", title: "The Challenge/Problem" },
  { key: "problemStatement", title: "Problem Statement" },
  { key: "goalStatement", title: "Goal Statement" },
  { key: "researchInsights", title: "Research & Insights" },
  { key: "designProcess", title: "Design Process" },
  { key: "lowFidelityWireframes", title: "Low Fidelity Wireframes", visual: true },
  { key: "designSystem", title: "Design System", visual: true },
  { key: "highFidelityWireframes", title: "High Fidelity Wireframes", visual: true },
  { key: "finalDesigns", title: "Final Design & Prototype", visual: true },
  { key: "solution", title: "The Solution" },
  { key: "result", title: "The Result" },
  { key: "visualShowcase", title: "Visual Showcase", visual: true },
  { key: "caseStudy", title: "Case Study", visual: true },
];

// The "Next Project" card showed the same three tool logos on every page.
const NEXT_PROJECT_TOOLS = ["Webflow", "Figma", "JavaScript"];

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const description = project.summary ?? undefined;
  return {
    title: project.title,
    description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: { type: "article", title: project.title, description, images: [{ url: project.thumbnail, ...project.thumbnailSize }] },
    twitter: { card: "summary_large_image", title: project.title, description, images: [project.thumbnail] },
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const testimonial = getTestimonial(project.testimonial);
  const next = getProject(project.nextProject)!;

  return (
    <>
      <SplineOrb variant="project" />
      <ProjectHeader project={project} />

      <Container spacing="large">
        <div className={styles.content}>
          {SECTIONS.map(({ key, title, visual }) => {
            const html = project.sections[key];
            return html ? <ProjectSection key={key} title={title} html={html} visual={visual} /> : null;
          })}

          {testimonial && (
            <section className={styles.feedback} aria-labelledby="client-feedback">
              <h2 id="client-feedback" className="as-h3" data-reveal="">
                Client Feedback
              </h2>
              <TestimonialCard testimonial={testimonial} />
            </section>
          )}

          <div className={styles.divider} />

          <section className={styles.feedback} aria-labelledby="next-project">
            <h2 id="next-project" className="as-h3" data-reveal="">
              Next Project
            </h2>
            <ProjectCard
              slug={next.slug}
              title={next.title}
              description={next.summary}
              image={next.thumbnail}
              imageAlt=""
              imageSize={next.thumbnailSize}
              websiteUrl={next.websiteUrl}
              tools={NEXT_PROJECT_TOOLS}
              headingLevel="h3"
            />
          </section>
        </div>
      </Container>

      <Cta title="Let’s Build Yours" text="Ready to turn your vision into a living, breathing digital experience?" />
    </>
  );
}
