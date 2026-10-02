import styles from "./Preloader.module.css";

/*
 * Homepage intro ("W e l c o m e" + progress bar + curtains), rebuilt from
 * the Webflow IX2 "Preloader" timeline as pure CSS keyframes (~3.2s total).
 * No JavaScript: it shows before hydration and removes itself via
 * animation-fill-mode. Skipped entirely with prefers-reduced-motion.
 */
export function Preloader() {
  return (
    <div className={styles.preloader} aria-hidden="true" data-intro-keep="" data-intro-once="">
      <div className={styles.curtains}>
        <div className={`${styles.curtain} ${styles.left1}`} />
        <div className={`${styles.curtain} ${styles.left2}`} />
        <div className={`${styles.curtain} ${styles.right1}`} />
        <div className={`${styles.curtain} ${styles.right2}`} />
      </div>
      <div className={styles.content}>
        <div className={styles.title}>
          <img src="/images/preloader-orb.webp" alt="" width={364} height={290} className={styles.orb} />
          <div className={styles.welcome}>
            <img src="/images/preloader-icon.avif" alt="" width={32} height={32} className={styles.icon} />
            <div className={styles.text}>W e l c o m e</div>
          </div>
        </div>
        <div className={styles.bar}>
          <div className={styles.bar1}>
            <div className={styles.bar2} />
          </div>
        </div>
      </div>
    </div>
  );
}
