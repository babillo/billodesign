import { OrbSpeech } from "@/components/experience/OrbSpeech";
import { SplineOrb } from "@/components/experience/SplineOrb";
import { Bio } from "@/components/home/Bio";
import { Hero } from "@/components/home/Hero";
import { HomeIntro, INTRO_DURATION_MS } from "@/components/home/HomeIntro";
import { Preloader } from "@/components/home/Preloader";
import { Projects } from "@/components/home/Projects";
import { Services } from "@/components/home/Services";
import { TechStack } from "@/components/home/TechStack";
import { Testimonials } from "@/components/home/Testimonials";
import { WeGotYou } from "@/components/home/WeGotYou";
import { Cta } from "@/components/sections/Cta";
import { orbLines, services, site, socialLinks } from "@/lib/site";
import styles from "./page.module.css";

export const metadata = {
  alternates: { canonical: "/" },
};

// Structured data carried over from the Webflow page, with the invalid
// relative "url" fixed to an absolute URL.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Billodesign — Building Beyond Limits",
  description:
    "Modern & Professional Webflow Design & Development by Muhammad. Custom-built, speed-optimized, AI-ready websites that evolve with your vision.",
  url: site.url,
  inLanguage: "en",
  about: {
    "@type": "ProfessionalService",
    name: site.name,
    url: site.url,
    slogan: "Design Beyond Pixels. Build Beyond Limits.",
    areaServed: "Worldwide",
    founder: {
      "@type": "Person",
      name: "Muhammad",
      jobTitle: "Web Designer and Certified Webflow Developer",
      email: site.email,
      sameAs: socialLinks.map((s) => s.href.split("?")[0]),
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Web Design & Development Services",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, description: s.description },
      })),
    },
  },
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Preloader />
      <HomeIntro />
      <SplineOrb variant="home">
        <OrbSpeech lines={orbLines.hero} typeSpeed={25} hideAfter={INTRO_DURATION_MS} className={styles.heroTip} />
      </SplineOrb>
      <Hero />
      <WeGotYou />
      <Services />
      <TechStack />
      <Projects />
      <Testimonials />
      <Bio />
      <Cta
        title="Let’s Bring Your Vision to Life"
        text="Have a project, an idea, or just curious if we’re a good fit? Let’s build something smart, beautiful, and future-ready."
      />
    </>
  );
}
