import Image from "next/image";
import styles from "./WeGotYou.module.css";

export function WeGotYou() {
  return (
    <section className={styles.section} aria-labelledby="wegotyou-title">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-large">
            <div className={styles.content}>
              <div className={styles.heading}>
                <div>
                  <h2 id="wegotyou-title" data-reveal="">
                    We got your back!
                  </h2>
                  <h3 data-text="scrub-words">
                    Custom-built. Speed-optimized. AI-ready. <br />
                    Let your site evolve with your vision.
                  </h3>
                </div>
              </div>
              <Image
                src="/images/performance-dashboard.avif"
                alt="Dashboard showing uptime at 99.99%, Google Lighthouse performance score of 97/100, and DDoS prevented graph."
                width={895}
                height={499}
                className={styles.dashboard}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
