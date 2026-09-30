import Link from "next/link";
import styles from "./Button.module.css";

type BaseProps = { children: React.ReactNode; className?: string };
type LinkProps = BaseProps & { href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className">;
type ButtonProps = BaseProps & { href?: undefined } & Omit<React.ComponentProps<"button">, "className">;

/**
 * The glowing "pulse dot" button (Webflow `.button.is-icon`), rendered as a
 * link when `href` is given, otherwise as a <button>.
 */
export function Button(props: LinkProps | ButtonProps) {
  const { children, className, ...rest } = props;
  const content = (
    <>
      <PulseDot />
      <span>{children}</span>
    </>
  );
  const cls = `${styles.button} gradient-border ${className ?? ""}`;

  if ("href" in rest && rest.href !== undefined) {
    return (
      <Link className={cls} {...(rest as Omit<LinkProps, "children" | "className">)}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...(rest as Omit<ButtonProps, "children" | "className">)}>
      {content}
    </button>
  );
}

export function PulseDot() {
  return (
    <span className={styles.pulse} aria-hidden="true">
      <span className={styles.pulseBack} />
      <span className={styles.pulseFront} />
    </span>
  );
}
