"use client";

import { useEffect, useRef, useState } from "react";
import { useSound } from "./SoundProvider";
import { TypedText } from "./TypedText";
import styles from "./OrbSpeech.module.css";

type Props = {
  lines: readonly string[];
  typeSpeed?: number;
  backDelay?: number;
  loop?: boolean;
  /** Fade out after this many ms (hero bubble: 8500, from the Webflow interaction). */
  hideAfter?: number;
  /** Controlled visibility (CTA bubbles are toggled by scroll/hover). */
  visible?: boolean;
  variant?: "bubble" | "modal";
  className?: string;
};

/*
 * Speech bubble next to the orb, typing a message. While a bubble is on screen
 * the typing loop sound plays (original: IntersectionObserver on #orbTyping*).
 */
export function OrbSpeech({
  lines,
  typeSpeed,
  backDelay,
  loop,
  hideAfter,
  visible = true,
  variant = "bubble",
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [expired, setExpired] = useState(false);
  const { play, stop } = useSound();
  const shown = visible && !expired;

  useEffect(() => {
    if (!hideAfter) return;
    const t = setTimeout(() => setExpired(true), hideAfter);
    return () => clearTimeout(t);
  }, [hideAfter]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !shown) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) play("typing");
      else stop("typing");
    });
    io.observe(el);
    return () => {
      io.disconnect();
      stop("typing");
    };
  }, [shown, play, stop]);

  return (
    <div
      ref={ref}
      className={`${variant === "modal" ? styles.modal : styles.bubble} ${shown ? styles.shown : styles.hidden} ${className ?? ""}`}
      aria-hidden={!shown}
    >
      <p className={`${styles.text} ${variant === "modal" ? styles.textRight : ""}`}>
        <TypedText lines={lines} typeSpeed={typeSpeed} backDelay={backDelay} loop={loop} />
      </p>
    </div>
  );
}
