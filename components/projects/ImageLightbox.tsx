"use client";

import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "@/components/ui/CloseIcon";
import { useModalDialog } from "@/components/experience/useModalDialog";
import styles from "./ImageLightbox.module.css";

type Item = { src: string; alt: string; caption: string };

const SELECTOR = "main .rich-text figure img";
const SWIPE_PX = 50;

/*
 * Phase 6 (#5): click or tap a case-study screenshot to see it full-screen.
 * The rich text is server-rendered HTML, so this enhances the existing <img>
 * elements in place (keyboard-focusable, labelled) instead of re-rendering
 * them. Native <dialog>: focus trap, Escape and an inert page come for free.
 * Arrow keys and swipes move between the page's images.
 */
export function ImageLightbox() {
  const [items, setItems] = useState<Item[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const dialogRef = useModalDialog(index !== null);
  const opener = useRef<HTMLElement | null>(null);
  const swipeStart = useRef<number | null>(null);

  useEffect(() => {
    const imgs = [...document.querySelectorAll<HTMLImageElement>(SELECTOR)];
    const list = imgs.map((img) => ({
      // The optimizer's large size (`<Figure>` in CaseStudyMdx.tsx), not the column-sized one.
      src: img.dataset.full || img.currentSrc || img.src,
      alt: img.alt,
      caption: img.closest("figure")?.querySelector("figcaption")?.textContent?.trim() ?? "",
    }));
    imgs.forEach((img, i) => {
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", `Enlarge image: ${img.alt}`);
      img.dataset.lightboxIndex = String(i);
    });

    const open = (e: Event) => {
      const img = (e.target as Element).closest<HTMLImageElement>("[data-lightbox-index]");
      if (!img) return;
      if (e instanceof KeyboardEvent && e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      opener.current = img;
      setIndex(Number(img.dataset.lightboxIndex));
    };
    document.addEventListener("click", open);
    document.addEventListener("keydown", open);
    // Built from the DOM on mount, like the other progressive enhancements.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems(list);
    return () => {
      document.removeEventListener("click", open);
      document.removeEventListener("keydown", open);
      imgs.forEach((img) => {
        img.removeAttribute("tabindex");
        img.removeAttribute("role");
        img.removeAttribute("aria-label");
        delete img.dataset.lightboxIndex;
      });
    };
  }, []);

  const count = items.length;
  const go = (step: number) => setIndex((i) => (i === null ? i : (i + step + count) % count));
  const close = () => {
    setIndex(null);
    opener.current?.focus();
  };

  const item = index === null ? null : items[index];

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label="Image viewer"
      data-lenis-prevent=""
      onClose={() => index !== null && close()}
      onClick={(e) => e.target === e.currentTarget && close()}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(1);
        if (e.key === "ArrowLeft") go(-1);
      }}
      onPointerDown={(e) => (swipeStart.current = e.clientX)}
      onPointerUp={(e) => {
        if (swipeStart.current === null) return;
        const dx = e.clientX - swipeStart.current;
        swipeStart.current = null;
        if (Math.abs(dx) > SWIPE_PX) go(dx < 0 ? 1 : -1);
      }}
    >
      {/* First in the DOM so showModal() puts focus on it. */}
      <button type="button" className={styles.close} onClick={close} aria-label="Close image viewer">
        <CloseIcon />
      </button>
      {item && (
        <figure className={styles.figure}>
          <img key={item.src} src={item.src} alt={item.alt} className={styles.image} />
          <figcaption className={styles.caption}>
            {item.caption && <span>{item.caption}</span>}
            {count > 1 && (
              <span className={styles.counter}>
                {index! + 1} / {count}
              </span>
            )}
          </figcaption>
        </figure>
      )}
      {count > 1 && (
        <>
          <button type="button" className={`${styles.nav} ${styles.prev}`} onClick={() => go(-1)} aria-label="Previous image">
            <Arrow />
          </button>
          <button type="button" className={`${styles.nav} ${styles.next}`} onClick={() => go(1)} aria-label="Next image">
            <Arrow />
          </button>
        </>
      )}
    </dialog>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
