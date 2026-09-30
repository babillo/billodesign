import styles from "./Ellipses.module.css";

/** The two soft glow blobs in the corners of cards (decorative). */
export function Ellipses({ variant = "service" }: { variant?: "service" | "project" | "modal" }) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny decorative AVIF, no optimization needed */}
      <img src="/images/ellipse.avif" alt="" className={`${styles.ellipse} ${styles[`${variant}Top`]}`} loading="lazy" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/ellipse.avif" alt="" className={`${styles.ellipse} ${styles[`${variant}Bottom`]}`} loading="lazy" />
    </>
  );
}
