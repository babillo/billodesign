"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
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
 *
 * On a full page load the inline head script in app/layout.tsx has already set
 * data-intro before the first paint (no flash); this component also covers
 * client-side navigation back to the homepage.
 */
export function HomeIntro() {
  useEffect(() => {
    const root = document.documentElement;
    if (prefersReducedMotion()) {
      delete root.dataset.intro;
      return;
    }
    root.dataset.intro = "playing";
    const t = setTimeout(() => {
      delete root.dataset.intro;
      // Content was display:none, so every ScrollTrigger created meanwhile
      // (Lottie scrub, word scrub) measured zero-size elements. Re-measure now.
      ScrollTrigger.refresh();
    }, INTRO_DURATION_MS);
    return () => {
      clearTimeout(t);
      delete root.dataset.intro;
    };
  }, []);
  return null;
}
