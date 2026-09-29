import { Ellipses } from "@/components/ui/Ellipses";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ShadowTitle } from "@/components/ui/ShadowTitle";
import { services } from "@/lib/site";
import styles from "./Services.module.css";

export function Services() {
  return (
    <section className={styles.section} aria-label="Services">
      <div className="padding-global">
        <div className="container-large">
          <div className="padding-section-large">
            <div className={styles.content}>
              <SectionHeading
                eyebrow="Services"
                title="What I  Build"
                intro="From concept to clean Webflow code — I design and develop future-proof digital experiences."
              />
              <ul className={styles.grid}>
                {services.map((service) => (
                  <li key={service.title} className={`${styles.card} gradient-border`} data-reveal="">
                    {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG icon */}
                    <img src={service.icon} alt="" className={styles.icon} />
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <Ellipses variant="service" />
                  </li>
                ))}
              </ul>
              <ShadowTitle>Services</ShadowTitle>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
