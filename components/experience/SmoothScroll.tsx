"use client";

import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/motion";
import { setLenis } from "@/lib/scroll";

/*
 * Lenis smooth scrolling, same settings as the Webflow site (duration 2).
 * Driven by GSAP's ticker so ScrollTrigger animations stay in sync.
 * Disabled for visitors who prefer reduced motion.
 *
 * Also remembers the scroll position per page, so Back/Forward returns to
 * where the visitor was (Webflow got this from full page loads and the
 * browser's back-forward cache; client-side navigation needs it explicitly).
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const lenis = useRef<Lenis | null>(null);
  const currentPath = useRef(pathname);
  const positions = useRef(new Map<string, number>());
  const restorePending = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const instance = new Lenis({ duration: 2, anchors: true });
    lenis.current = instance;
    setLenis(instance);
    instance.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      lenis.current = null;
      setLenis(null);
    };
  }, []);

  // Save the position of the page being left: on internal link clicks (before
  // Next scrolls the new page to the top) and on Back/Forward.
  useEffect(() => {
    const save = () => positions.current.set(currentPath.current, window.scrollY);
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.('a[href^="/"]')) save();
    };
    const onPopState = () => {
      save();
      restorePending.current = true;
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  // After Back/Forward, scroll the restored page to its saved position once it has rendered.
  useEffect(() => {
    currentPath.current = pathname;
    if (!restorePending.current) return;
    restorePending.current = false;
    const y = positions.current.get(pathname) ?? 0;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        if (lenis.current) lenis.current.scrollTo(y, { immediate: true, force: true });
        else window.scrollTo(0, y);
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}
