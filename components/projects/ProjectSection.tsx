import { Ellipses } from "@/components/ui/Ellipses";
import { CaseStudyMdx } from "./CaseStudyMdx";
import styles from "./ProjectSection.module.css";

type Props = { title: string; source: string; visual?: boolean; slug: string };

/**
 * One case-study card (Webflow `.project_details-card`): a "# Title" section of
 * the project's MDX file (content/projects/*.mdx), rendered at build time.
 */
export function ProjectSection({ title, source, visual, slug }: Props) {
  return (
    <section className={`${styles.card} ${visual ? styles.visual : ""}`} data-reveal="">
      <div className={styles.content}>
        <h2 className="as-h3">{title}</h2>
        <div className="rich-text">
          <CaseStudyMdx source={source} where={`${slug}.mdx → ${title}`} />
        </div>
      </div>
      <Ellipses variant="project" />
    </section>
  );
}
