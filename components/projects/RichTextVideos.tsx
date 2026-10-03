"use client";

import { useEffect } from "react";

/*
 * Phase 7 (P2): the case-study GIF became a looping video (`<Figure>` with a .gif path, CaseStudyMdx.tsx).
 * A GIF only downloaded when lazy-loading reached it and always animated; this
 * keeps that: the video loads and plays when it scrolls into view and pauses
 * off-screen. With reduced motion it stays on its poster frame with controls.
 */
export function RichTextVideos() {
  useEffect(() => {
    const videos = [...document.querySelectorAll<HTMLVideoElement>("main .rich-text video[data-autoplay-visible]")];
    if (!videos.length) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      videos.forEach((v) => (v.controls = true));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          const video = target as HTMLVideoElement;
          if (isIntersecting) video.play().catch(() => {});
          else video.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    videos.forEach((v) => observer.observe(v));
    return () => observer.disconnect();
  }, []);

  return null;
}
