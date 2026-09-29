import projectsData from "@/content/projects.json";
import testimonialsData from "@/content/testimonials.json";

// Content is generated from the Webflow CSV exports by scripts/import-webflow.mjs.
// See docs/content.md for how to add or edit a project.

export type ProjectSectionKey =
  | "overview"
  | "challenge"
  | "problemStatement"
  | "goalStatement"
  | "researchInsights"
  | "strategy"
  | "designProcess"
  | "userFlow"
  | "lowFidelityWireframes"
  | "designSystem"
  | "highFidelityWireframes"
  | "finalDesigns"
  | "solution"
  | "result"
  | "visualShowcase"
  | "caseStudy";

export type Project = {
  slug: string;
  title: string;
  summary: string | null;
  publishedOn: string;
  thumbnail: string;
  thumbnailSize: ImageSize;
  websiteUrl: string | null;
  /** Header video (Wistia); when set it replaces the thumbnail in the header. */
  video: { wistiaId: string; aspect: number } | null;
  meta: {
    role: string | null;
    timeline: string | null;
    tools: string | null;
    scope: string | null;
    client: string | null;
    industry: string | null;
    market: string | null;
  };
  /** Sanitized rich-text HTML per case-study section; missing = section hidden. */
  sections: Partial<Record<ProjectSectionKey, string>>;
  testimonial: string | null;
  nextProject: string;
  /** Homepage slider card; hand-written in Webflow, so it differs from title/summary. */
  card: {
    title: string;
    description: string;
    image: string;
    imageAlt: string;
    imageSize: ImageSize;
    tools: string[];
  };
};

export type Testimonial = {
  slug: string;
  name: string;
  role: string;
  quotes: string[];
  avatar: string;
  avatarAlt: string;
  avatarSize: ImageSize;
};

export type ImageSize = { width: number; height: number };

const projects = projectsData as Project[];
const testimonials = testimonialsData as Testimonial[];

export function getProjects(): Project[] {
  return projects;
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getTestimonials(): Testimonial[] {
  return testimonials;
}

export function getTestimonial(slug: string | null): Testimonial | undefined {
  return slug ? testimonials.find((t) => t.slug === slug) : undefined;
}
