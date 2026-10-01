"use client";

import { useEffect, useRef, useState } from "react";
import { useContactModal } from "@/components/experience/ContactModalProvider";
import { OrbSpeech } from "@/components/experience/OrbSpeech";
import { orbLines } from "@/lib/site";
import styles from "./Cta.module.css";

export const CTA_BUTTON_ID = "cta-button";

type Tip = "none" | "footer" | "button";

/*
 * Orb speech bubbles around the CTA button (Webflow IX2):
 * - the "waiting" bubble shows once its spot under the social links is fully
 *   on screen. Webflow triggered it at the page end, which was the same place
 *   when the footer was one line; with the Phase 6 footer the page end is
 *   further down and on phones the bubble had already scrolled off-screen.
 * - hovering the CTA button swaps it for the "press it NOW" bubble
 * - opening the contact modal hides both
 */
export function CtaOrbTips() {
  const [tip, setTip] = useState<Tip>("none");
  const { isOpen } = useContactModal();
  const [wasOpen, setWasOpen] = useState(isOpen);
  const anchor = useRef<HTMLDivElement>(null);

  // Opening the modal hides both bubbles (React's "adjust state on prop change" pattern).
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setTip("none");
  }

  useEffect(() => {
    const button = document.getElementById(CTA_BUTTON_ID);
    const io = new IntersectionObserver(
      ([entry]) => {
        setTip((t) => (entry.isIntersecting ? (t === "button" ? t : "footer") : t === "footer" ? "none" : t));
      },
      { threshold: 1 },
    );
    if (anchor.current) io.observe(anchor.current);
    const onEnter = () => setTip("button");
    const onLeave = () => setTip("footer");
    button?.addEventListener("pointerenter", onEnter);
    button?.addEventListener("pointerleave", onLeave);
    return () => {
      io.disconnect();
      button?.removeEventListener("pointerenter", onEnter);
      button?.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      {/* Invisible box where the "waiting" bubble appears; it triggers the bubble. */}
      <div ref={anchor} className={styles.tipAnchor} aria-hidden="true" />
      <OrbSpeech lines={orbLines.cta} loop backDelay={3000} visible={tip === "footer"} className={styles.tip} />
      <OrbSpeech lines={orbLines.ctaButton} loop backDelay={2000} visible={tip === "button"} className={`${styles.tip} ${styles.tipButton}`} />
    </>
  );
}
