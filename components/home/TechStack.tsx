import { SectionHeading } from "@/components/ui/SectionHeading";
import { TechStackLottie } from "./TechStackLottie";
import styles from "./TechStack.module.css";

export function TechStack() {
  return (
    <section className={styles.section} aria-label="Tech stack">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-large">
            <div className={styles.content}>
              <SectionHeading eyebrow="Tech Stack" title="Tools I used" />
              <TechStackLottie />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
