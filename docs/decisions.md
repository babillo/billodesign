# Architecture Decision Log

## ADR-001 — Local content files instead of a headless CMS

Date: 2026-09-29

Decision:
Store projects and testimonials as local typed content in the repo, generated from the official Webflow CSV exports. No headless CMS.

Context:
Webflow code export excludes CMS content. The owner exported the Projects (10 items) and Testimonials (4 items) collections as CSV.

Reason:
Small, rarely-changing dataset with a single editor. Local content is versioned, free, fast (static generation), and has no runtime dependency.

Alternatives:
Sanity/Contentful/other headless CMS; keeping Webflow as a CMS via its API.

Trade-offs:
Editing requires a code change and deploy (acceptable for one developer-owner). Revisit if content volume or non-technical editors appear.

## ADR-002 — AI chat moves behind a Next.js Route Handler

Date: 2026-09-29

Decision:
Rebuild the chat backend as `/api/chat` in the Next.js app; keep the existing browser UI and request/response shape.

Context:
The existing endpoint is a Webflow Cloud Astro app with no CORS support, so `billodesign.com` browsers can't call it after migration. It has no rate limiting. Model/prompt are not visible from outside.

Reason:
Removes the Webflow dependency, keeps the API key server-side, allows rate limiting, and keeps the frontend contract (`{message, conversationHistory}` → `{response}`) so the UI port is straightforward.

Alternatives:
Proxy to the old Webflow Cloud endpoint from a Next.js route (a possible short-term bridge); call the provider from the browser (rejected, it exposes the key).

Trade-offs:
Needs the provider API key and a system prompt (recover the original, or rewrite if unrecoverable). Model choice stays the same as the original once confirmed.

## ADR-003 — Keep gpt-4o-mini and the original generation settings for the chat

Date: 2026-09-29

Decision:
The new `/api/chat` uses OpenAI `gpt-4o-mini`, `max_tokens: 500`, `temperature: 0.9`, the same as the original Astro app.

Context:
Confirmed from the original `src/pages/api/chat.ts`. The owner asked not to upgrade the model just for the sake of it.

Reason:
Reproduce the existing behavior first; evaluate models/cost separately later.

Alternatives:
Newer/cheaper models (deferred to a later, evidence-based evaluation).

Trade-offs:
Behavior parity now; any model change becomes a deliberate, documented decision.
