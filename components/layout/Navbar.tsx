"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/site";
import styles from "./Navbar.module.css";

/*
 * Fixed, blurred navbar. Client component only for the mobile menu toggle
 * (Webflow collapses the navbar at ≤767px, "data-collapse=small").
 */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const pathname = usePathname();

  // Highlight the link whose section is in view (Webflow adds .w--current to
  // in-page anchor links automatically). The section counts once it crosses
  // the middle of the viewport.
  useEffect(() => {
    if (pathname !== "/") return;
    const targets = navLinks.map((l) => document.getElementById(l.href.split("#")[1])).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setCurrent(e.target.id);
          else setCurrent((c) => (c === e.target.id ? null : c));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => {
      io.disconnect();
      setCurrent(null);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className={styles.nav}>
      <div className="padding-global">
        <div className={styles.container}>
          <Link href="/" className={styles.brand} aria-label="Billodesign home" onClick={close}>
            {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo, already optimal */}
            <img src="/icons/logo.svg" alt="" width={196} height={44} className={styles.logo} />
          </Link>

          <button
            type="button"
            className={`${styles.menuButton} ${open ? styles.menuButtonOpen : ""}`}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={`${styles.bar} ${styles.barTop}`} />
            <span className={`${styles.bar} ${styles.barMiddle}`} />
            <span className={`${styles.bar} ${styles.barBottom}`} />
          </button>

          <nav id="site-menu" aria-label="Main" className={`${styles.menu} ${open ? styles.menuOpen : ""}`}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.link} ${current === link.href.split("#")[1] ? styles.current : ""}`}
                aria-current={current === link.href.split("#")[1] ? "location" : undefined}
                data-sound-click=""
                onClick={close}
              >
                {link.label}
              </Link>
            ))}
            <button type="button" className={styles.link} data-open-contact="" data-sound-click="" onClick={close}>
              Contact
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
