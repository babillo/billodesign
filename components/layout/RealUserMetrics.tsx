"use client";

import { SpeedInsights } from "@vercel/speed-insights/next";

/*
 * Phase 7 (S2): real-visitor Core Web Vitals (LCP, INP, CLS…) via Vercel
 * Speed Insights, because Google has too few visits for field data yet. The
 * script is small and first-party (/_vercel/…); it needs Speed Insights enabled
 * for the project in the Vercel dashboard (docs/deployment.md). The lab page
 * is excluded so experiments don't skew the numbers.
 */
export function RealUserMetrics() {
  return <SpeedInsights beforeSend={(event) => (new URL(event.url).pathname.startsWith("/lab/") ? null : event)} />;
}
