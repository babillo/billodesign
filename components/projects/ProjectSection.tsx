import { Ellipses } from "@/components/ui/Ellipses";
import styles from "./ProjectSection.module.css";

type Props = { title: string; html: string; visual?: boolean };

/**
 * One case-study card (Webflow `.project_details-card`). `html` is the
 * sanitized rich text produced by scripts/import-webflow.mjs from the owner's
 * own CMS export, so rendering it as HTML is safe.
 */
export function ProjectSection({ title, html, visual }: Props) {
  return (
    <section className={`${styles.card} ${visual ? styles.visual : ""}`} data-reveal="">
      <div className={styles.content}>
        <h2 className="as-h3">{title}</h2>
        <div className="rich-text" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      <Ellipses variant="project" />
    </section>
  );
}
