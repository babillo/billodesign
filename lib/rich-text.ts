import { getImageProps } from "next/image";

/*
 * Phase 7 (P1, P2): case-study rich text is stored as HTML (content/projects.json),
 * so its <img> tags never went through next/image and shipped the original
 * uploads (up to 3060 px, 18 MB on OrbitAI) into an 800 px column. This rewrites
 * them at render time (pages are static, so it runs at build) to use the Next.js
 * image optimizer: AVIF/WebP, sized to the screen. The content files stay as the
 * importer wrote them.
 */

// Measured width of the rich-text column (ProjectSection .content, max 800 px):
// viewport minus page and card padding.
const SIZES = "(max-width: 767px) calc(100vw - 106px), (max-width: 990px) calc(100vw - 146px), 800px";
// Full-screen lightbox: 1920 px covers a 1440 px window at ~1.3× density without
// sending the 3000 px originals.
const LIGHTBOX_WIDTH = 1920;

// URLs from getImageProps contain "&"; escape them for raw HTML attributes.
const escape = (s: string) => s.replace(/&/g, "&amp;");

const attr = (tag: string, name: string) => tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];

function optimizeImage(tag: string, src: string) {
  const width = Number(attr(tag, "width"));
  const height = Number(attr(tag, "height"));
  if (!width || !height) return tag;
  const { props } = getImageProps({ src, width, height, alt: "", sizes: SIZES });
  const candidates = (props.srcSet ?? "").split(", ").map((c) => {
    const [url, w] = c.split(" ");
    return { url, w: parseInt(w, 10) };
  });
  const full = candidates.find((c) => c.w >= LIGHTBOX_WIDTH) ?? candidates.at(-1);
  return tag
    .replace(` src="${src}"`, ` src="${escape(props.src)}" srcset="${escape(props.srcSet ?? "")}" sizes="${SIZES}" decoding="async"`)
    .replace(/>$/, ` data-full="${escape(full?.url ?? props.src)}">`);
}

// Animated GIFs were converted to looping video (mp4 + webm next to the GIF's
// path, plus a poster frame), 80–90 % smaller. RichTextVideos starts them when
// they scroll into view.
function gifToVideo(tag: string, src: string) {
  const base = src.replace(/\.gif$/, "");
  const width = attr(tag, "width");
  const height = attr(tag, "height");
  const alt = attr(tag, "alt") ?? "";
  return (
    `<video muted loop playsinline preload="none" poster="${base}-poster.webp" width="${width}" height="${height}" aria-label="${alt}" data-autoplay-visible="">` +
    `<source src="${base}.webm" type="video/webm"><source src="${base}.mp4" type="video/mp4"></video>`
  );
}

export function optimizeRichText(html: string) {
  return html.replace(/<img [^>]*src="(\/media\/[^"]+)"[^>]*>/g, (tag, src: string) =>
    src.endsWith(".gif") ? gifToVideo(tag, src) : optimizeImage(tag, src),
  );
}
