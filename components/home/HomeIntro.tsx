"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion";

// Keep in sync with the hero OrbSpeech `hideAfter` in app/page.tsx.
export const INTRO_DURATION_MS = 8500;

/*
 * Homepage intro, reproduced from the live Webflow site: after the preloader
 * the page content stays hidden and only the orb and its speech bubble are
 * visible ("Hey there... Welcome to BilloDesign 👋" → "Scroll down and I'll
 * guide you."). When the bubble fades out, the page appears.
 *
 * Webflow did this with IX2 ("Preloader" hid .main-wrapper, "hide orb text tip
 * delay hero" showed it again). Content stays in the HTML for SEO and no-JS
 * visitors; the intro is skipped with prefers-reduced-motion.
 */
export function HomeIntro() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const root = document.documentElement;
    root.dataset.intro = "playing";
    const t = setTimeout(() => delete root.dataset.intro, INTRO_DURATION_MS);
    return () => {
      clearTimeout(t);
      delete root.dataset.intro;
    };
  }, []);
  return null;
}
