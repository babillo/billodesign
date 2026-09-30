import { socialLinks } from "@/lib/site";
import styles from "./SocialLinks.module.css";

export function SocialLinks() {
  return (
    <ul className={styles.list}>
      {socialLinks.map((s) => (
        <li key={s.label}>
          <a href={s.href} target="_blank" rel="noopener noreferrer" className={styles.link} aria-label={`${s.label} (opens in a new tab)`}>
            <img src={s.icon} alt="" className={styles.icon} />
          </a>
        </li>
      ))}
    </ul>
  );
}
