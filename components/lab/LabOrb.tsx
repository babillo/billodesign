"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { SplineOrb } from "@/components/experience/SplineOrb";
import styles from "@/components/experience/SplineOrb.module.css";
import type { OrbStats } from "./ThreeOrb";

const ThreeOrb = dynamic(() => import("./ThreeOrb").then((m) => m.ThreeOrb), { ssr: false });

type Props = { engine: "spline" | "three"; variant: "home" | "project"; shadows: boolean; freezeAt?: number };

/*
 * Same fixed orb layer as the live site (SplineOrb.module.css), so screenshots
 * of the two engines line up. Tall spacer so the scroll behaviour can be tried.
 */
export function LabOrb({ engine, variant, shadows, freezeAt }: Props) {
  const [stats, setStats] = useState<OrbStats | null>(null);
  const onStats = useCallback((s: OrbStats) => setStats(s), []);

  return (
    <>
      {engine === "spline" ? (
        <SplineOrb variant={variant} />
      ) : (
        <div className={styles.wrapper}>
          <div className={styles.inner}>
            <div className={`${styles.orb} ${variant === "project" ? styles.project : ""}`} aria-hidden="true">
              <ThreeOrb shadows={shadows} freezeAt={freezeAt} onStats={onStats} />
            </div>
          </div>
        </div>
      )}
      <div style={{ minHeight: "300vh" }} data-lab-engine={engine}>
        {stats && (
          <pre data-lab-stats="" style={{ position: "fixed", left: 16, bottom: 96, margin: 0, font: "12px/1.4 monospace", color: "#7fdfff", opacity: 0.8 }}>
            {JSON.stringify(stats, null, 1)}
          </pre>
        )}
      </div>
    </>
  );
}
