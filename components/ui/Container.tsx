type Props = {
  /** Vertical section padding (Webflow .padding-section-large/-small); omit for none. */
  spacing?: "large" | "small";
  /** Applied to the innermost wrapper (the spacing div, or the container without spacing). */
  className?: string;
  id?: string;
  children: React.ReactNode;
};

/**
 * The Webflow Client-First section structure used by every section:
 * .padding-global (side gutter) → .container-large (80rem max) → .padding-section-*.
 * Tokens for these live in app/globals.css.
 */
export function Container({ spacing, className, id, children }: Props) {
  const inner = spacing ? (
    <div id={id} className={`padding-section-${spacing}${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  ) : (
    children
  );
  return (
    <div className="padding-global">
      <div id={spacing ? undefined : id} className={`container-large${!spacing && className ? ` ${className}` : ""}`}>
        {inner}
      </div>
    </div>
  );
}
