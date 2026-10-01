import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import styles from "./Hero.module.css";

/*
 * Webflow's h1/p carried "letters-fade-in-delay" attributes that no script
 * handled, so they never animated there. Phase 6 (owner): both "decode" when
 * they come into view (after the homepage intro, and on every return).
 */
export function Hero() {
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.content}>
          <h1 data-text="decode">
            Design Beyond Pixels. <br />
            Build Beyond Limits.
          </h1>
          <p className={styles.paragraph} data-text="decode">
            Webflow sites that don’t just look stunning — <br />
            they think, scale, and convert.
          </p>
          <div className={styles.actions} data-reveal="">
            <Button data-open-contact="" data-sound-hover="" data-sound-click="">
              Work With Me
            </Button>
            {/* Phase 6: lighter second action for visitors not ready to get in touch. */}
            <a href="#portfolio" className={styles.workLink} data-sound-click="">
              View my work <span aria-hidden="true">↓</span>
            </a>
          </div>
        </div>
      </Container>
      {/* Phase 6: scroll cue (decorative; the orb's bubble also says "Scroll down"). */}
      <div className={styles.cue} aria-hidden="true">
        <span className={styles.mouse} />
        Scroll
      </div>
    </section>
  );
}
