import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { site } from "@/lib/site";
import styles from "./Bio.module.css";

export function Bio() {
  return (
    <section className={styles.section} aria-label="About me">
      <div className="padding-global">
        <div className="container-large">
          <div id="about-me" className={`padding-section-large ${styles.anchor}`}>
            <div className={styles.grid}>
              <Image
                src="/images/muhammad-portrait.avif"
                alt="Portrait of a confident man with arms crossed, wearing a black t-shirt, on a dark abstract background."
                width={531}
                height={465}
                data-reveal=""
                className={styles.portrait}
              />
              <div className={styles.content}>
                <SectionHeading eyebrow="My bio" title="About Me" />
                <h4>Hey, I’m Muhammad.</h4>
                <p data-text="scrub-words" className={styles.paragraph}>
                  I&apos;m a Web designer and Webflow Certified Partner obsessed with blending design, code, and intelligence. Whether you&apos;re
                  building a brand or reinventing a platform, I help you craft digital experiences that work hard — and look alive.
                </p>
                <div className={styles.email}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- decorative icon */}
                  <img src="/icons/email.svg" alt="" width={36} height={36} className={styles.emailIcon} />
                  <a href={`mailto:${site.email}`} className={styles.emailAddress}>
                    {site.email}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
