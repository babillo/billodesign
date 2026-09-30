"use client";

import { useEffect, useState } from "react";
import { useContactModal } from "@/components/experience/ContactModalProvider";
import { OrbSpeech } from "@/components/experience/OrbSpeech";
import { orbLines } from "@/lib/site";
import styles from "./Cta.module.css";

export const PAGE_END_ID = "page-end";
export const CTA_BUTTON_ID = "cta-button";

type Tip = "none" | "footer" | "button";

/*
 * Orb speech bubbles around the CTA button (Webflow IX2):
 * - reaching the page end (#page-end in the footer) shows the "waiting" bubble
 * - hovering the CTA button swaps it for the "press it NOW" bubble
 * - opening the contact modal hides both
 */
export function CtaOrbTips() {
  const [tip, setTip] = useState<Tip>("none");
  const { isOpen } = useContactModal();
  const [wasOpen, setWasOpen] = useState(isOpen);

  // Opening the modal hides both bubbles (React's "adjust state on prop change" pattern).
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setTip("none");
  }

  useEffect(() => {
    const end = document.getElementById(PAGE_END_ID);
    const button = document.getElementById(CTA_BUTTON_ID);
    const io = new IntersectionObserver(([entry]) => {
      setTip((t) => (entry.isIntersecting ? (t === "button" ? t : "footer") : t === "footer" ? "none" : t));
    });
    if (end) io.observe(end);
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
      <OrbSpeech lines={orbLines.cta} loop backDelay={3000} visible={tip === "footer"} className={styles.tip} />
      <OrbSpeech lines={orbLines.ctaButton} loop backDelay={2000} visible={tip === "button"} className={`${styles.tip} ${styles.tipButton}`} />
    </>
  );
}
