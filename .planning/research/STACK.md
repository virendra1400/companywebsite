# Stack Research

**Domain:** Premium multi-language (EN/AR-RTL/FR/RU) B2B corporate + lead-gen site for an India-based agro/food exporter — headless CMS, scalable product catalog, RFQ + WhatsApp lead capture, strong technical SEO.
**Researched:** 2026-07-14
**Confidence:** HIGH (framework/i18n/forms/hosting) / MEDIUM (CMS RTL admin polish, WhatsApp integration depth)

## Benchmark context (not part of the stack, informs the bar)

- **piyushfarms.com** (client-provided inspiration): WordPress (`/wp-content/` paths, agency footer credit "MaMITs"), English-only, no locale switcher. Clean but mid-market template polish — duplicated sections, no RTL/i18n, no headless CMS. This is the floor to clear, not the ceiling.
- **staragrevolution.com** (client's own domain): currently a Squarespace "coming soon" holding page — no content, no forms, no multi-language, nothing to migrate. Effectively a greenfield build; only implication is a DNS/domain cutover from Squarespace to the new hosting target when launching.

Neither reference site solves multi-locale, RTL, headless content ops, or structured product data — confirming this project needs a purpose-built stack rather than a page-builder/WordPress approach.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js (App Router) | 16.2.x (LTS) | React meta-framework: SSR/SSG/ISR, routing, metadata API | Best-in-class hybrid rendering for SEO: static generation for marketing/product pages (fast TTFB, perfect Lighthouse/Core Web Vitals), file-based `sitemap.ts`/`robots.ts`/`generateMetadata` for hreflang and JSON-LD without hand-rolled plumbing, and a huge hiring pool. It is the de facto standard for content-driven, SEO-critical React sites in 2025-2026. |
| React | 19.x | UI runtime (paired with Next 16) | Required by Next 16; Server Components reduce client JS shipped per locale, which matters when serving 4x the markup/translations. |
| TypeScript | 5.x, strict mode | Type safety across app + CMS | Payload CMS (below) is TypeScript-native — sharing types between CMS schema and frontend queries eliminates a whole class of "field renamed, page broke" bugs, important with non-technical editors changing content structures over time. |
| next-intl | 4.13.x | i18n routing, message catalogs, `useTranslations`, RSC-aware | The community-standard i18n library for the App Router since Next.js dropped built-in i18n routing. Supports Server Component translation (no client-side i18n bundle bloat), locale-prefixed routing (`/en`, `/ar`, `/fr`, `/ru`), typed message keys, and per-locale number/date formatting — all needed for a real 4-locale SEO site. `next-i18next` is the legacy Pages-Router equivalent; do not use it with App Router. |
| Tailwind CSS | v4.x | Styling | CSS-first config (`@theme`, no `tailwind.config.js`), native support for CSS logical properties (`ms-*`/`me-*`/`ps-*`/`pe-*` instead of `ml-*`/`mr-*`) and an `rtl:`/`ltr:` variant — this is the single biggest lever for building **one** layout that mirrors correctly for Arabic instead of maintaining parallel LTR/RTL stylesheets. |

### Headless CMS — the pivotal decision

**Primary recommendation: Payload CMS (self-hosted, v3.86.x)**

| Requirement | How Payload addresses it |
|---|---|
| 4 locales incl. Arabic, non-technical editors | Native `localization` config with unlimited locales, per-field or per-document localization, and a configurable **fallback locale** (show English automatically until a translator fills in Arabic/French/Russian) — directly matches "content is almost nothing yet, translations arrive over time." |
| Non-technical staff editing | Admin UI is a generated React app per your schema — you design collections (Products, Categories, Certifications) with plain-language field labels/grouping/tabs, so editors never see code. Rich text uses a built-in Lexical editor. |
| Scalable product catalog | Collections + relationships (Product → Category, Product → Certification) model a growing catalog natively; adding a field or a new product type is a schema change, not a rebuild of the frontend. |
| TypeScript-native, installs into the Next.js app | Payload 3 runs as part of the same Next.js codebase (or standalone) — one deploy target, one language, generated TypeScript types for every collection consumed directly by frontend queries. |
| Cost at scale | Self-hosted, open-source (MIT) — cost is infra only (Postgres + object storage), flat as the catalog and locale count grow. No per-locale or per-seat CMS billing, which matters for a company scaling its catalog and adding languages over time. |

**Known limitation (flag, not a blocker):** As of 2025, Payload's **admin dashboard chrome** does not fully flip to RTL when Arabic is selected as the *admin UI language* (open GitHub issues #9482, #11162, #10344) — locale dropdown position, document `dir` attribute defaults, etc. This is cosmetic to the *admin shell*, not to content editing: an Arabic-speaking editor can still type and see Arabic text correctly inside any text field regardless of the surrounding panel's direction (same as editing Arabic content in Gmail or WordPress, both LTR-chrome tools). **Verify with a throwaway Arabic collection early in build (Phase 1) before committing further** — this is exactly the kind of thing that should get a phase-specific research/spike flag on the roadmap.

**Strong alternative: Strapi (v5, self-hosted)** — i18n is now core (not a bolt-on plugin as in v4), most mature/battle-tested open-source CMS in this category, huge plugin ecosystem, admin UI already localized into 30+ languages. Same RTL-admin-chrome caveat as Payload. Choose this over Payload if the team wants the safest, most "boring," most-documented option and is not committed to a Next.js-embedded architecture (Strapi is a separate Node service, not embedded in the frontend app).

**Consider if budget allows a SaaS CMS and visual page-building matters more than flat cost:**
- **Storyblok** — best-in-class visual/component editor, genuinely easiest for non-technical marketing staff to rearrange page sections without a developer; Arabic supported via AI Translations. Subscription pricing (locale/space limits tied to plan) and no confirmed RTL admin support found in current docs — worth a vendor question before choosing. Best fit if "non-technical staff editing" specifically means drag-and-drop marketing pages, not just filling in structured product fields.
- **Sanity** — most flexible schema/content modeling (`sanity.io`), unlimited locales on the free tier, real-time collaborative Studio. Localization is DIY (you design the internationalized-document pattern yourself), which means more upfront developer setup but total control — a good choice if the roadmap anticipates heavy custom content modeling beyond products (e.g., dynamic landing pages per market).

**What NOT to use for the CMS layer:** WordPress + WPML/Polylang. It is the piyushfarms.com benchmark's stack and explicitly the floor to clear — plugin-stacked multilingual WordPress is notoriously fragile for RTL (theme CSS rarely mirrors correctly), slow without heavy caching investment, and a poor match for "headless, scalable catalog, non-technical editors" as first-class requirements rather than retrofits.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-hook-form | 7.81.x | RFQ/inquiry form state management | Every form on the site (general inquiry, per-product RFQ) — minimal re-renders, works cleanly with Server Actions. |
| zod | 4.4.x | Schema validation for form payloads | Shared validation schema between client (`@hookform/resolvers/zod`) and the Next.js Server Action that processes the submission — one source of truth for "what makes a valid RFQ." |
| Next.js Server Actions (built-in) | — | Form submission handling | No separate API routes needed; submit RFQ/inquiry forms directly to a server action that validates (Zod), sends email (Resend), and optionally posts to a CRM webhook. |
| Cloudflare Turnstile | current (`@marsidev/react-turnstile` or official snippet) | Spam/bot protection on public forms | Free, privacy-friendly, no puzzle-solving UX friction (unlike reCAPTCHA) — appropriate for a B2B site where a bad bot-challenge UX can cost a real buyer's inquiry. Pair with a honeypot field as a zero-cost first layer. |
| Resend + React Email | current | Transactional email for RFQ/inquiry notifications | Modern email API, React-based templates keep the "New RFQ from X" internal notification and any buyer confirmation email in the same codebase/language as the rest of the app. |
| next-sitemap (or hand-rolled `sitemap.ts`) | current | Sitemap generation across 4 locales | For a catalog that grows (products/categories), automating sitemap + hreflang entries from the CMS data source avoids a class of "forgot to add the French version to the sitemap" SEO bugs. Next.js's native `app/sitemap.ts` is sufficient at this scale; reach for `next-sitemap` only if the catalog grows large enough to need incremental/split sitemaps. |
| @payloadcms/storage-s3 (or Cloudinary) | current | Product photo / certificate PDF storage & optimization | Certificates (PDF) and manufacturing/product photography need reliable, CDN-backed storage independent of the app server; pairs with `next/image` for responsive, optimized delivery. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint + Prettier | Lint/format | Standard; use `eslint-config-next`. |
| Google Search Console + Bing Webmaster Tools | SEO monitoring | Free, mandatory for verifying hreflang/sitemap indexing per locale — set up from day one, not after launch. |

## WhatsApp Integration

**Recommendation: start with a `wa.me` click-to-chat link / lightweight floating widget — not the WhatsApp Business Platform (Cloud) API.**

- The stated requirement is "instant-contact secondary CTA," i.e., a low-friction escape hatch for buyers who don't want to fill a form. A `https://wa.me/<number>?text=<prefilled message>` button or a small floating widget component (self-built, ~one component) fully satisfies this with zero backend, zero recurring cost, and zero approval process.
- The full WhatsApp Business Platform (Cloud API) adds chatbot automation, CRM sync, and per-message billing (Meta moved to per-message pricing in July 2025) — genuinely valuable if/when the company wants automated lead triage or WhatsApp broadcast campaigns, but that is a distinct, later capability, not a stack requirement for launch. Building it now would be solving a problem the project doesn't have yet.
- **If/when justified later:** integrate via a provider (e.g., Twilio, Infobip, or Meta directly) — flag this as a candidate for its own phase/research spike if the roadmap later calls for WhatsApp automation, since API approval + template-message compliance is nontrivial.

## Hosting / Deployment

**Recommendation: Vercel.**

- Zero-config deploys for Next.js (same company that builds Next.js — first-class support for ISR, ISR revalidation on CMS webhook, ppr/streaming), global edge network reduces latency for the stated international audience (GCC, Europe, North America, Africa, SE Asia, CIS) without any manual multi-region setup.
- Preview deployments per PR are valuable when non-technical stakeholders need to review content changes before go-live.
- Cost is predictable at this project's scale (marketing/lead-gen site, not a high-traffic SaaS app); the self-hosting cost advantage documented in 2025-2026 comparisons only materializes at sustained high load or when a team already has DevOps capacity — neither applies here.
- **Alternative:** self-hosted (Hetzner/DigitalOcean VPS + Coolify) if budget is the overriding constraint and the team accepts owning CI/CD, cache invalidation, and global CDN configuration (e.g., fronting with Cloudflare) themselves. Not recommended as the default for a small marketing team without dedicated DevOps.
- **Payload CMS hosting note:** since Payload runs inside the Next.js app, it deploys to the same Vercel project; only the database (Postgres — e.g., Neon or Supabase serverless Postgres) and file storage (S3-compatible) are separate infra pieces.

## Analytics

**Recommendation: Google Analytics 4 + Google Tag Manager, plus Google Search Console.**

- GA4 + GTM remains the default expectation for a B2B marketing/sales team (integrates with Google Ads for paid-channel attribution if ever run, standard reporting stakeholders already know, free).
- Because GA4 is cookie-based and the audience includes EU/GCC visitors, pair it with a consent management platform (e.g., Cookiebot, CookieYes, or Klaro) to stay GDPR-compliant — do not ship GA4 without a consent banner for EU traffic.
- **Alternative if the org wants to avoid consent-banner complexity entirely:** Plausible (cookieless, no personal data, no banner needed) as the primary analytics tool, with GA4 added later only if Google Ads attribution becomes necessary. This trades away GA4's deeper segmentation for simplicity and privacy-by-default — a reasonable call for a lead-gen site whose main KPI is "did they submit an RFQ/click WhatsApp," not deep behavioral analytics.
- **Not recommended as primary:** PostHog. Excellent product analytics (session replay, feature flags, group analytics) but that depth is built for product/SaaS usage analysis, not a brochure-style B2B lead-gen site — the org would pay in setup complexity for capabilities this project won't use. Fine as a later addition if the roadmap ever needs to analyze on-site funnel behavior in more depth than GA4 events provide.

## Installation

```bash
# Core app
npx create-next-app@latest --typescript --tailwind --app

# i18n
npm install next-intl

# Headless CMS (Payload, installed into the Next.js app)
npx create-payload-app@latest
npm install @payloadcms/db-postgres @payloadcms/storage-s3 @payloadcms/richtext-lexical

# Forms
npm install react-hook-form zod @hookform/resolvers
npm install @marsidev/react-turnstile   # Cloudflare Turnstile React binding
npm install resend @react-email/components

# SEO
npm install next-sitemap   # optional, only if native app/sitemap.ts outgrows a single file

# Dev
npm install -D eslint prettier eslint-config-next
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Payload CMS (self-hosted) | Strapi 5 | Team wants the most battle-tested/mature option and doesn't want the CMS embedded in the Next.js app; comparable localization capability and the same RTL-admin-chrome caveat. |
| Payload CMS (self-hosted) | Storyblok | Non-technical editors' primary need is visual drag-and-drop page composition (marketing landing pages), not structured product data entry; accept subscription cost and verify RTL editor support with Storyblok directly first. |
| Payload CMS (self-hosted) | Sanity | Content model is expected to grow well beyond a product catalog (many custom page types, heavy editorial workflows) and the team wants full control over the localization pattern rather than a built-in one. |
| Vercel | Self-hosted VPS + Coolify | Budget is the dominant constraint and the team has (or is willing to build) in-house DevOps capacity to own CDN, CI/CD, and cache invalidation. |
| GA4 + GTM | Plausible | Org prioritizes cookieless/no-consent-banner simplicity over deep segmentation and Google Ads attribution. |
| Cloudflare Turnstile | Google reCAPTCHA v3 | Only if the org already has deep reCAPTCHA/Google infrastructure investment elsewhere; otherwise Turnstile is the better default (less friction, more private). |
| `wa.me` click-to-chat | WhatsApp Business Platform (Cloud API) | The roadmap later calls for automated WhatsApp chatbot triage, CRM sync, or broadcast campaigns — treat as a separate future phase, not a launch requirement. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| WordPress + WPML/Polylang | The benchmark site's own stack; multilingual WordPress plugin stacks are fragile for true RTL mirroring, require heavy caching/plugin investment to hit good Core Web Vitals, and fight "headless + non-technical editors + scalable catalog" as first-class goals rather than retrofits. | Next.js + Payload/Strapi headless CMS (above) |
| `next-i18next` (Pages Router pattern) | Built for the old Pages Router; does not integrate cleanly with React Server Components in the App Router, forcing more client-side JS just to render translated text — directly hurts the "fast Core Web Vitals across 4 locales" requirement. | `next-intl` |
| Google reCAPTCHA v2/v3 as the only spam defense | Adds visible friction (v2) or opaque scoring with false positives (v3) that can silently block a real international buyer's inquiry — unacceptable when every RFQ is a potential high-value lead. | Cloudflare Turnstile + honeypot field |
| Building WhatsApp Business API automation at launch | Speculative need — the requirement is a low-friction contact CTA, not automated messaging; the Cloud API adds per-message billing, template-approval overhead, and integration work with no launch-time justification. | `wa.me` click-to-chat link / simple floating widget |
| AI/machine translation pipeline for published locale content | Explicitly out of scope per project constraints — MT quality is not credible for B2B trust-building copy in AR/FR/RU. | CMS fallback-to-English + human translation workflow filled in per field |
| Tailwind v3 `ml-*`/`mr-*` physical-direction utilities for layout | Requires a second, parallel RTL stylesheet or manual `[dir=rtl]` overrides for every directional class — doubles styling effort across 4 locales. | Tailwind v4 logical properties (`ms-*`/`me-*`/`ps-*`/`pe-*`) + `rtl:`/`ltr:` variants |

## Stack Patterns by Variant

**If the CMS content model stays close to "products + categories + certifications + pages" (current scope):**
- Use Payload CMS, self-hosted alongside the Next.js app.
- Because the structured/relational nature of a product catalog is exactly what Payload's collections+relationships model is built for, and staying self-hosted keeps cost flat as the catalog grows.

**If the roadmap later expands into many bespoke marketing landing pages per target market (GCC campaign page, Africa campaign page, etc.) built/edited without developer involvement:**
- Add or move to Storyblok's visual editor for those page types (can coexist with Payload for structured product data if needed).
- Because visual/component-based page building is Storyblok's specific strength, whereas structured collections are Payload's.

**If Arabic-admin-chrome RTL polish turns out to matter to the actual editorial team (not just content, but the surrounding dashboard direction) after the Phase 1 spike:**
- Re-evaluate Strapi or Storyblok specifically on that axis before committing further engineering to Payload workarounds.
- Because this is a real, currently-open limitation across the major open-source CMS options in 2025-2026, not something to solve with custom engineering when a competitor product may already handle it better.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 16.2.x | React 19.x | Required pairing; Next 16 requires React 19. |
| Payload CMS 3.86.x | Next.js 15/16 (App Router) | Payload 3 is built to install directly into a Next.js app's `app/(payload)` route group — confirm the specific Next.js version pinned in Payload's own peer-dependency range at install time, as Payload tracks Next.js releases closely. |
| next-intl 4.13.x | Next.js 13.4+ (App Router, RSC) | Requires the App Router; do not use with Pages Router (use `next-i18next` there instead, though that combination is legacy and not recommended for a new project). |
| Tailwind CSS v4 | PostCSS-free build via `@tailwindcss/postcss` or Vite plugin | Config migration from v3 is nontrivial (no `tailwind.config.js`) — irrelevant here since this is greenfield, but note for any imported starter templates that assume v3. |
| Zod 4.x | @hookform/resolvers (latest) | Confirm resolver package version supports Zod 4's changed error format if copying older tutorial code that assumes Zod 3. |

## Sources

- next-intl official docs (`next-intl.dev`) — App Router setup, RSC translation pattern — HIGH confidence
- Payload CMS official docs (`payloadcms.com/docs/configuration/localization`, `/docs/configuration/i18n`) — localization/fallback-locale behavior — HIGH confidence
- Payload CMS GitHub issues #9482, #11162, #10344 — RTL admin-panel limitations — HIGH confidence (primary source, current open issues)
- Strapi 5 official docs (`docs.strapi.io/cms/features/internationalization`) — i18n core in v5, RTL admin limitation stated directly in docs — HIGH confidence
- Storyblok official docs (`storyblok.com/docs/concepts/internationalization`, AI Translations docs) — localization capability; RTL admin support unconfirmed — MEDIUM confidence (gap acknowledged)
- Tailwind CSS v4 official blog (`tailwindcss.com/blog/tailwindcss-v4`) — logical properties, CSS-first config — HIGH confidence
- npm registry (next-intl, payload, react-hook-form, zod) — current published versions as of July 2026 — HIGH confidence
- WebSearch aggregate on Vercel vs self-hosted Next.js hosting 2025-2026 comparisons — cost/latency tradeoffs — MEDIUM confidence (multiple secondary sources agree, not vendor-primary for the cost claims)
- WebSearch aggregate on GA4/Plausible/PostHog B2B comparisons (PostHog blog, industry comparison posts) — MEDIUM confidence
- WebSearch aggregate on WhatsApp Business Platform pricing change (July 2025 per-message model) — MEDIUM confidence, worth re-verifying against Meta's current developer docs before any Phase-level WhatsApp API commitment
- WebFetch of piyushfarms.com and staragrevolution.com (client-provided benchmark/own-domain) — direct observation — HIGH confidence

---
*Stack research for: Premium multi-language B2B corporate + lead-gen site (agro/food export)*
*Researched: 2026-07-14*
