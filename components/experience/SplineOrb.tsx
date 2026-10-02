"use client";

import type { Application } from "@splinetool/runtime";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
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
 * see CLAUDE.md Phase 7 and docs/phase-7-baseline.md before changing how it loads.
 *
 * Phase 7 loading (docs/animations.md#spline-orb):
 * 1. Poster: a still render of the scene shows at once. The Spline camera
 *    scales the scene with the canvas height and centres it, so a wide image
 *    with object-fit: cover lines up with the live orb at every viewport.
 * 2. The runtime (~700 KB gzip) starts loading only after the page's `load`
 *    event and an idle moment, so it no longer competes with first paint,
 *    the case-study header or the first interactions.
 * 3. The live orb cross-fades over the poster and is paused while it can't be
 *    seen (an opaque section covers the viewport, or a modal dialog is open).
 */
export function SplineOrb({ variant = "home", children }: Props) {
  const [load, setLoad] = useState(false);
  const [ready, setReady] = useState(false);
  const app = useRef<Application | null>(null);

  useEffect(() => {
    let idle = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      if ("requestIdleCallback" in window) idle = requestIdleCallback(() => setLoad(true), { timeout: 3000 });
      else timer = setTimeout(() => setLoad(true), 500);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      if (idle) cancelIdleCallback(idle);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const orb = app.current;
      if (!orb) return;
      const hidden = !!document.querySelector("dialog[open]") || isCovered();
      if (hidden && !orb.isStopped) orb.stop();
      else if (!hidden && orb.isStopped) orb.play();
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const dialogs = new MutationObserver(schedule);
    dialogs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      dialogs.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
      app.current?.play();
    };
  }, [ready]);

  return (
    <div className={styles.wrapper} data-intro-keep="">
      <div className={styles.inner}>
        <div className={`${styles.orb} ${variant === "project" ? styles.project : ""}`} aria-hidden="true">
          <img src="/images/orb-poster.webp" alt="" width={2880} height={1200} className={styles.poster} decoding="async" />
          {load && (
            <div className={`${styles.live} ${ready ? styles.ready : ""}`}>
              <OrbErrorBoundary>
                <Spline
                  scene={SPLINE_SCENE_URL}
                  onLoad={(spline) => {
                    app.current = spline;
                    setReady(true);
                  }}
                />
              </OrbErrorBoundary>
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

/*
 * Sections marked data-orb-cover have a solid background. When one fills the
 * whole viewport the orb behind it can't be seen, so it needn't render. The
 * background is read live because some sections are only opaque on smaller
 * screens.
 */
function isCovered() {
  const vh = window.innerHeight;
  for (const el of document.querySelectorAll<HTMLElement>("[data-orb-cover]")) {
    const { top, bottom } = el.getBoundingClientRect();
    if (top <= 0 && bottom >= vh && getComputedStyle(el).backgroundColor === "rgb(0, 0, 0)") return true;
  }
  return false;
}
