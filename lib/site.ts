// Site-wide content and settings. Edit here to change navigation, socials or
// homepage copy that isn't part of a project.

export const site = {
  name: "Billodesign",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://billodesign.com",
  title: "Billodesign — Building Beyond Limits.",
  description:
    "Webflow Certified Partner crafting custom, speed-optimized, AI-ready websites. From UI/UX design to clean code—build digital experiences that evolve.",
  email: "hello@billodesign.com",
  ogImage: "/images/og-image.jpg",
  gaMeasurementId: "G-MVZCKN2L6C",
  awwwardsUrl: "https://www.awwwards.com/sites/billodesign-living-portfolio",
} as const;

// "Contact" opens the contact modal rather than navigating.
export const navLinks = [
  { label: "Portfolio", href: "/#portfolio" },
  { label: "About me", href: "/#about-me" },
] as const;

// Accessible labels fixed during migration: the Webflow site labelled Upwork,
// Contra and Webflow as "Behance link" / "X link" (docs/migration.md §7).
export const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/muhammad-salman-370223182", icon: "/icons/social-linkedin.svg" },
  { label: "Upwork", href: "https://www.upwork.com/freelancers/~01dd19fd0c2e16e78b", icon: "/icons/social-upwork.svg" },
  {
    label: "Contra",
    href: "https://contra.com/billodesign?referralExperimentNid=DEFAULT_REFERRAL_PROGRAM&referrerUsername=billodesign",
    icon: "/icons/social-contra.svg",
  },
  { label: "Webflow profile", href: "https://webflow.com/@billodesign-work", icon: "/icons/social-webflow.svg" },
  { label: "Behance", href: "https://www.behance.net/muhammadsalman201", icon: "/icons/social-behance.svg" },
] as const;

export const services = [
  {
    title: "Web Design",
    description: "UI/UX design that feels intuitive, intelligent, and on-brand.",
    icon: "/icons/service-web-design.svg",
  },
  {
    title: "Webflow Development",
    description: "Lightning-fast, scalable websites built with clean semantic code.",
    icon: "/icons/service-webflow-development.svg",
  },
  {
    title: "Performance & SEO",
    description: "Optimized for speed, search, and seamless experience across all devices.",
    icon: "/icons/service-performance-seo.svg",
  },
] as const;

export const toolIcons: Record<string, { src: string; alt: string }> = {
  Webflow: { src: "/images/tool-webflow.avif", alt: "Webflow" },
  Figma: { src: "/images/tool-figma.avif", alt: "Figma" },
  JavaScript: { src: "/images/tool-javascript.avif", alt: "JavaScript" },
};

// Typewriter lines spoken by the orb (originally Typed.js instances).
export const orbLines = {
  hero: ["Hey there... Welcome to BilloDesign 👋", "Let’s build beyond pixels.", "Scroll down and I’ll guide you."],
  ctaButton: ["Yes Human! that button, press it NOW. thank you😉.", "I am waiting... 😏"],
  cta: ["What are you waiting for?", "Smash that 'Let's connect' button human! 😏"],
  modal: ["Hey human 👋", "I’ll deliver your message straight to Muhammad!😊"],
} as const;
