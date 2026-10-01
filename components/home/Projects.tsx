import { ProjectTile } from "@/components/projects/ProjectTile";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ShadowTitle } from "@/components/ui/ShadowTitle";
import { getProjects } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import styles from "./Projects.module.css";

/*
 * "Selected Work". Phase 6 (owner decision): a grid showing all projects
 * instead of the Webflow slider, which hid most of them behind arrows.
 */
export function Projects() {
  return (
    <section className={styles.section} aria-label="Selected work">
      <Container spacing="large" className={styles.clip}>
        <div id="portfolio" className={styles.content}>
          <SectionHeading
            eyebrow="Projects"
            title="Selected Work"
            intro="Craft meets conversion. Here are a few recent projects that pushed boundaries."
          />
          <ShadowTitle>Portfolio</ShadowTitle>
          <div className={styles.grid}>
            {getProjects().map((p) => (
              <ProjectTile
                key={p.slug}
                slug={p.slug}
                title={p.card.title}
                tag={p.card.tag}
                image={p.card.image}
                imageAlt={p.card.imageAlt}
                imageSize={p.card.imageSize}
                websiteUrl={p.websiteUrl}
                tools={p.card.tools}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
