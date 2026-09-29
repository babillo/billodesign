# Billodesign — Webflow → Next.js Migration

## Role

Act as a senior frontend engineer and web designer helping me migrate my existing portfolio website, **Billodesign**, from Webflow to a modern Next.js application.

The existing Webflow website is the **visual source of truth**.

Your job is NOT to redesign the website initially. The first objective is to faithfully understand and reproduce the existing experience while improving the underlying architecture, maintainability, performance, SEO, and deployment flexibility.

The final application will be deployed to **Vercel** and served from:

**https://billodesign.com**

---

# IMPORTANT: Migration Philosophy

Follow this principle throughout the project:

> **Preserve the experience first. Improve the implementation second. Enhance the design last.**

Do not make arbitrary visual changes because you prefer a different implementation.

The existing Webflow site should be treated as the reference for:

* layout
* spacing
* typography
* colors
* imagery
* responsive behavior
* interactions
* animations
* navigation
* content
* page structure
* visual hierarchy

However, do NOT blindly reproduce Webflow's underlying class structure or implementation.

We are migrating the EXPERIENCE, not copying Webflow's architecture.

---

# Project Phases

Work through these phases in order.

## PHASE 1 — RECONNAISSANCE / AUDIT

Before writing significant code, inspect the existing project and understand what is already available.

Audit:

### Website structure

* pages
* routes
* navigation
* footer
* reusable sections
* project/case-study pages
* CMS-driven content
* forms
* external links

### Visual system

Identify:

* typography
* font families
* font weights
* type scale
* colors
* spacing system
* container widths
* border radii
* shadows
* grid structure
* breakpoints
* responsive behavior

### Interactions and animation

Document:

* hover states
* scroll animations
* entrance animations
* text animations
* image animations
* page transitions
* cursor interactions
* sticky elements
* parallax
* GSAP/custom JavaScript
* Webflow interactions

### Assets

Inventory:

* images
* SVGs
* icons
* videos
* fonts
* logos
* Lottie/Rive assets
* other media

Determine which assets can be reused directly and which should be optimized or recreated.

### SEO

Inspect:

* page titles
* meta descriptions
* canonical URLs
* Open Graph metadata
* image alt text
* heading hierarchy
* structured data
* sitemap
* robots.txt
* existing URLs
* redirects
* indexing considerations

### Custom code

Identify and document every relevant:

* CSS customization
* JavaScript
* third-party script
* analytics integration
* form integration
* embed
* Webflow-specific dependency

Do not remove or replace something until its purpose is understood.

---

# PHASE 1 OUTPUT

Before beginning the main implementation, create a concise migration report containing:

1. Current website architecture
2. Page/route inventory
3. Component/section inventory
4. CMS/content model
5. Animation/interactions inventory
6. Asset inventory
7. SEO inventory
8. Custom-code inventory
9. Dependencies/integrations
10. Potential migration risks
11. Recommended Next.js architecture
12. Items that should remain visually identical
13. Items that can safely be improved later

Do not start Phase 6 design enhancements yet.

---

# PHASE 2 — NEXT.JS IMPLEMENTATION

Once the audit is complete, build the new site.

Use modern Next.js conventions and a maintainable architecture.

Prioritize:

* reusable components
* semantic HTML
* clean component boundaries
* accessible interactions
* responsive design
* performance
* SEO
* maintainability
* minimal unnecessary dependencies

Do not create an unnecessarily complicated architecture.

Use the simplest architecture that properly supports the portfolio.

---

# COMPONENT ARCHITECTURE

Avoid creating one enormous page component.

Identify reusable patterns such as:

* Navbar
* Footer
* Hero
* Section wrapper
* Project card
* Project grid
* Case-study sections
* Buttons
* Typography primitives
* Image/media components
* Animation wrappers

Only abstract components when there is a meaningful reuse or structural reason.

Avoid premature abstraction.

---

# STYLING

Reproduce the existing visual system accurately.

Pay particular attention to:

* spacing
* typography
* line-height
* max-widths
* alignment
* image proportions
* responsive behavior
* hover states
* transitions

Do not use arbitrary values simply to make something visually close if the existing design clearly follows a system.

Where appropriate, establish reusable design tokens/CSS variables.

---

# RESPONSIVE IMPLEMENTATION

The current Webflow website is the reference.

Test the new implementation at approximately:

* 1440px
* 1280px
* 1024px
* 768px
* 480px
* 390px
* 375px

Do not only reproduce desktop and allow mobile to become an afterthought.

Pay particular attention to:

* typography scaling
* navigation
* grids
* image cropping
* section spacing
* horizontal overflow
* touch interactions
* animation behavior

---

# ANIMATION

Preserve important existing animation behavior.

Where appropriate, use modern implementation techniques rather than reproducing Webflow-specific animation logic.

Prefer:

* performant transforms
* opacity
* requestAnimationFrame where necessary
* GSAP when the animation genuinely benefits from it
* CSS transitions/animations for simple interactions

Avoid excessive animation or unnecessary JavaScript.

Respect:

`prefers-reduced-motion`

---

# CMS / CONTENT

Do not introduce a headless CMS automatically.

First determine whether the portfolio actually requires one.

If the content structure is relatively static, prefer a simpler architecture such as:

* local data
* structured objects
* MDX

If the project clearly benefits from a CMS, document the reasoning before introducing one.

The architecture should follow the content requirements rather than technology trends.

---

# SEO

The new site should have first-class SEO support.

Implement appropriate:

* metadata
* title templates
* descriptions
* canonical URLs
* Open Graph metadata
* Twitter/X metadata where appropriate
* sitemap
* robots.txt
* semantic headings
* image alt text
* structured data where useful

Preserve existing valuable URLs wherever possible.

Do not casually rename routes.

If a route must change, create an appropriate redirect.

---

# PERFORMANCE

Optimize the site for real-world performance.

Consider:

* Next.js image optimization
* image dimensions
* modern image formats
* lazy loading
* font loading
* minimizing JavaScript
* avoiding unnecessary client components
* animation performance
* third-party scripts

Do not optimize prematurely at the expense of maintainability.

---

# PHASE 3 — ARCHITECTURE REFINEMENT

After the initial implementation works visually:

Review the codebase for:

* duplicated code
* unnecessary client components
* poor component boundaries
* unnecessary dependencies
* unused CSS
* unnecessary JavaScript
* accessibility problems
* inconsistent naming
* performance issues
* maintainability issues

Refactor carefully without changing the visual output unnecessarily.

---

# PHASE 4 — VISUAL QA

This is extremely important.

Compare the Next.js implementation against the original Webflow website.

Use the original website as the visual reference.

Check:

* typography
* spacing
* alignment
* dimensions
* colors
* images
* responsive behavior
* hover states
* animations
* navigation
* project layouts

When something differs, determine whether the difference is:

1. intentional
2. caused by the new architecture
3. an implementation bug

Fix unintended differences.

Do not assume that a visually different implementation is an improvement.

---

# PHASE 5 — PRODUCTION / DEPLOYMENT

Prepare the application for production deployment on Vercel.

The target production domain is:

**https://billodesign.com**

Prepare:

* production environment configuration
* domain configuration guidance
* sitemap
* robots.txt
* metadata
* analytics
* favicon/app icons
* social sharing metadata
* 404 page
* error handling
* redirects

Before considering the migration complete, verify that the production site is functional and that important SEO URLs are preserved.

---

# PHASE 6 — DESIGN ENHANCEMENT

ONLY begin this phase after Phases 1–5 are stable.

Now treat the migrated site as a new opportunity for refinement.

Do NOT redesign randomly.

Instead, identify specific opportunities to improve:

* visual hierarchy
* typography
* responsive behavior
* interaction quality
* micro-interactions
* animation
* page transitions
* storytelling
* accessibility
* performance
* case-study presentation
* overall polish

For every proposed visual change, explain:

1. What is currently there
2. What could be improved
3. Why the change improves the experience
4. What implementation would be required

Then prioritize improvements by impact.

The goal is:

> **The original Webflow site, faithfully rebuilt — then intentionally elevated.**

Not:

> **A completely different website.**

---

# DEVELOPMENT RULES

## Do not blindly trust AI-generated code

You are responsible for maintaining a production-quality codebase.

If something is unclear, inspect the existing implementation and reason about it before changing it.

## Do not over-engineer

Avoid adding libraries simply because they are popular.

Every dependency should have a reason.

## Do not destroy existing functionality

Before replacing existing behavior, understand what it does.

## Do not make major visual changes during migration

Save deliberate improvements for Phase 6.

## Keep the project runnable

After meaningful changes:

* run the appropriate checks
* fix errors
* verify the affected page
* avoid leaving broken intermediate states

## Explain important architectural decisions

When there are multiple reasonable approaches, briefly explain the tradeoffs and choose the simplest appropriate solution.

---

# END GOAL

The final result should be:

**Billodesign**

* visually faithful to the existing portfolio
* modern Next.js architecture
* responsive
* accessible
* fast
* SEO-ready
* maintainable
* deployed independently of Webflow
* served from `billodesign.com`
* easier to evolve in the future
* capable of becoming a case study demonstrating Webflow → modern frontend migration expertise

Most importantly:

**Do not rush into implementation. Start with Phase 1 and show me the audit/report before proceeding to the major rebuild.**


# DOCUMENTATION SYSTEM

Documentation is a first-class deliverable of this project.

Do not wait until the end of the project to document the work.

The documentation should be maintained continuously throughout every phase so that I can return to the project months later and understand how everything works.

The documentation should be written for **me as the developer who will maintain and evolve this website**, not merely as a generic README for another developer.

---

# Documentation Structure

Create a `/docs` directory and maintain the following documentation.

## `/docs/README.md`

The main documentation index.

Include:

* project overview
* current architecture
* technology stack
* development setup
* project structure
* documentation index
* deployment overview
* important links
* current project status

Keep this file concise and use it as the entry point to the other documentation.

---

## `/docs/architecture.md`

Document the overall architecture.

Include:

* Next.js architecture
* routing structure
* component architecture
* data/content architecture
* styling architecture
* animation architecture
* asset handling
* server vs client component decisions
* external services
* deployment architecture

For important architectural decisions, explain:

**Decision → Reason → Alternative considered → Consequence**

---

## `/docs/routes.md`

Document every route.

For each route include:

* URL
* purpose
* page/component responsible
* content source
* important components
* SEO metadata
* notable interactions
* migration notes

Keep this updated whenever routes are added, removed, or changed.

---

## `/docs/components.md`

Maintain an inventory of reusable components.

For each important component document:

* component name
* location
* purpose
* props
* where it is used
* important implementation details
* dependencies
* customization notes

Example:

```text
ProjectCard
Location: components/projects/ProjectCard.tsx

Purpose:
Reusable project preview card.

Props:
- title
- description
- image
- href
- category

Used by:
- Home page
- Work page

Notes:
Hover animation uses CSS transform rather than JavaScript.
```

The exact format can evolve if a better structure emerges.

---

## `/docs/design-system.md`

Document the visual system discovered from the original Webflow site and the final implementation.

Include:

* typography
* font families
* font weights
* type scale
* colors
* spacing
* containers
* breakpoints
* border radius
* shadows
* buttons
* cards
* forms
* recurring UI patterns

Clearly distinguish between:

**Original Webflow values**

and

**New/improved values introduced during Phase 6.**

This distinction is important.

---

## `/docs/animations.md`

Document all significant animations and interactions.

For each:

* location
* trigger
* behavior
* technology used
* important configuration
* performance considerations
* reduced-motion behavior

Example:

```text
Hero entrance animation

Trigger:
Page load

Implementation:
GSAP

Elements:
- heading
- description
- CTA
- hero visual

Notes:
Uses transform + opacity.
Avoid animating layout properties.
Respects prefers-reduced-motion.
```

---

## `/docs/content.md`

Document how website content is structured.

Include:

* project data
* case studies
* navigation
* site-wide content
* content models
* data files
* CMS configuration if a CMS is introduced

If a headless CMS is eventually introduced, document:

* schemas
* fields
* relationships
* fetching strategy
* environment variables
* deployment considerations

---

## `/docs/seo.md`

Document the SEO implementation.

Include:

* metadata strategy
* page titles
* descriptions
* canonical URLs
* Open Graph
* sitemap
* robots.txt
* structured data
* redirects
* important SEO decisions
* migration considerations from Webflow

Document any changes made to existing SEO configuration.

---

## `/docs/deployment.md`

Document the complete production deployment process.

Include:

* Vercel configuration
* domain configuration
* DNS requirements
* environment variables
* build commands
* production settings
* analytics
* deployment process
* rollback considerations
* post-deployment checks

Do not document secrets or expose credentials.

---

## `/docs/migration.md`

Document the Webflow → Next.js migration itself.

Include:

* why the migration was performed
* original Webflow architecture
* original CMS structure
* original custom code
* original interactions
* mapping from Webflow → Next.js
* things that were reproduced exactly
* things that required a different implementation
* things intentionally changed
* migration problems encountered
* solutions
* things that could not be reproduced
* final architecture

This should eventually become the foundation for a public case study.

---

## `/docs/decisions.md`

Maintain an Architecture Decision Log.

Whenever an important technical decision is made, add an entry.

Examples:

* Why Next.js was chosen
* Why a particular styling approach was chosen
* Why a CMS was or wasn't used
* Why GSAP was used for a particular animation
* Why a component was abstracted
* Why a dependency was rejected
* Why a particular SEO strategy was used
* Why a Webflow feature was implemented differently

Use a simple format:

```text
# ADR-001 — Example Decision

Date:
YYYY-MM-DD

Decision:
Use X instead of Y.

Context:
Why this decision was necessary.

Reason:
Why X was selected.

Alternatives:
Y
Z

Trade-offs:
What we gain and what we give up.
```

Number decisions sequentially.

---

# CHANGELOG

Create:

`/docs/changelog.md`

Maintain a human-readable changelog throughout the project.

Group changes by phase.

Example:

```text
# Changelog

## Phase 2 — Initial Next.js implementation

### Added
- Next.js application structure
- Home page
- Navigation
- Project cards

### Changed
- Webflow navigation recreated using React
- Webflow interactions replaced with CSS transitions

### Fixed
- Mobile navigation overflow

## Phase 3 — Architecture refinement

### Improved
- Reusable project components
- Image loading
- Client/server component boundaries
```

Do not document every tiny code edit.

Document meaningful changes.

---

# LEARNING NOTES

Because this project is also being used as a learning project, maintain:

`/docs/learning-notes.md`

Whenever we encounter something technically important or educational, document it.

Examples:

* Why a component needs `"use client"`
* How Next.js routing works
* Why a particular rendering strategy was selected
* How server/client boundaries work
* How images are optimized
* How environment variables work
* How Vercel deployment works
* How DNS connects the domain to Vercel
* How SEO metadata is generated
* How Webflow concepts map to React/Next.js concepts

Keep explanations concise but clear enough that I can understand them later without having to rediscover the concept.

---

# TROUBLESHOOTING / PROBLEM LOG

Create:

`/docs/troubleshooting.md`

Whenever we encounter a meaningful problem, document:

1. Problem
2. Symptoms
3. Cause
4. Investigation
5. Solution
6. Prevention
7. Related files

Do not document trivial syntax errors unless they reveal something useful.

This should become a searchable knowledge base for future projects.

---

# ASSET DOCUMENTATION

Maintain an asset inventory when useful.

Document:

* asset name
* location
* purpose
* source
* dimensions where relevant
* optimization status
* whether it originated from Webflow
* whether it was recreated

Do not duplicate assets unnecessarily.

---

# CODE COMMENTS

Do not fill the codebase with unnecessary comments.

Prefer self-explanatory code.

Add comments when:

* the reasoning is non-obvious
* a workaround exists
* a Webflow behavior requires special handling
* a performance decision is intentional
* an unusual implementation is required
* future developers might otherwise "fix" something that appears unusual

Explain **why**, not merely **what**.

---

# CONTINUOUS DOCUMENTATION RULE

After completing each meaningful task:

1. Update the relevant documentation.
2. Update the changelog if appropriate.
3. Record important architectural decisions.
4. Record meaningful problems and their solutions.
5. Keep documentation synchronized with the actual code.

Do not allow documentation to describe an architecture that no longer exists.

---

# BEFORE MAJOR CHANGES

Before making a significant architectural change:

1. Explain the proposed change.
2. Identify affected documentation.
3. Implement the change.
4. Update documentation immediately afterward.

---

# DOCUMENTATION QUALITY STANDARD

The documentation should allow me, months later, to answer questions such as:

* "Where does this content come from?"
* "Which component controls this section?"
* "Why did we build this this way?"
* "Where is this animation configured?"
* "How do I change this typography?"
* "How do I add another project?"
* "How do I modify the navigation?"
* "How do I deploy this?"
* "How does the domain connect to Vercel?"
* "Why isn't this component a server component?"
* "Why did we choose this CMS?"
* "What changed during the Webflow migration?"
* "What problems did we encounter?"
* "How did we solve them?"

If the documentation cannot answer these questions, improve it.

---

# IMPORTANT

The documentation is part of the final deliverable.

At the end of the project, verify that:

* `/docs/README.md` is current
* architecture documentation matches the actual implementation
* routes are documented
* major components are documented
* design system is documented
* animations are documented
* SEO is documented
* deployment is documented
* migration decisions are documented
* important decisions are recorded
* troubleshooting notes are captured
* changelog is current
* learning notes contain the most useful concepts encountered

The goal is not to produce huge amounts of documentation.

The goal is to create a **searchable, accurate technical memory of the project** that I can rely on when maintaining or extending Billodesign in the future.

# PHASE 7 — PERFORMANCE, SEO & EXPERIENCE OPTIMIZATION

After Phase 6 is complete and the visual design has been intentionally refined, perform a dedicated optimization pass.

This phase must evaluate the website as a real production website rather than optimizing only for synthetic scores.

The goal is:

> **Improve performance and SEO without sacrificing the visual identity, interaction quality, or core user experience of Billodesign.**

---

# CRITICAL: THE SPLINE 3D ORB

The existing website contains an interactive **Spline 3D orb**.

This is one of the most important visual and interactive elements of the portfolio.

It should NOT be removed simply because it negatively affects performance metrics.

The orb contributes significantly to:

* visual identity
* differentiation
* first impression
* visitor engagement
* perceived design/technical capability
* the overall character of the portfolio

Treat it as a **core product experience**, not decorative content.

The objective is to make the orb as efficient as reasonably possible.

---

## Spline Optimization Investigation

Before considering any replacement, investigate whether the existing Spline implementation can be optimized.

Evaluate:

### Loading

* when the Spline scene begins loading
* whether loading can be deferred appropriately
* whether it blocks critical rendering
* whether it can load after important above-the-fold content
* whether it can be initialized after the page becomes interactive
* whether a loading placeholder would improve perceived performance

### Asset optimization

Inspect the Spline scene for:

* unnecessary geometry
* excessive polygon counts
* large textures
* unnecessary materials
* unnecessary objects
* excessive lighting complexity
* expensive effects
* unnecessary animations
* excessive resolution
* unused scene elements

Determine whether the scene itself can be optimized without changing its visual character.

### Runtime performance

Investigate:

* CPU usage
* GPU usage
* memory usage
* frame rate
* animation cost
* interaction cost
* mobile performance
* desktop performance

Pay particular attention to mobile devices and lower-powered hardware.

---

# DO NOT OPTIMIZE ONLY FOR LIGHTHOUSE

Performance scores are useful signals, but they are not the only goal.

Consider:

* Core Web Vitals
* real loading experience
* perceived performance
* interaction responsiveness
* animation smoothness
* mobile usability
* network cost
* JavaScript execution
* CPU/GPU workload

A technically higher Lighthouse score is not automatically an improvement if achieving it makes the portfolio less engaging.

---

# Explore Alternatives — Without Automatically Replacing Spline

If the Spline implementation remains expensive after optimization, investigate technically viable alternatives.

Possible approaches may include:

* optimized Spline implementation
* lazy initialization
* delayed loading
* reduced scene complexity
* optimized textures
* lower-resolution assets where visually acceptable
* static poster/fallback before interaction
* progressively enhancing the 3D experience
* lightweight WebGL implementation
* Three.js
* React Three Fiber
* custom shader-based implementation
* pre-rendered visual combined with selective interaction

Do NOT replace Spline simply because another technology is theoretically faster.

Compare alternatives based on:

1. Visual fidelity
2. Interaction quality
3. Performance
4. Development complexity
5. Maintainability
6. Mobile behavior
7. Accessibility
8. Bundle/runtime cost
9. Future flexibility

If an alternative cannot reproduce the important qualities of the orb without significant loss, keep Spline and optimize the existing implementation.

---

# Progressive Enhancement Strategy

Consider whether the experience can be structured in layers.

For example:

### Layer 1 — Immediate visual experience

Show an optimized static representation/poster of the orb immediately.

### Layer 2 — Interactive experience

Load the full 3D experience when appropriate.

### Layer 3 — Enhanced interaction

Enable more expensive interactions only when the device/browser can reasonably support them.

However, do not implement this automatically.

First determine whether the additional complexity provides a meaningful benefit.

---

# Mobile Performance

Evaluate the 3D experience separately on:

* modern desktop
* average laptop
* modern mobile
* lower-powered mobile

If necessary, consider adaptive quality.

Examples:

* lower rendering quality
* simplified scene
* reduced animation
* reduced interaction frequency
* delayed initialization

The orb should remain recognizable and visually meaningful.

---

# Performance Audit

Perform a complete performance audit covering:

## Loading

* HTML
* CSS
* JavaScript
* fonts
* images
* Spline
* third-party scripts
* analytics

## Rendering

* layout shifts
* large paint areas
* expensive animations
* unnecessary re-renders
* client-side JavaScript
* hydration cost

## Images

Check:

* dimensions
* compression
* formats
* lazy loading
* responsive sizing
* priority loading

## Fonts

Check:

* font loading strategy
* font formats
* font weights
* unused weights
* layout shift

## JavaScript

Check:

* bundle size
* client components
* unnecessary dependencies
* third-party scripts
* hydration
* unused JavaScript

## Animation

Check:

* transform/opacity usage
* layout-triggering properties
* scroll handlers
* GSAP usage
* animation lifecycle
* reduced-motion behavior

---

# SEO AUDIT

Perform a dedicated SEO pass after the site is visually complete.

Check:

### Technical SEO

* title tags
* meta descriptions
* canonical URLs
* robots.txt
* sitemap.xml
* HTTP status codes
* redirects
* 404 behavior
* URL structure
* indexing directives

### On-page SEO

* H1 hierarchy
* heading structure
* descriptive text
* image alt text
* internal linking
* semantic HTML

### Social metadata

* Open Graph
* Twitter/X cards
* preview images
* titles
* descriptions

### Structured data

Determine whether structured data is appropriate for the portfolio.

Do not add schema merely for the sake of adding schema.

### Performance and SEO relationship

Identify whether performance problems are likely to affect:

* Core Web Vitals
* crawlability
* rendering
* user experience
* search visibility

---

# Accessibility Audit

As part of this optimization phase, check:

* keyboard navigation
* focus states
* semantic HTML
* color contrast
* image alt text
* form labels
* button/link semantics
* reduced motion
* screen-reader behavior
* interactive 3D accessibility

The Spline orb must not become the only way to understand important information.

Important content should remain accessible without interacting with the 3D element.

---

# BENCHMARK BEFORE AND AFTER

Before making major optimizations, establish a baseline.

Record relevant measurements such as:

* Lighthouse Performance
* Lighthouse SEO
* Lighthouse Accessibility
* Core Web Vitals where available
* page weight
* JavaScript size
* image weight
* Spline-related network/runtime cost
* initial load behavior

Then compare after optimization.

Do not optimize based on assumptions when measurements can answer the question.

---

# OPTIMIZATION DECISION LOG

For every significant optimization, document:

### Problem

What was slow or inefficient?

### Evidence

What measurement or observation identified it?

### Solution

What was changed?

### Result

What improved?

### Trade-off

What was sacrificed, if anything?

### Decision

Was the change kept or reverted?

Example:

```text id="6m3pqa"
Problem:
Spline increased initial loading cost.

Evidence:
Large network payload and delayed interactivity.

Experiment:
Deferred Spline initialization until after critical page content loaded.

Result:
Improved initial page responsiveness while preserving the interactive orb.

Decision:
Keep.
```

---

# PERFORMANCE BUDGET

After establishing a realistic baseline, propose reasonable performance budgets.

Do not invent arbitrary targets before measuring the application.

Consider budgets for:

* initial JavaScript
* images
* fonts
* third-party scripts
* Spline assets
* total page weight

The Spline experience should have its own explicit budget because it is a deliberate part of the design.

---

# FINAL OPTIMIZATION REVIEW

At the end of Phase 7, produce:

## Performance report

Include:

* before/after measurements
* biggest performance bottlenecks
* changes made
* Spline optimization results
* remaining limitations
* mobile performance findings

## SEO report

Include:

* current SEO implementation
* issues found
* fixes
* remaining opportunities

## Accessibility report

Include:

* issues found
* fixes
* remaining limitations

## Final recommendations

Separate recommendations into:

### Implemented

Changes already made.

### Optional

Improvements that may be useful but are not currently necessary.

### Rejected

Potential optimizations that were tested or considered but rejected because they harmed the experience or provided insufficient benefit.

---

# IMPORTANT PRINCIPLE

Never sacrifice Billodesign's defining visual experiences simply to achieve a better performance score.

The goal is not:

> "Make the website as technically lightweight as possible."

The goal is:

> **"Make the website as fast and efficient as possible while preserving the experience that makes Billodesign memorable."**

The interactive Spline orb is part of that experience.

Optimize it intelligently before considering replacement.
