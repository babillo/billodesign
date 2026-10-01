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
          {/*
            Phase 6: desktop shows all testimonials in a 2×2 grid; tablets and
            phones keep the swipe slider. Switched with CSS (no layout flash).
          */}
          <div className={styles.grid}>{getTestimonials().map((t) => <TestimonialCard key={t.slug} testimonial={t} />)}</div>
          <div className={styles.sliderWrap}>
            <Slider label="Client testimonials" slides={slides} maskClassName={styles.mask} />
          </div>
        </div>
      </Container>
    </section>
  );
}
