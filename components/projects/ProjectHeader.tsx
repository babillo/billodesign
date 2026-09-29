import Image from "next/image";
import type { Project } from "@/lib/content";
import { VisitSiteLink } from "./VisitSiteLink";
import styles from "./ProjectHeader.module.css";

const META_ROWS: { key: keyof Project["meta"]; label: string }[] = [
  { key: "role", label: "Role" },
  { key: "timeline", label: "Timeline" },
  { key: "tools", label: "Tools" },
  { key: "client", label: "Client" },
  { key: "industry", label: "Industry" },
  { key: "market", label: "Market" },
];

/** Project title, hero media (Wistia video or thumbnail), live link and meta list. */
export function ProjectHeader({ project }: { project: Project }) {
  return (
    <div className="padding-global">
      <div className="container-large">
        <div className="padding-section-large">
          <div className={styles.wrapper}>
            <div className={styles.spacer} />
            <h1 data-reveal="">{project.title}</h1>

            {project.video ? (
              <div className={styles.video} style={{ paddingTop: `${100 / project.video.aspect}%` }}>
                <iframe
                  src={`https://fast.wistia.net/embed/iframe/${project.video.wistiaId}`}
                  title={`${project.title} — project video`}
                  allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            ) : (
              <Image
                src={project.thumbnail}
                alt=""
                width={project.thumbnailSize.width}
                height={project.thumbnailSize.height}
                sizes="(max-width: 800px) 100vw, 800px"
                priority
                data-reveal="delay"
                className={styles.thumbnail}
              />
            )}

            {project.websiteUrl && <VisitSiteLink href={project.websiteUrl} className={styles.visit} />}

            <dl className={styles.meta}>
              {META_ROWS.map(({ key, label }) => {
                const value = project.meta[key];
                if (!value) return null;
                return (
                  <div key={key} className={styles.row} data-reveal="">
                    <dt className={styles.label}>
                      <span>{label}</span>
                      <span aria-hidden="true">:</span>
                    </dt>
                    <dd className={styles.value}>{value}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
