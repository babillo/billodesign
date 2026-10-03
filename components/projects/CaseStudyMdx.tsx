import { evaluate } from "@mdx-js/mdx";
import { getImageProps } from "next/image";
import * as runtime from "react/jsx-runtime";

/*
 * Renders one case-study card's MDX (content/projects/*.mdx) at build time.
 * Plain Markdown becomes the same tags the Webflow rich text used (p, ul/li,
 * h3–h5, strong, em), and the components below reproduce Webflow's figure
 * markup exactly, so the existing `.rich-text` styles in globals.css apply
 * unchanged. Server component: no MDX code reaches the browser.
 */

// Measured width of the rich-text column (ProjectSection .content, max 800 px):
// viewport minus page and card padding.
const SIZES = "(max-width: 767px) calc(100vw - 106px), (max-width: 990px) calc(100vw - 146px), 800px";
// Full-screen lightbox: 1920 px covers a 1440 px window at ~1.3× density without
// sending the 3000 px originals.
const LIGHTBOX_WIDTH = 1920;

type FigureProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  /** "fullwidth" (default) spans the column up to the image's own width; "normal" keeps its natural size. */
  layout?: "fullwidth" | "normal";
};

/**
 * Image figure (Webflow `.w-richtext-figure-type-image`). Served through the
 * Next.js image optimizer (AVIF/WebP sized to the screen, Phase 7); the
 * lightbox opens `data-full`. A `.gif` path plays the converted looping video
 * next to it instead (`<name>.webm`, `.mp4`, `-poster.webp`; see docs/content.md).
 */
function Figure({ src, alt, width, height, caption, layout = "fullwidth" }: FigureProps) {
  const fullwidth = layout === "fullwidth";
  let media: React.ReactNode;
  if (src.endsWith(".gif")) {
    const base = src.slice(0, -4);
    media = (
      <video muted loop playsInline preload="none" poster={`${base}-poster.webp`} width={width} height={height} aria-label={alt} data-autoplay-visible="">
        <source src={`${base}.webm`} type="video/webm" />
        <source src={`${base}.mp4`} type="video/mp4" />
      </video>
    );
  } else {
    const { props } = getImageProps({ src, width, height, alt, sizes: SIZES });
    const candidates = (props.srcSet ?? "").split(", ").map((c) => {
      const [url, w] = c.split(" ");
      return { url, w: parseInt(w, 10) };
    });
    const full = candidates.find((c) => c.w >= LIGHTBOX_WIDTH) ?? candidates.at(-1);
    media = (
      <img loading="lazy" alt={alt} src={props.src} srcSet={props.srcSet} sizes={SIZES} decoding="async" width={width} height={height} data-full={full?.url ?? props.src} />
    );
  }
  return (
    <figure
      className={`w-richtext-figure-type-image w-richtext-align-${fullwidth ? "fullwidth" : "normal"}`}
      style={fullwidth ? { maxWidth: `${width}px` } : undefined}
    >
      <div>{media}</div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

/** Wistia video at a fixed aspect ratio (`ratio` = height as % of width). */
function WistiaVideo({ id, ratio }: { id: string; ratio: number }) {
  return (
    <figure className="w-richtext-figure-type-video w-richtext-align-fullwidth" style={{ paddingBottom: `${ratio.toFixed(4)}%` }}>
      <div>
        <iframe src={`https://fast.wistia.net/embed/iframe/${id}`} title="Project video" allow="autoplay; fullscreen" allowFullScreen />
      </div>
    </figure>
  );
}

/**
 * Webflow editors used empty "&zwj;" paragraphs as vertical spacers (33px);
 * the live pages rendered them, so they're kept.
 */
function Spacer() {
  return <p>{"‍"}</p>;
}

const components = { Figure, WistiaVideo, Spacer };

/** `where` names the file and card in build errors, e.g. "orbitai.mdx → The Result". */
export async function CaseStudyMdx({ source, where }: { source: string; where: string }) {
  // Compile errors (syntax) are caught here; line numbers count from the line
  // after the card's "# Title".
  const { default: Content } = await evaluate(source, { ...runtime, development: false }).catch((error: unknown) => {
    throw new Error(`MDX error in content/projects/${where}: ${error instanceof Error ? error.message : error}`);
  });
  return <Content components={components} />;
}
