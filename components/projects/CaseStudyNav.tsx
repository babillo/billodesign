"use client";

import { useEffect, useRef, useState } from "react";
import { scrollToElement } from "@/lib/scroll";
import styles from "./CaseStudyNav.module.css";

type Entry = { id: string; label: string; level: 1 | 2 };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60) || "section";

/*
 * Phase 6 (#7): reading progress + section menu for long case studies.
 * Built from the page's own headings: each case-study card title (h2) and the
 * chapter headings (h3) inside its rich text, so it works for every project
 * without extra content. The progress bar is updated by writing a transform
 * directly (no re-render per scroll frame).
 */
export function CaseStudyNav() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const bar = useRef<HTMLDivElement>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const used = new Set<string>();
    const list: Entry[] = [];
    const headings: HTMLElement[] = [];
    document.querySelectorAll<HTMLElement>("main section h2.as-h3, main .rich-text h3").forEach((h) => {
      const label = (h.textContent ?? "").replace(/‍/g, "").trim();
      if (!label) return;
      if (!h.id) {
        let id = slugify(label);
        for (let n = 2; used.has(id) || document.getElementById(id); n++) id = `${slugify(label)}-${n}`;
        h.id = id;
      }
      used.add(h.id);
      headings.push(h);
      list.push({ id: h.id, label, level: h.tagName === "H2" ? 1 : 2 });
    });

    let frame = 0;
    const update = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${progress})`;
      setVisible(window.scrollY > window.innerHeight * 0.6);
      // Current = last heading that has passed 30% of the viewport.
      let active: string | null = null;
      for (const h of headings) {
        if (h.getBoundingClientRect().top < window.innerHeight * 0.3) active = h.id;
        else break;
      }
      setCurrent(active);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Headings come from server-rendered HTML; read once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(list);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Close on Escape or a click outside the menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, [open]);

  const jump = (e: React.MouseEvent, id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    // Lenis would also handle this same-page #link; one scroll is enough.
    e.stopPropagation();
    setOpen(false);
    scrollToElement(el);
  };

  return (
    <>
      <div className={styles.progress} aria-hidden="true">
        <div ref={bar} className={styles.bar} />
      </div>
      {entries.length > 1 && (
        <div ref={wrap} className={`${styles.wrap} ${visible || open ? styles.shown : ""}`} inert={!(visible || open)}>
          {open && (
            <nav id="case-study-sections" aria-label="Case study sections" className={styles.panel} data-lenis-prevent="">
              <ul>
                {entries.map((e) => (
                  <li key={e.id} className={e.level === 2 ? styles.sub : undefined}>
                    <a href={`#${e.id}`} onClick={(ev) => jump(ev, e.id)} aria-current={current === e.id ? "location" : undefined}>
                      {e.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls="case-study-sections"
            onClick={() => setOpen((v) => !v)}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Sections
          </button>
        </div>
      )}
    </>
  );
}
