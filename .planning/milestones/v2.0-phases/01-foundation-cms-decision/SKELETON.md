# Walking Skeleton — Star Agrevolution Website

**Phase:** 1
**Generated:** 2026-07-14

## Capability Proven End-to-End

A visitor can load the home page at any of the four locale URLs (`/`, `/ar`, `/fr`, `/ru`) — each with correct server-set direction (RTL for Arabic), per-script IBM Plex fonts, non-mirrored numerals, and working locale switching — where the hero content is read live from a Payload CMS global (field-level localized, English fallback with a visible notice), all running on a deployed EU-region Vercel preview.

## Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Framework | Next.js 16.2.x App Router + React 19 + TypeScript strict | Locked stack (STACK.md); best-in-class hybrid rendering + SEO; App Router required by next-intl v4 and Payload 3. |
| i18n | next-intl 4.13.x, path-prefix `localePrefix: 'as-needed'` (en at root, /ar//fr//ru/) | D-05; standard App Router i18n; SEO consolidation on a single domain. |
| RTL | Tailwind v4 native logical properties + `rtl:` variant; `dir`/`lang` set server-side in the locale layout; `numberingSystem:'latn'` on formatter calls | FOUND-03; no `tailwindcss-logical` plugin needed in v4; RTL architected from the first component, never a JS flip. |
| Fonts | IBM Plex Sans (latin) + IBM Plex Sans Arabic (arabic) via `next/font/google`, subset per script | UI-SPEC; single designed type system across Latin/Arabic/Cyrillic; self-hosted + preloaded, only the needed subset per locale. |
| CMS | Payload CMS 3.86 (self-hosted, embedded in the Next.js app), field-level `localized: true`, `fallback: true` | D-01; single codebase/deploy; native field-level localization with English fallback (NOT the Sanity-style document-split model). |
| Data layer | `@payloadcms/db-postgres` (postgresAdapter, explicit connection string) → EU-region managed Postgres (Neon/Supabase eu-central-1) | Pitfall 4 — avoid deprecated `db-vercel-postgres`; D-04 EU residency. |
| Media storage | `@payloadcms/storage-s3` → EU S3-compatible bucket (Cloudflare R2 EU-jurisdiction or AWS S3 eu-central-1) | D-04; CDN-backed asset delivery independent of the app server. |
| Auth | Payload built-in `auth: true` on Users, cookie JWT sessions, admin/editor roles with `roles.update` locked to admin | ASVS V2/V4; never hand-roll auth or password hashing. |
| On-demand ISR | Payload `afterChange` hooks call `revalidatePath` directly (no external webhook — Payload is in-process) | CMS-03; no rebuild on content change. |
| Deployment | Vercel preview/prod, function region pinned to EU (fra1) | D-03; zero-config Next.js deploys; EU residency for compute path. |
| Directory layout | `src/app/(payload)/` (generated, vendored) + `src/app/(site)/[locale]/`; `src/i18n/*`, `src/collections/*`, `src/globals/*`, `src/components/chrome/*`, `src/lib/*` | RESEARCH Recommended Project Structure; chrome strings in `i18n/messages/` NEVER hold CMS content. |

## Stack Touched in Phase 1

- [x] Project scaffold — Next.js 16 + Tailwind v4 + TS strict + shadcn + Vitest + Playwright (Plan 01)
- [x] Routing — path-prefix locale routing for 4 locales, real `/`, `/ar`, `/fr`, `/ru` routes (Plan 01)
- [x] Database — real read AND write: Payload writes localized Home content to EU Postgres via `/admin`; pages read it via `getHomeContent` (Plans 02, 03)
- [x] UI — interactive LanguageSwitcher + MobileNavPanel wired to next-intl navigation; home page renders CMS content (Plan 03)
- [x] Deployment — deployed to a Vercel EU-region preview environment (Plan 04)

## Out of Scope (Deferred to Later Slices)

- Real marketing/trust pages (homepage sections, About, Contact, Certifications, Manufacturing, Export Track Record, Company) — Phase 2.
- Product catalog collections, category browsing, product detail pages — Phase 3.
- RFQ/inquiry forms, spam defense (Turnstile/honeypot/rate-limit), transactional email (Resend), CRM webhook stub, WhatsApp CTA, analytics events — Phase 4.
- SEO metadata/hreflang/sitemaps/structured data, blog/insights section — Phase 5.
- Core Web Vitals hardening, media lazy-load/optimization, native-Arabic-reader RTL QA against real content — Phase 6.
- Full premium page-level visual design / design system — Phase 2 `/gsd-ui-phase`.
- Additional-locale content go-live (professional ar/fr/ru translations) — post-launch per FOUND-02.
- Routed stubs for pages other than the ONE placeholder home page — Phase 2 (D-07 bare shell).

## Subsequent Slice Plan

Each later phase adds vertical slices on top of this skeleton without renegotiating the decisions above:

- Phase 2: Homepage + trust/marketing pages as Payload page-builder blocks (reusing the chrome, locale layout, and CMS localization pattern).
- Phase 3: Product/Category collections + catalog index and product detail pages (reusing field-level localization + on-demand revalidation).
- Phase 4: Lead-conversion forms + WhatsApp + analytics (Server Actions, Zod, Resend, Turnstile — new surfaces, same deploy).
- Phase 5: SEO infrastructure driven by CMS published-translation status + blog collection.
- Phase 6: Performance + cross-locale RTL QA hardening against the first real content batch.
