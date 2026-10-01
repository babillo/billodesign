import { PulseDot } from "@/components/ui/Button";
import { navLinks, site } from "@/lib/site";
import styles from "./Footer.module.css";

/*
 * Phase 6 (#8): the Webflow footer was only the divider line and a copyright.
 * Now it also carries navigation, email, availability and back-to-top. Social
 * icons are left out on purpose: the CTA directly above shows them on every page.
 */
export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-small">
            <div className={styles.grid}>
              <div className={styles.brand}>
                <p className={styles.name}>Muhammad · BilloDesign</p>
                <p className={styles.role}>Webflow Certified Partner — design &amp; development</p>
                <p className={styles.status}>
                  <PulseDot />
                  {site.availability}
                </p>
              </div>

              <nav aria-label="Footer" className={styles.links}>
                <ul>
                  {navLinks.map((l) => (
                    <li key={l.href}>
                      <a href={l.href}>{l.label}</a>
                    </li>
                  ))}
                  <li>
                    <button type="button" data-open-contact="" data-sound-click="">
                      Contact
                    </button>
                  </li>
                </ul>
              </nav>

              <div className={styles.contact}>
                <a href={`mailto:${site.email}`} className={styles.email}>
                  {site.email}
                </a>
                <a href="#main" className={styles.top}>
                  Back to top <span aria-hidden="true">↑</span>
                </a>
              </div>
            </div>

            <div className={styles.bottom}>
              <img src="/images/footer-logo.avif" alt="" width={310} height={2} loading="lazy" className={styles.divider} />
              <p className={styles.copyright}>© {year} Muhammad / BilloDesign. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
