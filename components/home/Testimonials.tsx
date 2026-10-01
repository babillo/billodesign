import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Slider } from "@/components/ui/Slider";
import { getTestimonials } from "@/lib/content";
import { Container } from "@/components/ui/Container";
import styles from "./Testimonials.module.css";

export function Testimonials() {
  const slides = getTestimonials().map((t) => <TestimonialCard key={t.slug} testimonial={t} />);

  return (
    <section className={styles.section} aria-label="Testimonials">
      <Container spacing="large" className={styles.clip}>
        <div className={styles.content}>
          <SectionHeading eyebrow="Testimonial" title="What People Say" />
          <div className={styles.sliderWrap}>
            <Slider label="Client testimonials" slides={slides} maskClassName={styles.mask} />
          </div>
        </div>
      </Container>
    </section>
  );
}
