"use client";

import type { AnimationItem } from "lottie-web";
import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import styles from "./TechStack.module.css";

/*
 * Tech-stack Lottie scrubbed by scroll position (Webflow IX2 "tech stack
 * Scroll Animation", SCROLLING_IN_VIEW). While the element travels through the
 * viewport the animation goes 40% → 100% (at 48% scroll), holds until 52%,
 * then returns to 40%.
 */
function scrollToProgress(p: number) {
  if (p <= 0.48) return 0.4 + (p / 0.48) * 0.6;
  if (p <= 0.52) return 1;
  return 1 - ((p - 0.52) / 0.48) * 0.6;
}

export function TechStackLottie() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    let anim: AnimationItem | undefined;
    let trigger: ScrollTrigger | undefined;

    const load = async () => {
      // SVG-only player build: smaller than the full lottie-web bundle.
      const { default: lottie } = await import("lottie-web/build/player/lottie_svg");
      if (cancelled) return;
      const item = lottie.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: false, path: "/lottie/tech-stack.json" });
      anim = item;
      const frameAt = (p: number) => scrollToProgress(p) * (item.totalFrames - 1);

      item.addEventListener("DOMLoaded", () => {
        if (cancelled) return;
        if (prefersReducedMotion()) {
          item.goToAndStop(item.totalFrames - 1, true);
          return;
        }
        trigger = ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => item.goToAndStop(frameAt(self.progress), true),
        });
        item.goToAndStop(frameAt(trigger.progress), true);
      });
    };

    // Phase 7 (P7): the player (~65 KB gzip) and animation data load when the
    // section is about a screen away, not with the page.
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        void load();
      },
      { rootMargin: "100% 0px" },
    );
    near.observe(el);

    return () => {
      cancelled = true;
      near.disconnect();
      trigger?.kill();
      anim?.destroy();
    };
  }, []);

  return <div ref={ref} className={styles.lottie} role="img" aria-label="Animated logos of the tools I use" />;
}
