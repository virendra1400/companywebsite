# Roadmap: Star Agrevolution Website

## Overview

Six phases carry the site from a locale-and-CMS-correct foundation to a fully launched, performance-hardened, multi-language B2B lead-gen site. Phase 1 settles the two hardest-to-retrofit decisions first — locale/RTL architecture and the CMS + localization pattern (via spike) — because every later phase's content depends on both being right. Phases 2-3 then ship real, visible pages (marketing/trust surfaces, then the product catalog) in English against that foundation. Phase 4 turns visitors into leads (RFQ, inquiry, WhatsApp, analytics) once there's a catalog and pages to convert from. Phases 5-6 hard-code discoverability (SEO, blog) and correctness (performance, cross-locale RTL QA) as full-system passes once every page type exists, per the research's build-order and pitfalls guidance.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [x] **Phase 1: Foundation & CMS Decision** - Locale/RTL architecture live in 4 locales; CMS + localization pattern chosen via spike and running with a validated content model (completed 2026-07-20, retroactive closure — see 01-04-SUMMARY.md)
- [x] **Phase 2: Core Marketing Pages & Trust Surfaces** - Homepage, About, Contact, Certifications, Manufacturing, Export Track Record, Company pages live in English, CMS-driven (completed 2026-07-15)
- [x] **Phase 3: Product Catalog** - Category browsing and product detail pages, scalable via CMS without rebuilds (completed 2026-07-15)
- [x] **Phase 4: Lead Conversion — RFQ, Inquiry, WhatsApp, Analytics** - Visitors convert via forms/WhatsApp with spam defense, deliverable email, and tracked conversion events (completed 2026-07-21)
- [ ] **Phase 5: SEO Infrastructure & Insights/Blog** - Correct per-locale metadata/hreflang/sitemaps/structured data; blog section live
- [ ] **Phase 6: Performance & Cross-Locale RTL QA Hardening** - Core Web Vitals and native-Arabic-reader RTL correctness verified pre-launch

## Phase Details

### Phase 1: Foundation & CMS Decision

**Goal**: Visitors can browse a locale-aware, RTL-correct site skeleton in all 4 languages, and non-technical staff can create/edit localized content through a chosen, validated CMS.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, CMS-01, CMS-02, CMS-03, CMS-04
**Success Criteria** (what must be TRUE):

  1. Visitor can access the site at locale-specific URLs (en, ar, fr, ru) each rendering correct `dir="rtl"/"ltr"` and non-mirrored numerals for Arabic, responsive across phone/tablet/desktop.
  2. Visitor can switch locale from any page via a language switcher and land on the equivalent page in the new locale, preserving context.
  3. Only locales with published translated content are exposed to visitors; untranslated pages fall back to English per a defined rule rather than showing blank/broken pages.
  4. Non-technical staff can log into the chosen CMS admin UI and create/edit/publish a page, product, or certification (with per-locale field values and English fallback) without a developer or redeploy, including uploading media (images/PDFs), and adding a new item requires no code change/rebuild trigger.
  5. The CMS + localization pattern (Payload field-level vs. Sanity/Strapi document-level) has been resolved via a working spike prototype, and — if Payload is chosen — the Arabic RTL admin-chrome limitation has been verified as cosmetic-only (content editing itself unaffected).

**Plans**: 4 plans
Plans:

- [x] 01-01-PLAN.md — Scaffold + next-intl locale routing + RTL layout shell + test harness (Walking Skeleton foundation)
- [x] 01-02-PLAN.md — Payload CMS backend: EU Postgres, EU S3 media, localization + fallback, admin auth/RBAC, schema push
- [x] 01-03-PLAN.md — Premium chrome (header/footer/switcher/mobile nav/fallback notice) + wire home page to CMS content
- [x] 01-04-PLAN.md — Deploy to Vercel EU preview + D-02 Arabic admin glyph-rendering spike (go/no-go) — retroactive closure, D-02 risk-accepted not live-verified

**UI hint**: yes

### Phase 2: Core Marketing Pages & Trust Surfaces

**Goal**: A first-time visitor can browse the homepage and every trust-building page (about, certifications, manufacturing, export track record, company/compliance) in English, all sourced from CMS content with safe, realistic-shaped placeholders.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: PAGE-01, PAGE-02, PAGE-03, PAGE-04, TRUST-01, TRUST-02, TRUST-03, TRUST-04, TRUST-05, TRUST-06
**Success Criteria** (what must be TRUE):

  1. Visitor lands on a premium homepage communicating quality/reliability/compliance/global reach with clear CTAs to inquire/RFQ.
  2. Visitor can read the About/company story and reach a Contact page with an inquiry form, WhatsApp, email, phone, and physical/registered address.
  3. Visitor can view Certifications (ISO/HACCP/FSSAI/APEDA/organic/Halal — Halal featured prominently) with logos and downloadable PDF links, a Manufacturing/process page (photos/video, capacity, QC labs, cold-chain), and an Export Track Record page (countries-served map, years exporting, volume/shipment stats, incoterms).
  4. Every marketing/trust page renders through the same global header/footer with navigation, language switcher, and primary CTAs, consistently.
  5. All trust-page content is authored as CMS page-builder blocks with realistic-shaped placeholders (long strings, real-resolution images) so real assets slot in later without layout breakage.

**Plans**: TBD
**UI hint**: yes

### Phase 3: Product Catalog

**Goal**: A visitor can browse the product catalog by category and view detailed product pages, with the catalog able to grow with new products/categories without redesign.
**Mode:** mvp
**Depends on**: Phase 1, Phase 2 (shares header/footer/nav and CMS block pattern)
**Requirements**: CAT-01, CAT-02, CAT-03, CAT-04
**Success Criteria** (what must be TRUE):

  1. Visitor can browse products grouped by category from a catalog index page.
  2. Visitor can open a product detail page showing description, specifications, packaging, imagery, and applicable certifications.
  3. A staff member can add a new product or category via the CMS and it appears live without a code change or manual rebuild (ISR/webhook revalidation).
  4. Catalog pages render correctly with placeholder specs today and are structured to accept real specs later without template changes.

**Plans**: 3 plans
Plans:

- [x] 03-01-PLAN.md — Data backbone: Categories/Products collections, revalidate hooks, fetch helpers, i18n, seed, int tests
- [x] 03-02-PLAN.md — Catalog index /products grouped by category + ProductCard + nav wiring + e2e
- [x] 03-03-PLAN.md — Product detail /products/[slug]: gallery, SpecTable, cert badges, RFQ CTA + e2e

**UI hint**: yes

### Phase 4: Lead Conversion — RFQ, Inquiry, WhatsApp, Analytics

**Goal**: A visitor can convert into a qualified lead via a general inquiry form, a per-product RFQ form, or WhatsApp — every conversion tracked in analytics.
**Mode:** mvp
**Depends on**: Phase 1 (Settings/contact-channel data), Phase 3 (per-product RFQ pre-fill)
**Requirements**: LEAD-01, LEAD-02, LEAD-03, LEAD-04, LEAD-05, LEAD-06, LEAD-07, ANALY-01
**Success Criteria** (what must be TRUE):

  1. Visitor can submit a general inquiry (name, company, country, message) and a per-product RFQ (product, quantity, destination country, incoterm, message), both delivered to the sales inbox via authenticated transactional email (SPF/DKIM/DMARC configured on the sending domain).
  2. A scripted spam/bot submission (rapid-fire, no honeypot fill) is blocked or rate-limited before reaching the inbox.
  3. A stub CRM webhook fires on every valid submission so a real CRM can be wired later without form rework.
  4. Visitor can tap a WhatsApp click-to-chat CTA (`wa.me`) from anywhere on the site and open a pre-filled chat.
  5. Both RFQ/inquiry submissions and WhatsApp clicks appear as distinct, named conversion events in analytics.

**Plans**: 5/5 plans executed

- [x] 04-01-PLAN.md
- [x] 04-02-PLAN.md
- [x] 04-03-PLAN.md
- [x] 04-04-PLAN.md
- [x] 04-05-PLAN.md

**UI hint**: yes

### Phase 5: SEO Infrastructure & Insights/Blog

**Goal**: Every page is discoverable and correctly indexed per locale, and an insights/blog section exists for authority-building SEO content.
**Mode:** mvp
**Depends on**: Phase 1 (locale/translation-status data), Phase 2, Phase 3 (pages to describe)
**Requirements**: SEO-01, SEO-02, SEO-03, SEO-04, SEO-05, BLOG-01, BLOG-02
**Success Criteria** (what must be TRUE):

  1. Every page emits correct per-locale metadata (title, description, Open Graph), verifiable via view-source.
  2. Every localized page emits reciprocal hreflang tags plus exactly one `x-default`, generated from actual published-translation status (not hand-maintained), with zero conflicts against its canonical URL — verified with a crawl audit (e.g. Screaming Frog).
  3. An XML sitemap covering all locales and published pages is reachable and free of duplicate/conflicting canonical URLs.
  4. Organization, Product, and BreadcrumbList structured data validate on relevant pages via a rich-results test.
  5. Visitor can browse a blog/insights list and read an article, and staff can publish a new article per locale via the CMS.

**Plans**: 5 plans
Plans:

- [ ] 05-01-PLAN.md — Insights collection + revalidate hook + config registration + schema push (BLOG-02)
- [ ] 05-02-PLAN.md — SEO metadata lib: getTranslatedLocales + buildAlternates + buildMetadata + NEXT_PUBLIC_SITE_URL (SEO-01/02/05)
- [ ] 05-03-PLAN.md — Structured data lib: Organization/Product/BreadcrumbList JSON-LD + shared XSS-safe <JsonLd> + SiteSettings address/sameAs (SEO-04)
- [ ] 05-04-PLAN.md — Insights UI: /insights list + /insights/[slug] article + InsightCard + nav + i18n + latn dates + seed (BLOG-01)
- [ ] 05-05-PLAN.md — sitemap.ts + robots.ts + layout metadataBase/Org JSON-LD + product-detail metadata/Product+Breadcrumb JSON-LD (SEO-01/02/03/04/05)

**UI hint**: yes

### Phase 6: Performance & Cross-Locale RTL QA Hardening

**Goal**: The site is fast and visually correct for every locale on real devices before launch, validated against real (non-placeholder) content where available.
**Mode:** mvp
**Depends on**: Phase 2, Phase 3, Phase 5 (all page types must exist to audit)
**Requirements**: PERF-01, PERF-02, PERF-03
**Success Criteria** (what must be TRUE):

  1. Home, catalog, and product pages meet good Core Web Vitals (LCP/CLS/INP) on mobile and desktop, measured per locale — not English only.
  2. Images, video embeds, and PDF links are lazy-loaded/optimized (responsive images, no full-resolution originals shipped, no inline PDF viewers).
  3. A native Arabic reader confirms full RTL correctness (layout mirroring, numerals, mixed Arabic/English/incoterm text, icon direction) across every page type, checked against the first real content batch, not lorem-ipsum placeholders.

**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & CMS Decision | 4/4 | Complete   | 2026-07-20 |
| 2. Core Marketing Pages & Trust Surfaces | 8/8 | Complete   | 2026-07-15 |
| 3. Product Catalog | 3/3 | Complete   | 2026-07-15 |
| 4. Lead Conversion — RFQ/Inquiry/WhatsApp/Analytics | 5/5 | Complete    | 2026-07-21 |
| 5. SEO Infrastructure & Insights/Blog | 0/5 | Not started | - |
| 6. Performance & Cross-Locale RTL QA Hardening | 0/TBD | Not started | - |
