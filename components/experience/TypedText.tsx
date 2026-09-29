"use client";

import { useEffect, useState } from "react";
import styles from "./TypedText.module.css";

type Props = {
  lines: readonly string[];
  /** ms per character (Typed.js `typeSpeed`). */
  typeSpeed?: number;
  /** ms to wait before deleting a finished line (Typed.js `backDelay`, default 700). */
  backDelay?: number;
  loop?: boolean;
  className?: string;
};

/*
 * Replaces the four Typed.js instances from the Webflow site with the same
 * behaviour: type a line, pause, delete it, type the next; optionally loop.
 * Typed.js deletes instantly by default (backSpeed 0), so this does too.
 * With reduced motion the first line is shown statically.
 */
export function TypedText({ lines, typeSpeed = 40, backDelay = 700, loop = false, className }: Props) {
  const [text, setText] = useState(lines[0]);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let lineIndex = 0;
    let charIndex = 0;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const line = lines[lineIndex];
      if (charIndex <= line.length) {
        setText(line.slice(0, charIndex));
        charIndex++;
        timer = setTimeout(tick, typeSpeed);
        return;
      }
      const isLast = lineIndex === lines.length - 1;
      if (isLast && !loop) return;
      timer = setTimeout(() => {
        lineIndex = isLast ? 0 : lineIndex + 1;
        charIndex = 0;
        tick();
      }, backDelay);
    };
    timer = setTimeout(() => {
      setAnimating(true);
      tick();
    }, 0);
    return () => clearTimeout(timer);
  }, [lines, typeSpeed, backDelay, loop]);

  return (
    <span className={className}>
      {/* Screen readers get the full message once rather than every keystroke. */}
      <span className="visually-hidden">{lines.join(" ")}</span>
      <span aria-hidden="true">
        {text}
        {animating && <span className={styles.cursor}>|</span>}
      </span>
    </span>
  );
}
