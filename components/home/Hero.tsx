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
          <Button data-open-contact="" data-sound-hover="" data-sound-click="" data-reveal="">
            Work With Me
          </Button>
        </div>
      </Container>
    </section>
  );
}
