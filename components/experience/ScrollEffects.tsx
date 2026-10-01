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
 *   data-text="decode"           (Phase 6) scrambles through random glyphs and
 *                                resolves left to right, every time it scrolls
 *                                into view (section labels and titles)
 *
 * The original script also defined words-slide-up, words-rotate-in,
 * words-slide-from-right and letters-slide-up, but no element used them.
 */
/*
 * SplitText gives each word/char `position: relative`. Positioned descendants
 * drop out of their heading's `background-clip: text` gradient and render
 * transparent (the "We got your back" subtitle vanished behind the dashboard
 * image). Webflow's splitter left them static, so do the same.
 */
function keepGradientText(...groups: Element[][]) {
  for (const els of groups) gsap.set(els, { position: "static" });
}

const DECODE_GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/?$@";
const DECODE_MS = 650;

/*
 * Phase 6: "decoding" text, like the orb decoding a message. The real text is
 * exposed as aria-label so screen readers never hear the scramble. Returns a
 * cleanup that stops it and restores the text.
 */
function decode(el: HTMLElement) {
  // The real text lives in aria-label (set on first run), so a replay that
  // starts mid-scramble still resolves to the right words.
  const text = el.getAttribute("aria-label") ?? el.textContent ?? "";
  el.setAttribute("aria-label", text);
  let frame = 0;
  const start = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / DECODE_MS);
    const resolved = Math.floor(p * text.length);
    let out = "";
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      out += i < resolved || c === " " ? c : DECODE_GLYPHS[(Math.random() * DECODE_GLYPHS.length) | 0];
    }
    el.textContent = out;
    if (p < 1) frame = requestAnimationFrame(tick);
    else el.textContent = text;
  };
  frame = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(frame);
    el.textContent = text;
  };
}

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

    // Replays on every entry into view (owner request); a running decode is
    // stopped first so a quick in/out/in never stacks two animations.
    const decoding = new Map<Element, () => void>();
    const decodeIo = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          decoding.get(entry.target)?.();
          decoding.set(entry.target, decode(entry.target as HTMLElement));
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    document.querySelectorAll('[data-text="decode"]').forEach((el) => decodeIo.observe(el));

    const ctx = gsap.context(() => {
      document.querySelectorAll<HTMLElement>('[data-text="letters-fade-in"]').forEach((el) => {
        const split = SplitText.create(el, { type: "words,chars" });
        keepGradientText(split.words, split.chars);
        const tl = gsap.timeline({ paused: true });
        tl.from(split.chars, { opacity: 0, duration: 0.2, ease: "power1.out", stagger: { amount: 2 } });
        // Play at 60% of the viewport; reset once the element is fully below the fold again.
        ScrollTrigger.create({ trigger: el, start: "top 60%", onEnter: () => tl.play() });
        ScrollTrigger.create({ trigger: el, start: "top bottom", onLeaveBack: () => tl.progress(0).pause() });
      });

      document.querySelectorAll<HTMLElement>('[data-text="scrub-words"]').forEach((el) => {
        const split = SplitText.create(el, { type: "words" });
        keepGradientText(split.words);
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
      decodeIo.disconnect();
      decoding.forEach((restore) => restore());
    };
  }, [pathname]);

  return null;
}
