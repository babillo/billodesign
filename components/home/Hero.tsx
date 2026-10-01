import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import styles from "./Hero.module.css";

/*
 * The hero copy is intentionally static: the Webflow h1/p carried
 * "letters-fade-in-delay" attributes that no script handled, so they never
 * animated on the live site.
 */
export function Hero() {
  return (
    <section className={styles.section}>
      <Container>
        <div className={styles.content}>
          <h1>
            Design Beyond Pixels. <br />
            Build Beyond Limits.
          </h1>
          <p className={styles.paragraph}>
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
