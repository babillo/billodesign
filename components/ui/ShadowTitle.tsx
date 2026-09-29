import styles from "./ShadowTitle.module.css";

/** Huge faint background word behind a section ("Services", "Portfolio"). Decorative. */
export function ShadowTitle({ children }: { children: string }) {
  return (
    <div className={styles.shadow} aria-hidden="true">
      {children}
    </div>
  );
}
