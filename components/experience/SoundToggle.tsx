"use client";

import { useSound } from "./SoundProvider";
import styles from "./SoundToggle.module.css";

/** Bottom-left speaker button. Icons cross-fade like the Webflow "[Tap]sound-button" interaction. */
export function SoundToggle() {
  const { enabled, toggle } = useSound();
  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.button} onClick={toggle} aria-pressed={enabled} aria-label="Sound">
        <img src="/images/sound-off.svg" alt="" className={styles.icon} />
        <img src="/images/sound-on.svg" alt="" className={`${styles.icon} ${styles.on} ${enabled ? styles.visible : ""}`} />
      </button>
    </div>
  );
}
