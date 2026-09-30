import Image from "next/image";
import type { Testimonial } from "@/lib/content";
import styles from "./TestimonialCard.module.css";

/** Quote card with 5 stars and the client's avatar (Webflow `.testimonial_slide-card`). */
export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className={styles.card}>
      <div className={styles.content}>
        {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
        <img src="/icons/stars.svg" alt="" className={styles.stars} />
        <div className={styles.body}>
          <blockquote className={styles.quote}>
            {testimonial.quotes.map((q, i) => (
              <p key={i} className={styles.text}>
                &quot;{q}&quot;
              </p>
            ))}
          </blockquote>
          <figcaption className={styles.author}>
            <Image src={testimonial.avatar} alt={testimonial.avatarAlt} width={testimonial.avatarSize.width} height={testimonial.avatarSize.height} sizes="4rem" className={styles.avatar} />
            <div>
              <h4 className={styles.name}>{testimonial.name}</h4>
              <div>{testimonial.role}</div>
            </div>
          </figcaption>
        </div>
      </div>
      <span className="visually-hidden">Rated 5 out of 5</span>
    </figure>
  );
}
