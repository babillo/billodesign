import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import testimonialsData from "@/content/testimonials.json";

// Case studies are MDX files in content/projects/ (one per project, file name =
// URL slug): YAML frontmatter for the project data, then one "# Title" heading
// per case-study card. See docs/content.md for the format and how to add a project.
// Read once at build time; the pages are static. /api/chat also reads them at
// runtime (traced into its function by next.config.ts).

const PROJECTS_DIR = path.join(process.cwd(), "content/projects");

/** One case-study card: a "# Title" heading in the MDX file and the MDX below it. */
export type CaseStudySection = {
  title: string;
  /** `{visual}`: image-heavy card, drawn without the screen blend. */
  visual: boolean;
  /** `{hidden}`: kept in the file but not shown (e.g. CMS fields Webflow never displayed). */
  hidden: boolean;
  /** MDX source of the card body. */
  source: string;
};

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
  /** "Key results" strip under the header (Phase 7, V2); optional, real figures only. */
  results?: { value: string; label: string }[];
  /** Case-study cards in page order. */
  sections: CaseStudySection[];
  testimonial: string | null;
  nextProject: string;
  /** Homepage card; hand-written in Webflow, so it differs from title/summary. */
  card: {
    title: string;
    description: string;
    /** One-line tag shown in the homepage project grid (Phase 6). */
    tag: string;
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

type Frontmatter = Omit<Project, "slug" | "sections"> & { order: number };

// "# Title" or "# Title {visual}" / "# Title {hidden}" at the start of a line.
const SECTION_HEADING = /^# (.+?)(?: \{(visual|hidden)\})?[ \t]*$/gm;

function parseSections(body: string): CaseStudySection[] {
  const headings = [...body.matchAll(SECTION_HEADING)];
  return headings.map((m, i) => ({
    title: m[1].trim(),
    visual: m[2] === "visual",
    hidden: m[2] === "hidden",
    source: body.slice(m.index + m[0].length, headings[i + 1]?.index ?? body.length).trim(),
  }));
}

function loadProject(file: string): Project & { order: number } {
  // `order` (homepage grid position) stays on the object; Project doesn't expose it.
  const raw = fs.readFileSync(path.join(PROJECTS_DIR, file), "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error(`${file}: missing YAML frontmatter (--- … ---)`);
  const data = parseYaml(match[1]) as Frontmatter;
  return { ...data, slug: file.replace(/\.mdx$/, ""), sections: parseSections(match[2]) };
}

const projects: Project[] = fs
  .readdirSync(PROJECTS_DIR)
  .filter((f) => f.endsWith(".mdx"))
  .map(loadProject)
  .sort((a, b) => a.order - b.order);
const testimonials = testimonialsData as Testimonial[];

export function getProjects(): Project[] {
  return projects;
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/**
 * Plain text of a case-study card (for the AI chat's knowledge): MDX tags,
 * Markdown markers and escapes removed.
 */
export function sectionText(project: Project, title: string): string {
  const section = project.sections.find((s) => s.title === title && !s.hidden);
  if (!section) return "";
  return section.source
    .replace(/<[^>]+>/g, " ")
    .replace(/^#{1,6} |^- /gm, "")
    .replace(/\*\*|\*/g, "")
    .replace(/\\(.)/g, "$1")
    .replace(/&nbsp;/g, " ")
    .replace(/&zwj;/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function getTestimonials(): Testimonial[] {
  return testimonials;
}

export function getTestimonial(slug: string | null): Testimonial | undefined {
  return slug ? testimonials.find((t) => t.slug === slug) : undefined;
}
