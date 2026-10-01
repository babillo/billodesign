"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks, site } from "@/lib/site";
import styles from "./Navbar.module.css";

/*
 * Fixed, blurred navbar. Client component only for the mobile menu toggle
 * (Webflow collapses the navbar at ≤767px, "data-collapse=small").
 */
export function Navbar() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Phase 6 (#4): darker glass backdrop once the page has scrolled, so content
  // passing underneath doesn't clash with the logo and links.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <div className="padding-global">
        <div className={styles.container}>
          <Link href="/" className={styles.brand} aria-label="Billodesign home" onClick={close}>
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
            {/* Phase 6: availability status, opens the contact form. Hidden in the phone menu. */}
            <button type="button" className={styles.status} data-open-contact="" data-sound-click="">
              <span className={styles.statusDot} aria-hidden="true" />
              {site.availability}
            </button>
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
