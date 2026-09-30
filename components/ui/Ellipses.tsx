import styles from "./Ellipses.module.css";

/** The two soft glow blobs in the corners of cards (decorative). */
export function Ellipses({ variant = "service" }: { variant?: "service" | "project" | "modal" }) {
  return (
    <>
      <img src="/images/ellipse.avif" alt="" className={`${styles.ellipse} ${styles[`${variant}Top`]}`} loading="lazy" />
      <img src="/images/ellipse.avif" alt="" className={`${styles.ellipse} ${styles[`${variant}Bottom`]}`} loading="lazy" />
    </>
  );
}
