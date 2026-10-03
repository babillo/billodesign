import type { Project } from "@/lib/content";
import styles from "./ProjectResults.module.css";

/*
 * Phase 7 (V2): "Key results" strip under the case-study header, so the outcome
 * is visible before the long read. Same thin bordered strip as the bio stats
 * (Bio.module.css). Values come from the project's frontmatter `results`; with
 * none, nothing renders. Only real, owner-confirmed figures belong here.
 */
export function ProjectResults({ results }: { results: Project["results"] }) {
  if (!results?.length) return null;
  return (
    <section className={styles.wrap} aria-labelledby="key-results" data-reveal="load">
      <h2 id="key-results" className={styles.heading}>
        Key results
      </h2>
      <dl className={styles.stats} style={{ "--count": results.length } as React.CSSProperties}>
        {results.map((r) => (
          <div key={r.label} className={styles.stat}>
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
