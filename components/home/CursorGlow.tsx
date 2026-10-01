"use client";

import { useEffect } from "react";

/*
 * Phase 6: a soft cyan light that follows the pointer inside elements marked
 * data-glow (the service cards). Only writes two CSS variables per move; the
 * glow itself is CSS (Services.module.css). Skipped on touch screens.
 */
export function CursorGlow() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover)").matches) return;
    const onMove = (e: PointerEvent) => {
      const el = (e.target as Element).closest?.<HTMLElement>("[data-glow]");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--glow-x", `${e.clientX - r.left}px`);
      el.style.setProperty("--glow-y", `${e.clientY - r.top}px`);
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
  return null;
}
