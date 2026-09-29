import styles from "./VisitSiteLink.module.css";

/** Cyan "Visit Site ↗" link to the live client project (Webflow `.visit_roject-link`). */
export function VisitSiteLink({ href, className }: { href: string; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${styles.link} ${className ?? ""}`}>
      <span>Visit Site</span>
      <svg className={styles.arrow} viewBox="0 0 18 19" fill="none" aria-hidden="true">
        <path
          d="M0.202737 14.6906L14.412 5.4243L3.76911 2.41348L3.88421 0.916792L17.0611 4.64448L15.1588 18.2057L13.7428 17.7076L15.2793 6.75422L1.07001 16.0205L0.202737 14.6906Z"
          fill="currentColor"
        />
      </svg>
      <span className="visually-hidden"> (opens in a new tab)</span>
    </a>
  );
}
