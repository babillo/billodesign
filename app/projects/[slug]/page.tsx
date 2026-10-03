import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SplineOrb } from "@/components/experience/SplineOrb";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { CaseStudyNav } from "@/components/projects/CaseStudyNav";
import { ImageLightbox } from "@/components/projects/ImageLightbox";
import { ProjectSection } from "@/components/projects/ProjectSection";
import { RichTextVideos } from "@/components/projects/RichTextVideos";
import { Cta } from "@/components/sections/Cta";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { getProject, getProjects, getTestimonial } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import styles from "./page.module.css";

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
    // Share images: opengraph-image.tsx / twitter-image.tsx next to this page.
    openGraph: { type: "article", title: project.title, description },
    twitter: { card: "summary_large_image", title: project.title, description },
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
          {/* Cards in file order; content/projects/<slug>.mdx, one "# Title" per card. */}
          {project.sections
            .filter((s) => !s.hidden)
            .map((s) => (
              <ProjectSection key={s.title} slug={project.slug} title={s.title} source={s.source} visual={s.visual} />
            ))}

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

      <ImageLightbox />
      <RichTextVideos />
      <CaseStudyNav />
      <Cta title="Let’s Build Yours" text="Ready to turn your vision into a living, breathing digital experience?" />
    </>
  );
}
