import styles from "./SectionHeading.module.css";

type Props = {
  eyebrow: string;
  title: string;
  /** Optional intro paragraph, brightened word by word on scroll. */
  intro?: string;
  className?: string;
};

/**
 * Cyan uppercase eyebrow (h2) above a gradient title (h3): the heading pattern
 * used by every homepage section. The h2/h3 levels match the original
 * document outline.
 */
export function SectionHeading({ eyebrow, title, intro, className }: Props) {
  return (
    <div className={`${styles.wrap} ${className ?? ""}`}>
      <div>
        <h2 data-reveal="">{eyebrow}</h2>
        <h3>{title}</h3>
      </div>
      {intro && <p data-text="scrub-words">{intro}</p>}
    </div>
  );
}
