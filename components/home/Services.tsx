import { Ellipses } from "@/components/ui/Ellipses";
import { CursorGlow } from "./CursorGlow";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ShadowTitle } from "@/components/ui/ShadowTitle";
import { services } from "@/lib/site";
import { Container } from "@/components/ui/Container";
import styles from "./Services.module.css";

export function Services() {
  return (
    <section className={styles.section} aria-label="Services">
      <Container spacing="large">
        <div className={styles.content}>
          <SectionHeading
            eyebrow="Services"
            title="What I Build"
            intro="From concept to clean Webflow code — I design and develop future-proof digital experiences."
          />
          <ul className={styles.grid}>
            {services.map((service) => (
              <li key={service.title} className={`${styles.card} gradient-border`} data-reveal="" data-glow="">
                <img src={service.icon} alt="" className={styles.icon} />
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Ellipses variant="service" />
              </li>
            ))}
          </ul>
          <ShadowTitle>Services</ShadowTitle>
          <CursorGlow />
        </div>
      </Container>
    </section>
  );
}
