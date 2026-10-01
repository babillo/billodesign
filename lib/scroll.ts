import type Lenis from "lenis";

/*
 * Shared access to the page's Lenis instance (created by SmoothScroll), so
 * components can scroll smoothly without each creating their own. Falls back
 * to native smooth scrolling when Lenis is off (reduced motion).
 */
let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

/**
 * Smooth-scroll to `el`. Lenis (and native scrolling) honour the element's CSS
 * `scroll-margin-top`, which is how targets clear the fixed navbar. Content
 * above can still change height while scrolling, so once the scroll finishes
 * it re-aims until the element is in place (a few attempts at most).
 */
export function scrollToElement(el: Element, attempts = 4) {
  const drift = () => el.getBoundingClientRect().top - (Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0);
  if (lenis) {
    // Its cached scroll limit can lag behind a page that just grew.
    lenis.resize();
    lenis.scrollTo(el as HTMLElement, {
      onComplete: () => {
        if (attempts > 1 && Math.abs(drift()) > 4) scrollToElement(el, attempts - 1);
      },
    });
    return;
  }
  el.scrollIntoView();
}
