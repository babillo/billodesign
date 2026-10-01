import Image from "next/image";
import Link from "next/link";
import type { ImageSize } from "@/lib/content";
import { toolIcons } from "@/lib/site";
import styles from "./ProjectTile.module.css";

type Props = {
  slug: string;
  title: string;
  tag: string;
  image: string;
  imageAlt: string;
  imageSize: ImageSize;
  websiteUrl: string | null;
  tools: string[];
  /** Above-the-fold images load eagerly. */
  priority?: boolean;
};

/*
 * Homepage project grid card (Phase 6, replaces the Webflow slider card).
 * Image-led: screenshot, title, one-line tag, tool icons. The title link is
 * stretched over the whole card (::after), so the card is one click target
 * without nesting the separate "Visit site" link inside another link.
 */
export function ProjectTile({ slug, title, tag, image, imageAlt, imageSize, websiteUrl, tools, priority }: Props) {
  return (
    <article className={styles.tile} data-reveal="">
      <div className={styles.media}>
        <Image
          src={image}
          alt={imageAlt}
          width={imageSize.width}
          height={imageSize.height}
          sizes="(max-width: 767px) 92vw, 46vw"
          className={styles.image}
          priority={priority}
        />
        <span className={styles.cta} aria-hidden="true">
          View case study →
        </span>
      </div>
      <div className={styles.header}>
        <h4 className={styles.title}>
          <Link href={`/projects/${slug}`} className={styles.link} data-sound-hover="" data-sound-click="">
            {title}
          </Link>
        </h4>
        {websiteUrl && (
          <a href={websiteUrl} target="_blank" rel="noopener noreferrer" className={styles.visit}>
            Visit site <span aria-hidden="true">↗</span>
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        )}
      </div>
      <p className={styles.tag}>{tag}</p>
      <div className={styles.tools}>
        {tools.map((tool) => {
          const icon = toolIcons[tool];
          return icon ? <img key={tool} src={icon.src} alt={icon.alt} title={icon.alt} loading="lazy" width={26} height={26} /> : null;
        })}
      </div>
    </article>
  );
}
