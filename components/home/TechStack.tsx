import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { TechStackLottie } from "./TechStackLottie";
import styles from "./TechStack.module.css";

export function TechStack() {
  return (
    <section className={styles.section} aria-label="Tech stack">
      <Container spacing="large">
        <div className={styles.content}>
          <SectionHeading eyebrow="Tech Stack" title="Tools I used" />
          <TechStackLottie />
        </div>
      </Container>
    </section>
  );
}
