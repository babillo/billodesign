"use client";

import { useEffect, useRef, useState } from "react";
import { performanceStats as stats } from "@/lib/site";
import { prefersReducedMotion } from "@/lib/motion";
import styles from "./WeGotYou.module.css";

const DURATION_MS = 1600;
const RING_R = 30;
const RING_C = 2 * Math.PI * RING_R;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/*
 * Phase 6: the dashboard figures as real text in thin glass cards, counting up
 * once when scrolled into view. Server and no-JS render the final values;
 * screen readers get the final values too (the animated digits are aria-hidden).
 */
export function PerformanceStats() {
  const ref = useRef<HTMLDivElement>(null);
  const [p, setP] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    // Always start from zero and count when the cards become visible. (An
    // "already on screen?" check misfired during the homepage intro, when the
    // content is display:none and every element reports top = 0.)
    let frame = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION_MS);
          setP(easeOut(t));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    frame = requestAnimationFrame(() => setP(0));
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={styles.stats}>
      <div className={styles.stat}>
        <span className={styles.label}>Uptime</span>
        <span className={styles.number} aria-hidden="true">
          {(stats.uptime * p).toFixed(2)}
          <small>%</small>
        </span>
        <span className="visually-hidden">{stats.uptime}%</span>
        <span className={styles.bars} aria-hidden="true">
          {Array.from({ length: 28 }, (_, i) => (
            <i key={i} style={{ height: `${(55 + 40 * Math.abs(Math.sin(i * 1.7))) * p}%` }} />
          ))}
        </span>
      </div>

      <div className={`${styles.stat} ${styles.wide}`}>
        <span className={styles.label}>Google Lighthouse</span>
        <div className={styles.rings}>
          {stats.lighthouse.map((s) => (
            <div key={s.label} className={styles.ring}>
              <div className={styles.ringGraphic} aria-hidden="true">
                <svg viewBox="0 0 72 72">
                  <circle cx="36" cy="36" r={RING_R} className={styles.ringTrack} />
                  <circle
                    cx="36"
                    cy="36"
                    r={RING_R}
                    className={styles.ringValue}
                    strokeDasharray={RING_C}
                    strokeDashoffset={RING_C * (1 - (s.value * p) / 100)}
                  />
                </svg>
                <b>{Math.round(s.value * p)}</b>
              </div>
              <span className={styles.ringLabel}>
                {s.label}
                <span className="visually-hidden">: {s.value} out of 100</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.stat}>
        <span className={styles.label}>Response time</span>
        <span className={styles.number} aria-hidden="true">
          {Math.round(stats.responseMs / Math.max(p, 0.35))}
          <small> ms</small>
        </span>
        <span className="visually-hidden">{stats.responseMs} milliseconds</span>
        <span className={styles.sub}>globally</span>
      </div>
    </div>
  );
}
