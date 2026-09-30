"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";

/*
 * Page-level scroll effects, driven by data attributes so the markup stays in
 * server components (the same pattern as the Webflow attribute script).
 *
 *   data-reveal            fade + 10px slide up when scrolled into view
 *                          (Webflow IX2 "subtle slide from bottom")
 *   data-reveal="delay"    same, 0.5s later
 *   data-text="letters-fade-in"  letters fade in one by one (GSAP + SplitText)
 *   data-text="scrub-words"      words brighten from 40% opacity while scrolling
 *
 * The original script also defined words-slide-up, words-rotate-in,
 * words-slide-from-right and letters-slide-up, but no element used them.
 */
export function ScrollEffects() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0 },
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    const ctx = gsap.context(() => {
      document.querySelectorAll<HTMLElement>('[data-text="letters-fade-in"]').forEach((el) => {
        const split = SplitText.create(el, { type: "words,chars" });
        const tl = gsap.timeline({ paused: true });
        tl.from(split.chars, { opacity: 0, duration: 0.2, ease: "power1.out", stagger: { amount: 2 } });
        // Play at 60% of the viewport; reset once the element is fully below the fold again.
        ScrollTrigger.create({ trigger: el, start: "top 60%", onEnter: () => tl.play() });
        ScrollTrigger.create({ trigger: el, start: "top bottom", onLeaveBack: () => tl.progress(0).pause() });
      });

      document.querySelectorAll<HTMLElement>('[data-text="scrub-words"]').forEach((el) => {
        const split = SplitText.create(el, { type: "words" });
        gsap.from(split.words, {
          opacity: 0.4,
          duration: 0.2,
          stagger: 0.4,
          scrollTrigger: { trigger: el, start: "top 90%", end: "top center", scrub: true },
        });
      });
    });

    ScrollTrigger.refresh();
    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, [pathname]);

  return null;
}
