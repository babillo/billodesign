"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { OrbErrorBoundary } from "./OrbErrorBoundary";
import styles from "./SplineOrb.module.css";

// The Spline runtime is large, so it is never part of the initial bundle.
const Spline = dynamic(() => import("@splinetool/react-spline"), { ssr: false });

export const SPLINE_SCENE_URL = "https://prod.spline.design/mFnZxSV0j4KZp6WS/scene.splinecode";

type Props = {
  /** Home places the orb right of the hero copy; project pages push it further right. */
  variant?: "home" | "project";
  children?: React.ReactNode;
};

/*
 * The interactive 3D orb: a fixed, full-viewport layer behind the page content
 * (z-index -2, as in Webflow). A core part of the Billodesign experience —
 * see CLAUDE.md Phase 7 before changing how it loads.
 */
export function SplineOrb({ variant = "home", children }: Props) {
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);

  // Start loading once the browser is idle so it doesn't compete with first paint.
  useEffect(() => {
    const start = () => setLoad(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(start, 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.wrapper} data-intro-keep="">
      <div className={styles.inner}>
        <div className={`${styles.orb} ${variant === "project" ? styles.project : ""} ${ready ? styles.ready : ""}`} aria-hidden="true">
          {load && (
            <OrbErrorBoundary>
              <Spline scene={SPLINE_SCENE_URL} onLoad={() => setReady(true)} />
            </OrbErrorBoundary>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
