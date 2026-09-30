/** True when the visitor asked the OS/browser to minimize animation. Client-side only. */
export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
