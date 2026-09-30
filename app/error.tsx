"use client";

import { useEffect } from "react";
import styles from "./not-found.module.css";

/*
 * Shown when a page throws at runtime (Next.js route-segment error boundary).
 * Reuses the 404 page layout; "Try again" re-renders the failed segment.
 */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.title}>Something went wrong</h1>
        <p>An unexpected error occurred. Please try again.</p>
        <button type="button" className={styles.retry} onClick={reset}>
          Try again
        </button>
      </div>
    </section>
  );
}
