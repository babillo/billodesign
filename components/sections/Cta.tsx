import { Button } from "@/components/ui/Button";
import { SocialLinks } from "@/components/layout/SocialLinks";
import { Container } from "@/components/ui/Container";
import { CTA_BUTTON_ID, CtaOrbTips } from "./CtaOrbTips";
import styles from "./Cta.module.css";

type Props = { title: string; text: string };

/** Closing call to action, shared by the homepage and project pages. */
export function Cta({ title, text }: Props) {
  return (
    <section className={styles.section} aria-labelledby="cta-title">
      <Container spacing="large">
        <div id="contact" className={styles.content}>
          <div className={styles.heading}>
            <h3 id="cta-title" data-text="letters-fade-in">
              {title}
            </h3>
            <p data-text="scrub-words">{text}</p>
          </div>
          <Button id={CTA_BUTTON_ID} data-open-contact="" data-sound-click="" data-sound-hover="" data-reveal="">
            Let’s connect
          </Button>
          <SocialLinks />
          <CtaOrbTips />
        </div>
      </Container>
    </section>
  );
}
