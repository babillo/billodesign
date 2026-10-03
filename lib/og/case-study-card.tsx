import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { Project } from "@/lib/content";

/*
 * Phase 7 (V3): branded share image for a case study (1200×630), generated at
 * build time by app/projects/[slug]/opengraph-image.tsx. Same language as the
 * site: black, IBM Plex Mono, uppercase heading with the white→cyan gradient,
 * thin square cyan lines, and the orb (cut from the orb poster render).
 * Assets live in assets/og/ (fonts as WOFF: the image renderer can't read WOFF2).
 */

export const OG_SIZE = { width: 1200, height: 630 };

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file));
const dataUrl = (file: string, type: string) => `data:${type};base64,${read(file).toString("base64")}`;

// "OrbitAI — Calm, Intelligent AI…" → name "OrbitAI" + subtitle.
function splitTitle(title: string) {
  const [name, ...rest] = title.split(/\s+[—–-]\s+/);
  return { name, subtitle: rest.join(" — ") || null };
}

export function caseStudyCard(project: Project) {
  const { name, subtitle } = splitTitle(project.title);
  // Long names (e.g. "Personal Brand & IT Portfolio") step down so they fit two lines.
  const nameSize = name.length > 18 ? 54 : name.length > 11 ? 66 : 84;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#000", position: "relative", fontFamily: "Plex" }}>
        <img src={dataUrl("assets/og/orb.png", "image/png")} width={640} height={507} alt="" style={{ position: "absolute", right: -40, top: 70 }} />
        <div
          style={{
            position: "absolute",
            top: 28,
            right: 28,
            bottom: 28,
            left: 28,
            border: "1px solid #03869e",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "52px 56px 44px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 640 }}>
            <div style={{ color: "#00adcc", fontSize: 20, letterSpacing: 8, fontWeight: 300 }}>CASE STUDY</div>
            <div
              style={{
                marginTop: 26,
                fontSize: nameSize,
                lineHeight: 1.05,
                fontWeight: 700,
                textTransform: "uppercase",
                backgroundImage: "radial-gradient(circle at 50% 50%, #ffffff, #03869e)",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {name}
            </div>
            {subtitle && <div style={{ marginTop: 18, color: "#ffffff", fontSize: 28, lineHeight: 1.3, fontWeight: 300 }}>{subtitle}</div>}
            <div style={{ marginTop: 22, color: "#9f9b9b", fontSize: 22, fontWeight: 300 }}>{project.card.tag}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <img src={dataUrl("public/icons/logo.svg", "image/svg+xml")} width={196} height={44} alt="" />
            <div style={{ color: "#00adcc", fontSize: 22, fontWeight: 300, letterSpacing: 2 }}>billodesign.com</div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Plex", data: read("assets/og/ibm-plex-mono-latin-300-normal.woff"), weight: 300, style: "normal" },
        { name: "Plex", data: read("assets/og/ibm-plex-mono-latin-700-normal.woff"), weight: 700, style: "normal" },
      ],
    },
  );
}
