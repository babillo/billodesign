import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { PerformanceStats } from "./PerformanceStats";
import styles from "./WeGotYou.module.css";

/*
 * Phase 6 (owner design): the original dashboard image stays as a fixed
 * background of this section (clip-path keeps the position:fixed layer inside
 * the section), and the heading and live stat cards scroll over it.
 */
export function WeGotYou() {
  return (
    <section className={styles.section} aria-labelledby="wegotyou-title" data-orb-cover="">
      <div className={styles.backdrop} aria-hidden="true">
        <Image src="/images/performance-dashboard.avif" alt="" width={895} height={499} className={styles.dashboard} />
      </div>
      <Container spacing="large">
        <div className={styles.content}>
          <div className={styles.heading}>
            <div>
              <h2 id="wegotyou-title" data-reveal="" data-text="decode">
                We got your back!
              </h2>
              <h3 data-text="scrub-words">
                Custom-built. Speed-optimized. AI-ready. <br />
                Let your site evolve with your vision.
              </h3>
            </div>
          </div>
          <PerformanceStats />
        </div>
      </Container>
    </section>
  );
}
