import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { ImageSize } from "@/lib/content";
import { toolIcons } from "@/lib/site";
import { VisitSiteLink } from "./VisitSiteLink";
import styles from "./ProjectCard.module.css";

type Props = {
  slug: string;
  title: string;
  description: string | null;
  image: string;
  imageAlt: string;
  imageSize: ImageSize;
  websiteUrl: string | null;
  tools: string[];
  /** Heading level inside the surrounding outline. */
  headingLevel?: "h4" | "h3";
};

/** Project preview card (Webflow `.project_slide-card`): homepage slider and "Next Project". */
export function ProjectCard({ slug, title, description, image, imageAlt, imageSize, websiteUrl, tools, headingLevel = "h4" }: Props) {
  const href = `/projects/${slug}`;
  const Heading = headingLevel;
  return (
    <article className={styles.card}>
      <div className={styles.content}>
        <Link href={href} className={styles.thumbnailWrap} tabIndex={-1} aria-hidden="true">
          <Image
            src={image}
            alt={imageAlt}
            width={imageSize.width}
            height={imageSize.height}
            sizes="(max-width: 479px) 90vw, (max-width: 767px) 70vw, (max-width: 991px) 60vw, 32rem"
            className={styles.thumbnail}
          />
        </Link>
        <div className={styles.body}>
          {websiteUrl && <VisitSiteLink href={websiteUrl} className={styles.visit} />}
          <Heading className={styles.title}>{title}</Heading>
          {description && <p className={styles.description}>{description}</p>}
          <div className={styles.spacer} />
          <Button href={href} data-sound-hover="" data-sound-click="">
            View Project<span className="visually-hidden">: {title}</span>
          </Button>
          <div className={styles.tools}>
            {tools.map((tool) => {
              const icon = toolIcons[tool];
              if (!icon) return null;
              return <img key={tool} src={icon.src} alt={icon.alt} title={icon.alt} loading="lazy" />;
            })}
          </div>
        </div>
      </div>
    </article>
  );
}
