import { ProjectCard } from "@/components/projects/ProjectCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ShadowTitle } from "@/components/ui/ShadowTitle";
import { Slider } from "@/components/ui/Slider";
import { getProjects } from "@/lib/content";
import styles from "./Projects.module.css";

export function Projects() {
  const slides = getProjects().map((p) => (
    <ProjectCard
      key={p.slug}
      slug={p.slug}
      title={p.card.title}
      description={p.card.description}
      image={p.card.image}
      imageAlt={p.card.imageAlt}
      imageSize={p.card.imageSize}
      websiteUrl={p.websiteUrl}
      tools={p.card.tools}
    />
  ));

  return (
    <section className={styles.section} aria-label="Selected work">
      <div className="padding-global">
        <div className="container-large">
          <div className={`padding-section-large ${styles.clip}`}>
            <div id="portfolio" className={styles.content}>
              <SectionHeading
                eyebrow="Projects"
                title="Selected Work"
                intro="Craft meets conversion. Here are a few recent projects that pushed boundaries."
              />
              <ShadowTitle>Portfolio</ShadowTitle>
              <div className={styles.sliderWrap}>
                <Slider label="Selected projects" slides={slides} maskClassName={styles.mask} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
