---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: Premium Redesign
current_phase: 10
current_phase_name: Hardening — performance, Core Web Vitals, accessibility, SEO deltas, cross-locale RTL QA
status: planning
stopped_at: Completed 09-01-PLAN.md
last_updated: "2026-07-30T08:13:53.995Z"
last_activity: 2026-07-30
last_activity_desc: Phase 09 complete, transitioned to Phase 10
progress:
  total_phases: 5
  completed_phases: 4
  total_plans: 14
  completed_plans: 14
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-14)

**Core value:** A first-time international buyer who has never heard of the company leaves the site trusting it enough to send a serious inquiry/RFQ.
**Current focus:** Phase 09 — motion-and-micro-interactions-reveal-stagger-hover-reduced-m

## Current Position

Phase: 10 — Hardening — performance, Core Web Vitals, accessibility, SEO deltas, cross-locale RTL QA
Plan: Not started
Status: Ready to plan
Last activity: 2026-07-30 — Phase 09 complete, transitioned to Phase 10

## Performance Metrics

**Velocity:**

- Total plans completed: 24
- Average duration: - min
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 04 | 5 | - | - |
| 05 | 5 | - | - |
| 06 | 2 | - | - |
| 07 | 3 | - | - |
| 08 | 4 | - | - |
| 09 | 5 | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 06 P01 | 20min | 3 tasks | 3 files |
| Phase 07 P01 | 15min | 1 tasks | 1 files |
| Phase 07 P02 | 23min | 2 tasks | 14 files |
| Phase 07 P03 | 36min | 2 tasks | 2 files |
| Phase 08 P01 | 10min | 2 tasks | 4 files |
| Phase 08 P02 | 12min | 2 tasks | 6 files |
| Phase 08 P03 | 89min | 3 tasks | 12 files |
| Phase 08 P04 | 95min | 2 tasks | 1 files |
| Phase 09 P01 | 44min | 3 tasks | 7 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: CMS + localization pattern (Payload field-level vs. Sanity/Strapi document-level) is an OPEN decision — resolve via spike inside Phase 1, before schema commitment.
- Roadmap: Payload Arabic RTL admin-chrome limitation (if Payload chosen) must be verified as cosmetic-only in Phase 1, not assumed away.
- Roadmap: hreflang, form spam/email-auth, and per-locale Core Web Vitals are built into their implementation phases (1, 4, 6), not deferred to launch-day polish.
- [Phase ?]: Copied .env/payload.db from main checkout into worktree (gitignored, dev-only) to run build/test verification end-to-end
- Phase 07 P01: Hero elevation: applied Phase 6's exact literal isFull-conditional class strings verbatim from 07-UI-SPEC.md Part 1 — no deviations
- Phase 07 P02: Built TrustBar/ExportProcess/Testimonials Payload blocks + renderers, registered end-to-end, regenerated payload-types.ts, committed an additive Postgres migration (stripped an unrelated pre-existing site_settings.site_name schema-drift line from the auto-generated diff to keep it scoped)
- [Phase ?]: Phase 07 P03: Composed homepage into 11-block trust narrative (TrustBar/MediaGallery+StatsBand Manufacturing teaser/ExportProcess/Testimonials interleaved with existing blocks); generalized injectFacilityPhotos to all pages' mediaGallery blocks
- [Phase ?]: Phase 08 P01: Applied Contract §1/§2/§3 class strings verbatim for card recipe convergence + tabular-nums; logged 5 pre-existing unrelated lint errors to deferred-items.md instead of fixing (out of scope)
- [Phase ?]: Phase 08 P02: Consolidated Button brand hover, accent focus ring, and dark-surface outline treatments into buttonVariants primitive (new outlineOnDark variant); stripped duplicated overrides from 8 call sites, keeping GlobalHeader's single-use outline-on-light WhatsApp treatment as a deliberate call-site override
- [Phase ?]: Phase 08 P03: Built the FAQ block end-to-end (Payload config, shadcn Accordion over the existing radix-ui package, single-collapsible card-less renderer, additive Postgres migration, seeded Contact-page content) -- closes 08-UI-SPEC Component Audit #9 scope gap; test assertion adjusted (not production code) to match Radix Accordion's verified closed-state Presence behavior
- [Phase ?]: Phase 08 P04: Verified merged Wave 1 output (lint/lint:rtl/typecheck/vitest/build/e2e) on the full tree; root-caused 16 e2e failures to 3 pre-existing unrelated bugs (GlobalFooter overflow, ContactForm label mismatch, nav-links test fragility) plus dev-server contention, none in Phase 8 files; obtained human live-render sign-off closing 08-UI-SPEC's one backstop item (outlineOnDark transparency, focus rings, card recipe, FAQ LTR/RTL)
- [Phase ?]: Phase 09 P01: Built motion foundation (useInView IntersectionObserver hook, Reveal/RevealItem client wrappers, tw-animate-css devDependency, globals.css float-in keyframes + no-JS guard); suppressed a new eslint-config-next 16 react-hooks/set-state-in-effect error with a scoped disable + rationale comment rather than a hydration-unsafe lazy useState initializer

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 1: CMS vendor/localization pattern is unresolved until the spike runs — Phase 2+ content-model work depends on this being settled first.
- Phase 4: CRM vendor is TBD (HubSpot/Zoho/Pipedrive) — form/webhook architecture keeps this behind one internal function so the choice doesn't block the phase, but should be settled with the business before or during Phase 4.
- All phases: real content (certs, photos, translations) doesn't exist yet — build against realistic-shaped placeholders; Phase 6 includes a first-real-content-batch validation checkpoint.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260723-duo | Rebrand company name Star Agrevolution → VNP Global (code defaults, metadata, seed copy, tests) | 2026-07-23 | 5d2b566 | [260723-duo-rebrand-company-name-star-agrevolution-t](./quick/260723-duo-rebrand-company-name-star-agrevolution-t/) |
| 260723-e35 | Simplify primary navigation 9 → 5 per brief (Products, About, Global Markets, Certifications, Contact) | 2026-07-23 | 94245f2 | [260723-e35-simplify-primary-navigation-from-9-items](./quick/260723-e35-simplify-primary-navigation-from-9-items/) |
| 260725-5ca | Fix invisible/low-contrast shadcn dropdown/popover/dialog components sitewide (bridge shadcn semantic tokens into Tailwind v4 @theme) | 2026-07-25 | 0bc53b5 | [260725-5ca-fix-invisible-low-contrast-shadcn-dropdo](./quick/260725-5ca-fix-invisible-low-contrast-shadcn-dropdo/) |
| 260725-5ho | Add a persistent floating WhatsApp action button sitewide (bottom-corner, additive to existing contextual CTAs) | 2026-07-25 | 66183f3 | [260725-5ho-add-a-persistent-floating-whatsapp-actio](./quick/260725-5ho-add-a-persistent-floating-whatsapp-actio/) |
| 260725-68r | Render Instagram and LinkedIn icons in the footer from the existing sameAs CMS field | 2026-07-25 | e3baaaa | [260725-68r-render-instagram-and-linkedin-icons-in-t](./quick/260725-68r-render-instagram-and-linkedin-icons-in-t/) |
| 260725-69i | Improve contact form captcha UX (three-state messaging) and add required-field indicators | 2026-07-25 | 8fa1ae5 | [260725-69i-improve-contact-form-captcha-ux-so-the-s](./quick/260725-69i-improve-contact-form-captcha-ux-so-the-s/) |
| 7 | Increase CMS logo size (BrandMark.tsx h-9 to responsive h-11/12/14) so brand mark is prominent across header/footer/mobile | 2026-07-25 | 77245da | — |
| 8 | Bump logo size further (h-12 lg:h-14) and add brightness-0 invert filter for footer/dark-background legibility | 2026-07-25 | 248a8e0 | — |
| 9 | Diagnosed and fixed the real logo-size root cause: uploaded SVG's viewBox was a full A4 export canvas with the actual mark occupying <20% of it, so no CSS height could make it look prominent. Recomputed a tight viewBox from the SVG's own path/text coordinates, replaced the SAME CMS Media doc in place via a one-time protected route (SiteSettings.logo relationship unaffected, zero visual content changed) | 2026-07-25 | f094040 | — |
| 10 | docs: fill CLAUDE.md Conventions/Architecture sections from codebase inspection | 2026-07-28 | 7609546 | — |
| 11 | chore: add typecheck script (tsc --noEmit) | 2026-07-28 | 6804109 | — |
| 12 | fix: exclude vendored .claude/ and .agents/ tooling from eslint scope (571 false-positive errors -> 5 real) | 2026-07-28 | 32227f2 | — |
| 260808-gag | Flip T-101 (design tokens) TODO -> DONE in TASK_BACKLOG.md — tokens already implemented in globals.css @theme, card just never flipped | 2026-08-08 | 846375e | [260808-gag-flip-t101-done](./quick/260808-gag-flip-t101-done/) |
| 260808-geu | Correct 2 stale TASK_BACKLOG.md cards found via direct production/code check: T-209 followup map confirmed live on vnpglobal.in (not "awaiting deploy"); T-203 product FAQs infra fully built, only content missing | 2026-08-08 | 322106f | [260808-geu-t209-t203-status-fix](./quick/260808-geu-t209-t203-status-fix/) |
| 260808-gvl | Fix Vercel ISR-write quota exhaustion (200k/mo free tier hit 100%, pre-launch): `revalidate = 60` on all 6 route files was redundant with on-demand hooks and, combined with ~40+ dev-cycle redeploys, caused a write storm — bumped to `revalidate = 3600` | 2026-08-08 | c59e4c2 | [260808-gvl-isr-write-fix](./quick/260808-gvl-isr-write-fix/) |
| 260808-qce | Reconciled external SEO/AEO doc into SEO_PLAYBOOK.md §10-11 (kept keyword-table shape + off-page checklist, rejected 4 conflicts with locked decisions); corrected stale "analytics still open" note (Plausible was already decided+built, ANALY-01); fixed .env.example missing 6+ real vars | 2026-08-08 | 0ff3be6 | [260808-qce-seo-doc-reconcile-analytics-audit](./quick/260808-qce-seo-doc-reconcile-analytics-audit/) |
| 260808-r1n | Found + fixed real gap in T-204's "technical SEO DONE" claim: 9 route types x 4 locales had zero page-specific metadata (generic site-wide fallback only). Added Pages.seo CMS field (+ migration) and generateMetadata to home/6-interior-pages/products-index/insights-index, fallback copy from each page's own approved hero content. 12/12 e2e regression pass | 2026-08-08 | 14c19cb | [260808-r1n-page-metadata-audit-fix](./quick/260808-r1n-page-metadata-audit-fix/) |
| 260808-rh9 | Found + fixed more severe bug while fixing r1n: buildAlternates() hardcoded canonical to English for every locale, actively suppressing ar/fr/ru pages from ranking once they have content (fr/ru UI already translated, so live not theoretical). Threaded required locale param through 6 call sites + sitemap.ts. 2 new regression tests. 5 pre-existing test failures confirmed unrelated via git-stash comparison | 2026-08-08 | f0a5c7d | [260808-rh9-canonical-locale-fix](./quick/260808-rh9-canonical-locale-fix/) |
| 260808-rmq | Closed out SEO_PLAYBOOK §4's structured-data checklist: added contactPoint (tel/email/availableLanguage) to Organization JSON-LD and a new WebSite schema on home, neither ever implemented despite email/phone already being fetched at every call site. 3 new unit tests, 8/8 pass | 2026-08-08 | d6729f8 | [260808-rmq-jsonld-contactpoint-website](./quick/260808-rmq-jsonld-contactpoint-website/) |
| 260808-s68 | T-202 Resources Hub built per P-09/C-16 spec: /resources page aggregating SiteSettings.resourceDocuments (new field) + Certifications.certificatePdf + Products.downloads into one ungated document list, spec_download analytics event, footer nav + 4-locale i18n. Full regression clean | 2026-08-08 | 7c05233 | [260808-s68-resources-hub-t202](./quick/260808-s68-resources-hub-t202/) |

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-07-29T16:46:44.740Z
Stopped at: Completed 09-01-PLAN.md
Resume file: None
