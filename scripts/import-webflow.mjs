// One-off migration script: converts the Webflow CMS CSV exports and the
// hardcoded homepage cards/testimonials into local content files, and copies
// every referenced asset into /public so the site no longer depends on the
// Webflow CDN. Re-running it overwrites content/*.json and re-downloads assets.
//
// Usage: node scripts/import-webflow.mjs
// See docs/content.md for the resulting content model.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve(import.meta.dirname, "..");
const EXPORT = path.join(ROOT, "webflow/export");
const PUBLIC = path.join(ROOT, "public");
const CONTENT = path.join(ROOT, "content");

// Only the six projects shown on the homepage are migrated (owner decision,
// docs/migration.md §1). Order = homepage slider order.
const PROJECT_SLUGS = [
  "personal-brand-it-portfolio",
  "orbitai",
  "elegantnast",
  "timms-team-landing-page",
  "macrostate-landing-page",
  "flexibank---online-banking-mobile-app",
];

// Original "Next project" references pointed at 3 removed projects. These
// re-point them so the six form one loop; the existing valid links are kept.
const NEXT_PROJECT_OVERRIDES = {
  orbitai: "timms-team-landing-page",
  "macrostate-landing-page": "flexibank---online-banking-mobile-app",
  "flexibank---online-banking-mobile-app": "personal-brand-it-portfolio",
};

// Typo fixes requested by the owner. The original CSVs remain untouched.
const TYPO_FIXES = [
  ["Webfow", "Webflow"],
  ["Weblow", "Webflow"],
  ["Photoshp", "Photoshop"],
  ["Hgh-performance", "High-performance"],
  ["Fadi Al Ibahim", "Fadi Al Ibrahim"],
  ["maintainance", "maintenance"],
  ["lists.They", "lists. They"],
  ["tool.<strong>OrbitAI", "tool. <strong>OrbitAI"],
  ["Dashboad", "Dashboard"],
];

const RICH_TEXT_FIELDS = {
  "Project Overview": "overview",
  "The Challenge": "challenge",
  "Problem Statement": "problemStatement",
  "Goal Statement": "goalStatement",
  "Research & Insights": "researchInsights",
  "The Strategy": "strategy",
  "Design Process": "designProcess",
  "User Flow": "userFlow",
  "Low Fidelity Wireframes": "lowFidelityWireframes",
  "Design System": "designSystem",
  "High Fidelity Wireframe": "highFidelityWireframes",
  "Final Designs & Prototype": "finalDesigns",
  "The Solution": "solution",
  "The Result": "result",
  "Visual Showcase": "visualShowcase",
  "Case Study": "caseStudy",
};

// RFC 4180 CSV parser (quoted fields may contain commas, quotes and newlines).
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  const [header, ...data] = rows.filter((r) => r.some((v) => v !== ""));
  return data.map((r) => Object.fromEntries(header.map((h, i) => [h, r[i] ?? ""])));
}

const fixTypos = (s) => TYPO_FIXES.reduce((acc, [a, b]) => acc.replaceAll(a, b), s);

function decodeEntities(s) {
  return s
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

// Webflow CDN names look like "<24-hex id>_<original name>". Keep the original
// name so files stay recognizable; decode %20 etc. and make it URL-safe.
function localName(url) {
  const base = decodeURIComponent(new URL(url).pathname.split("/").pop());
  return base
    .replace(/^[0-9a-f]{24}_/, "")
    .replace(/[^A-Za-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

// Local file → source URL, so two different CDN files that share a name
// (e.g. several "…_Thumbnail.jpg") never overwrite or shadow each other.
const downloaded = new Map();

async function download(url, destDir, prefix = "") {
  let name = prefix + localName(url);
  let dest = path.join(destDir, name);
  if (downloaded.has(dest) && downloaded.get(dest) !== url) {
    const id = decodeURIComponent(new URL(url).pathname.split("/").pop()).match(/^([0-9a-f]{24})_/)?.[1] ?? String(downloaded.size);
    name = `${prefix}${id.slice(-8)}-${localName(url)}`;
    dest = path.join(destDir, name);
  }
  downloaded.set(dest, url);
  fs.mkdirSync(destDir, { recursive: true });
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  return "/" + path.relative(PUBLIC, dest).split(path.sep).join("/");
}

function copyExportImage(rel, destDir) {
  const src = path.join(EXPORT, decodeURIComponent(rel));
  // "card-" prefix: homepage card images can share a name with the CMS thumbnail
  // (e.g. both "thumbnail.jpg"), and download() skips files that already exist.
  const dest = path.join(destDir, "card-" + path.basename(src).toLowerCase());
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  return "/" + path.relative(PUBLIC, dest).split(path.sep).join("/");
}

// Normalize Webflow rich text: download images, point Embedly-wrapped Wistia
// videos straight at Wistia, and drop Webflow-only attributes.
async function cleanRichText(html, slug) {
  if (!html.trim()) return null;
  let out = fixTypos(html);

  const imgUrls = [...out.matchAll(/<img[^>]*src="([^"]+)"/g)].map((m) => m[1]);
  for (const url of new Set(imgUrls)) {
    const local = await download(url, path.join(PUBLIC, "media/projects", slug));
    out = out.replaceAll(url, local);
  }

  out = out.replace(/<iframe[^>]*src="[^"]*embedly[^"]*fast\.wistia\.net%2Fembed%2Fiframe%2F(\w+)[^"]*"[^>]*><\/iframe>/g,
    (_m, id) => `<iframe src="https://fast.wistia.net/embed/iframe/${id}" title="Project video" allow="autoplay; fullscreen" allowfullscreen loading="lazy"></iframe>`);

  // Webflow renders video figures at the ratio in data-rt-dimensions, not the
  // stored inline padding (FlexiBank's said 40.5% but the page shows 640:432).
  out = out.replace(/<figure([^>]*)>/g, (tag) => {
    const dims = tag.match(/data-rt-dimensions="(\d+):(\d+)"/);
    if (!dims || !tag.includes("type-video")) return tag;
    return tag.replace(/padding-bottom:[^;"]*/, `padding-bottom:${((+dims[2] / +dims[1]) * 100).toFixed(4)}%`);
  });

  out = out
    .replace(/ id=""/g, "")
    .replace(/ data-(rt|page)-[\w-]+="[^"]*"/g, "")
    .replace(/ (width|height)="auto"/g, "")
    .replace(/ loading="lazy"/g, "")
    .replace(/<img /g, '<img loading="lazy" ')
    .replace(/<iframe loading="lazy" /g, "<iframe ")
    // Stray leading <li> in one "The Result" field (invalid HTML from the CMS).
    .replace(/^<li>(<br>)?/, "");
  // "<p>&zwj;</p>" paragraphs are kept on purpose: Webflow editors use them as
  // vertical spacers and the live pages render them (33px each).
  return out;
}

// Webflow writes alt="__wf_reserved_inherit" when an image has no alt text, and
// screen readers would read that out. Use the figure caption, or a generic
// description naming the project.
function fixImageAlts(html, projectName) {
  const attr = (v) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  return html
    .replace(/<figure[^>]*>[\s\S]*?<\/figure>/g, (fig) => {
      const caption = fig.match(/<figcaption>([\s\S]*?)<\/figcaption>/)?.[1]
        .replace(/<[^>]+>/g, "")
        .replace(/&zwj;|&nbsp;/g, " ")
        .trim();
      return fig.replace('alt="__wf_reserved_inherit"', `alt="${attr(caption || `${projectName} screenshot`)}"`);
    })
    .replaceAll('alt="__wf_reserved_inherit"', `alt="${attr(`${projectName} screenshot`)}"`);
}

function parseHomepage() {
  const html = fs.readFileSync(path.join(EXPORT, "index.html"), "utf8");
  const slider = html.slice(html.indexOf("projects_mask"), html.indexOf("section_home-testimoinal"));
  const cards = {};
  for (const s of slider.split("project_slide w-slide").slice(1)) {
    const slug = s.match(/href="[^"]*projects\/([^"]+)"/)[1];
    cards[slug] = {
      title: decodeEntities(s.match(/slider_project-title">([\s\S]*?)<\/h4>/)[1].trim()),
      description: decodeEntities(s.match(/slider_project-description">([\s\S]*?)<\/p>/)[1].trim()),
      image: s.match(/<img src="([^"]+)"[^>]*class="project_thumbnail"/)[1],
      imageAlt: decodeEntities(s.match(/<img [^>]*alt="([^"]*)"[^>]*class="project_thumbnail"/)[1]),
      tools: [...s.slice(s.indexOf("tech_used")).matchAll(/<img src="images\/([^"]+)"/g)].map((m) => m[1]),
    };
  }
  return cards;
}

// Icon files in the export → tool name. Frame-38 is labelled "JavaScript logo"
// on most cards (the "yellow bird" alt on two cards is wrong).
const TOOL_ICONS = {
  "skill-icons_webflow.avif": "Webflow",
  "logos_figma.avif": "Figma",
  "Frame-38.avif": "JavaScript",
};

// The first card reused OrbitAI's alt text in Webflow; this describes the real image.
const CARD_ALT_OVERRIDES = {
  "personal-brand-it-portfolio":
    "Fadi Al-Ibrahim portfolio homepage: dark purple hero reading 'System Administrator' with a glowing emblem and Active Directory and VMware Virtualization callouts.",
};

// Homepage testimonial captions differ from the CMS "Company" field; the
// homepage version is what visitors see, so it is used for `role`.
const TESTIMONIAL_ROLES = {
  "robert-jensen": "CEO - Green Wing Partners LLC",
  "fadi-al-ibrahim": "IT System Administrator",
  "tim-kozak": "Leverion",
  "david-mueller": "ROIGrowth",
};
const TESTIMONIAL_ORDER = ["robert-jensen", "fadi-al-ibrahim", "tim-kozak", "david-mueller"];

// Header video aspect ratios (width/height) from the Wistia embeds on the live pages.
const VIDEO_ASPECT = {
  orbitai: 960 / 518,
  "personal-brand-it-portfolio": 960 / 540,
};

// Homepage card images for the macrostate card are missing from the export
// (filename with parentheses was dropped), so it comes from the live CDN.
const MISSING_CARD_IMAGES = {
  "macrostate-landing-page":
    "https://cdn.prod.website-files.com/68f3884d9e35f473a885d321/68f7afb083ead0aba7a49ad7_70913ef1bacda83a29a665e1c49d3fe6_macrostate.ae%20%282%29%20-%20Copy%201600px.avif",
};

async function imageSize(publicPath) {
  const { width, height } = await sharp(path.join(PUBLIC, publicPath)).metadata();
  return { width, height };
}

async function main() {
  const projectRows = parseCsv(fs.readFileSync(path.join(EXPORT, "billodesign - Projects.csv"), "utf8"));
  const testimonialRows = parseCsv(fs.readFileSync(path.join(EXPORT, "billodesign - Testimonials.csv"), "utf8"));
  const cards = parseHomepage();
  const bySlug = Object.fromEntries(projectRows.map((r) => [r.Slug, r]));

  const projects = [];
  for (const slug of PROJECT_SLUGS) {
    const r = bySlug[slug];
    const card = cards[slug];
    const cardDir = path.join(PUBLIC, "media/projects", slug);
    const cardImage = MISSING_CARD_IMAGES[slug]
      ? await download(MISSING_CARD_IMAGES[slug], cardDir, "card-")
      : copyExportImage(card.image, cardDir);

    const sections = {};
    for (const [col, key] of Object.entries(RICH_TEXT_FIELDS)) {
      const cleaned = await cleanRichText(r[col] ?? "", slug);
      if (cleaned) sections[key] = fixImageAlts(cleaned, r.Title.split(/\s+[—–-]\s+/)[0].trim());
    }

    const text = (v) => (v ? fixTypos(v.trim()) : null);
    projects.push({
      slug,
      title: text(r.Title),
      summary: text(r.Summary),
      publishedOn: new Date(r["Published On"]).toISOString().slice(0, 10),
      thumbnail: await download(r.Thumbnail, cardDir),
      thumbnailSize: null,
      websiteUrl: r["website link"] || null,
      video: r["video thumbnail"]
        ? { wistiaId: r["video thumbnail"].split("/medias/")[1], aspect: VIDEO_ASPECT[slug] ?? 16 / 9 }
        : null,
      meta: {
        role: text(r.Role),
        timeline: text(r.Timeline),
        tools: text(r.Tools),
        scope: text(r.Scope),
        client: text(r.Client),
        industry: text(r.Industry),
        market: text(r.Market),
      },
      sections,
      testimonial: r.Testimonial || null,
      nextProject: NEXT_PROJECT_OVERRIDES[slug] ?? r["Next project"],
      card: {
        title: fixTypos(card.title),
        description: fixTypos(card.description),
        image: cardImage,
        imageAlt: CARD_ALT_OVERRIDES[slug] ?? card.imageAlt,
        imageSize: await imageSize(cardImage),
        tools: card.tools.map((f) => TOOL_ICONS[f] ?? f),
      },
    });
  }

  const testimonials = [];
  for (const slug of TESTIMONIAL_ORDER) {
    const r = testimonialRows.find((t) => t.Slug === slug);
    const quotes = r.Feedback.split("\n")
      .map((q) => q.trim().replace(/^["“]+|["”]+$/g, "").trim())
      .filter(Boolean);
    testimonials.push({
      slug,
      name: fixTypos(r["Client Name"]),
      role: TESTIMONIAL_ROLES[slug],
      quotes,
      avatar: await download(r.Avatar, path.join(PUBLIC, "media/testimonials")),
      avatarAlt: `Portrait of ${fixTypos(r["Client Name"])}`,
      avatarSize: null,
    });
  }

  for (const p of projects) p.thumbnailSize = await imageSize(p.thumbnail);
  for (const t of testimonials) t.avatarSize = await imageSize(t.avatar);

  for (const p of projects) {
    if (!PROJECT_SLUGS.includes(p.nextProject)) throw new Error(`${p.slug}: bad nextProject ${p.nextProject}`);
    if (p.testimonial && !testimonials.some((t) => t.slug === p.testimonial))
      throw new Error(`${p.slug}: unknown testimonial ${p.testimonial}`);
  }

  fs.mkdirSync(CONTENT, { recursive: true });
  fs.writeFileSync(path.join(CONTENT, "projects.json"), JSON.stringify(projects, null, 2) + "\n");
  fs.writeFileSync(path.join(CONTENT, "testimonials.json"), JSON.stringify(testimonials, null, 2) + "\n");
  console.log(`Wrote ${projects.length} projects, ${testimonials.length} testimonials.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
