import { site } from "@/lib/site";
import styles from "./AwwwardsBadge.module.css";

/** Awwwards nominee ribbon pinned to the right edge (original Webflow embed). */
export function AwwwardsBadge() {
  return (
    <a href={site.awwwardsUrl} target="_blank" rel="noopener noreferrer" className={styles.badge} aria-label="Awwwards nominee (opens in a new tab)">
      <img src="/icons/awwwards-badge.svg" alt="" width={53} height={171} />
    </a>
  );
}
