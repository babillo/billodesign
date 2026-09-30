import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Photos and screenshots use next/image. Plain <img> is used on purpose for
    // SVG icons, animated GIFs and tiny decorative images, where the optimizer
    // adds nothing (see docs/architecture.md "Assets").
    rules: { "@next/next/no-img-element": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Original Webflow export: reference material, not app code.
    "webflow/**",
  ]),
]);

export default eslintConfig;
