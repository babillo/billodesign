"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { navLinks } from "@/lib/site";
import styles from "./Navbar.module.css";

/*
 * Fixed, blurred navbar. Client component only for the mobile menu toggle
 * (Webflow collapses the navbar at ≤767px, "data-collapse=small").
 */
export function Navbar() {
  const [open, setOpen] = useState(false);

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
              <Link key={link.href} href={link.href} className={styles.link} data-sound-click="" onClick={close}>
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
