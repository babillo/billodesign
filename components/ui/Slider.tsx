"use client";

import { useRef, useState } from "react";
import styles from "./Slider.module.css";

type Props = {
  label: string;
  slides: React.ReactNode[];
  /** Class controlling the visible mask width (projects vs testimonials). */
  maskClassName?: string;
};

/*
 * Replaces the Webflow slider (data-infinite="true", 500ms ease). Slides are
 * laid out in a row; the mask is narrower than the section and overflow is
 * visible, so the next slides peek in from the right.
 *
 * Infinite looping: each slide is translated to its offset from the current
 * index. The slide that wraps from one end to the other jumps without a
 * transition so it never flies across the screen.
 */
export function Slider({ label, slides, maskClassName }: Props) {
  const count = slides.length;
  const [{ index, prev }, setPosition] = useState({ index: 0, prev: 0 });
  const dragStart = useRef<number | null>(null);

  const go = (next: number) => setPosition({ index: ((next % count) + count) % count, prev: index });

  // Position of slide i relative to the current one: 0 = current, -1 = previous (off to the left).
  const offsetOf = (i: number, current: number) => {
    const o = (i - current + count) % count;
    return count > 2 && o === count - 1 ? -1 : o;
  };
  const offsets = slides.map((_, i) => offsetOf(i, index));
  const jumps = slides.map((_, i) => Math.abs(offsetOf(i, prev) - offsets[i]) > 1);

  return (
    <div
      className={styles.slider}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onPointerDown={(e) => (dragStart.current = e.clientX)}
      onPointerUp={(e) => {
        if (dragStart.current === null) return;
        const dx = e.clientX - dragStart.current;
        dragStart.current = null;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
    >
      <div className={`${styles.mask} ${maskClassName ?? ""}`}>
        {slides.map((slide, i) => (
          <div
            key={i}
            className={styles.slide}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            style={{
              transform: `translateX(calc(${offsets[i] - i} * (100% + var(--slide-gap))))`,
              transition: jumps[i] ? "none" : undefined,
            }}
          >
            {slide}
          </div>
        ))}
      </div>

      <button type="button" className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => go(index - 1)} aria-label="Previous slide" data-sound-click="">
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M3.31066 8.75001L9.03033 14.4697L7.96967 15.5303L0.439339 8.00001L7.96967 0.469676L9.03033 1.53034L3.31066 7.25001L15.5 7.25L15.5 8.75L3.31066 8.75001Z" fill="currentColor" />
        </svg>
      </button>
      <button type="button" className={styles.arrow} onClick={() => go(index + 1)} aria-label="Next slide" data-sound-click="">
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M12.6893 7.25L6.96967 1.53033L8.03033 0.469666L15.5607 8L8.03033 15.5303L6.96967 14.4697L12.6893 8.75H0.5V7.25H12.6893Z" fill="currentColor" />
        </svg>
      </button>

      <div className={styles.nav}>
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
            onClick={() => go(i)}
            aria-label={`Show slide ${i + 1} of ${count}`}
            aria-current={i === index}
          />
        ))}
      </div>
    </div>
  );
}
