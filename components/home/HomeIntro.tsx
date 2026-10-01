"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

// Keep in sync with the hero OrbSpeech `hideAfter` in app/page.tsx.
export const INTRO_DURATION_MS = 8500;
// Same key as the inline head script in app/layout.tsx.
const SEEN_KEY = "introSeen";

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
 * It plays once per tab (sessionStorage "introSeen"; a reload plays it again).
 * Once seen, html[data-intro-seen] hides the preloader and the intro bubble
 * (elements marked data-intro-once) for the rest of the visit. On a full page
 * load the inline head script in app/layout.tsx sets these flags before the
 * first paint (no flash).
 */
export function HomeIntro() {
  useEffect(() => {
    const root = document.documentElement;
    if (prefersReducedMotion() || "introSeen" in root.dataset) {
      delete root.dataset.intro;
      return;
    }
    root.dataset.intro = "playing";
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
    const startedAt = Date.now();
    const t = setTimeout(() => {
      delete root.dataset.intro;
      root.dataset.introSeen = "";
      // Content was display:none, so every ScrollTrigger created meanwhile
      // (Lottie scrub, word scrub) measured zero-size elements. Re-measure now.
      ScrollTrigger.refresh();
    }, INTRO_DURATION_MS);
    return () => {
      clearTimeout(t);
      delete root.dataset.intro;
      // Leaving mid-intro counts as seen. The guard skips React's dev-only
      // mount → unmount → mount check, which would otherwise cancel the intro.
      if (Date.now() - startedAt > 1000) root.dataset.introSeen = "";
    };
  }, []);
  return null;
}
