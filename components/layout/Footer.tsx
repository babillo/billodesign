import { PAGE_END_ID } from "@/components/sections/CtaOrbTips";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-small">
            <div className={styles.content}>
              <img src="/images/footer-logo.avif" alt="" width={310} height={2} loading="lazy" />
              <p className={styles.copyright}>Muhammad/ © All rights reserved - BilloDesign</p>
            </div>
          </div>
        </div>
        {/* Reaching this marker shows the CTA orb speech bubble (see CtaOrbTips). */}
        <div id={PAGE_END_ID} className={styles.pageEnd} />
      </div>
    </footer>
  );
}
