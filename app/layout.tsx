import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Lato } from "next/font/google";
import Script from "next/script";
import { AiChat } from "@/components/experience/AiChat";
import { ContactModal } from "@/components/experience/ContactModal";
import { ContactModalProvider } from "@/components/experience/ContactModalProvider";
import { ScrollEffects } from "@/components/experience/ScrollEffects";
import { SmoothScroll } from "@/components/experience/SmoothScroll";
import { SoundProvider } from "@/components/experience/SoundProvider";
import { SoundToggle } from "@/components/experience/SoundToggle";
import { AwwwardsBadge } from "@/components/layout/AwwwardsBadge";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { site } from "@/lib/site";
import "./globals.css";

// Self-hosted by next/font at build time: no request to Google at runtime.
const plexMono = IBM_Plex_Mono({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

// Only used for the huge background words ("Services", "Portfolio").
const lato = Lato({ weight: "900", subsets: ["latin"], variable: "--font-lato", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.title,
    description: site.description,
    images: [{ url: site.ogImage, width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description, images: [site.ogImage] },
  icons: { icon: "/images/favicon.png", apple: "/images/webclip.png" },
};

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" };

// Runs before first paint: enables the scroll-reveal start state only when
// motion is allowed, so content is never hidden without JS or for reduced motion.
// On the homepage it also starts the intro (content hidden while the orb speaks)
// before the first paint; setting it after hydration made the hero flash.
// HomeIntro takes over once React loads; the 15s timeout is a failsafe so the
// page never stays hidden if JavaScript fails.
const motionScript = `if(!matchMedia('(prefers-reduced-motion: reduce)').matches){var d=document.documentElement;d.classList.add('motion');if(location.pathname==='/'){d.dataset.intro='boot';setTimeout(function(){if(d.dataset.intro==='boot')delete d.dataset.intro},15000)}}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${plexMono.variable} ${lato.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
      </head>
      <body>
        <SoundProvider>
          <ContactModalProvider>
            <a href="#main" className="skip-link">
              Skip to content
            </a>
            <Navbar />
            <main id="main">{children}</main>
            <Footer />
            <SoundToggle />
            <AwwwardsBadge />
            <AiChat />
            <ContactModal />
          </ContactModalProvider>
        </SoundProvider>
        <SmoothScroll />
        <ScrollEffects />
        {process.env.NODE_ENV === "production" && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${site.gaMeasurementId}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${site.gaMeasurementId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
