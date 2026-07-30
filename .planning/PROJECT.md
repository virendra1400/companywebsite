# Agro Export Corporate Website

## What This Is

A premium, multi-language corporate website for an India-based agricultural and food products manufacturer and exporter. Its job is to establish a credible global online presence and convert international B2B buyers — importers, wholesalers, distributors, retailers, supermarkets, food processors, and institutional buyers — into qualified inquiries. It is a corporate + lead-generation site, **not** an e-commerce store: it showcases products, manufacturing capability, quality standards, certifications, export experience, and global reach.

## Core Value

A first-time international buyer who has never heard of the company leaves the site trusting it enough to send a serious inquiry/RFQ. Everything else serves that conversion of trust into a qualified lead.

## Current Milestone: v2.0 Premium Redesign

**Goal:** Elevate the shipped VNP Global site to Stripe/Linear-tier premium — trust-first, without destabilizing the launch-ready build. Full plan: `.planning/references/REDESIGN-PLAN.md`.

**Target features (phases 7–11):**
- Design-system elevation — amended type scale (larger/thinner display + negative tracking), 64–96px rhythm, tabular stat figures, subtle depth. Keep IBM Plex (Arabic RTL) + add a Latin display face; colors unchanged.
- Hero + homepage narrative — elevated hero and new CMS blocks: trust/partner-logo row, Why Choose Us, Manufacturing Excellence, Export Process timeline, Testimonials.
- Component polish pass across cards, buttons, forms, CTAs, FAQ. — **Validated in Phase 8** (2026-07-29): hairline card recipe converged on FeatureGrid/SpecTable, tabular-nums wired onto all stat figures, Button primitive consolidated (brand hover/focus-ring/new outlineOnDark variant), FAQ block built end-to-end and seeded live in both dev and prod.
- Motion & micro-interactions — tasteful, perf-guarded, RTL-safe. — **Validated in Phase 9** (2026-07-30): sitewide scroll-reveal + per-item stagger via a custom `useInView`/`Reveal`/`RevealItem` primitive (zero new animation dependency), FAQ accordion's dead animation fixed, tap/hover/WhatsApp-entrance micro-interactions landed, `prefers-reduced-motion` respected throughout. Human-verified CLS 0 / LCP 2.1s on `/products`; a post-checkpoint code review caught and fixed a real double-nested-reveal bug (RenderBlocks wrapping already-self-staggering blocks) before sign-off.
- Performance & Cross-Locale RTL QA hardening (absorbs the old v1.0 Phase 6, run last against the final design).

**Locked decisions:** amend type scale (display only); keep Plex + add Latin display face (no full font swap — protects Arabic); colors unchanged (brief palette ≈ existing emerald/gold); each phase ships to Vercel prod; RTL-safe + CMS-driven + English-first throughout.

## Requirements

### Validated

- [x] Technical SEO foundation: per-locale metadata, Organization/Product/BreadcrumbList structured data, localized XML sitemap, reciprocal hreflang — organic search is a primary export lead channel. Validated in Phase 5: SEO Infrastructure & Insights/Blog.
- [x] Insights/blog surface for authority + SEO content. Validated in Phase 5: SEO Infrastructure & Insights/Blog.
- [x] Brand renamed Star Agrevolution → VNP Global across render paths; live on prod.
- [x] Primary navigation simplified 9 → 5 items (Products, About, Global Markets, Certifications, Contact); footer/mobile retain full set.

### Active

<!-- Hypotheses until shipped and validated. -->

- [ ] Modern, premium, international corporate design (not a typical local-business look)
- [ ] Fully responsive / mobile-first across phone, tablet, desktop — including RTL on mobile (many GCC/Africa buyers are mobile-first)
- [ ] Multi-language site: English (source), Arabic (RTL), French, Russian — all managed per-locale
- [ ] Scalable product catalog: categories + product detail pages, add products without a rebuild
- [ ] Headless CMS with localization so non-technical staff manage products/content/translations
- [ ] Conversion path: per-product RFQ + general inquiry forms (product / quantity / destination / incoterm fields), routed to email/CRM
- [ ] WhatsApp Business instant-contact as a secondary CTA throughout
- [ ] Trust surface — Certifications: ISO/HACCP/FSSAI/APEDA/organic/Halal etc. with logos + downloadable certificate PDFs
- [ ] Trust surface — Manufacturing & process: facility photos/video, production capacity, QC labs, packaging, cold-chain
- [ ] Trust surface — Export track record: countries served (world map), years exporting, volume/shipment stats, incoterms handled
- [ ] Trust surface — Company & compliance: about/leadership, downloadable company-profile PDF, IEC/registration, logistics & documentation support
- [ ] Fast Core Web Vitals across key pages (home, product, catalog) — Phase 6: Performance & Cross-Locale RTL QA Hardening
- [ ] Analytics + lead/inquiry tracking

### Out of Scope

- E-commerce / online payments / cart — this is a lead-gen corporate site, not a store; buyers transact offline via inquiry → quote → contract
- AI/machine-translation pipeline — professional human translation for published copy; machine-translated B2B copy destroys credibility
- Buyer login / customer portal (v1) — no authenticated buyer accounts yet; revisit if repeat-buyer self-service is needed
- Real production content at build time — content is "almost nothing yet"; build with realistic placeholders + a content checklist

## Context

- **Company:** India-based agro/food products manufacturer + exporter. Limited product range at launch, expected to grow.
- **Target markets:** Middle East (GCC), Europe, North America, Africa, Southeast Asia (+ CIS/Central Asia via Russian).
- **Audience:** international importers, wholesalers, distributors, retailers, supermarkets, food-processing companies, institutional buyers seeking reliable long-term India suppliers.
- **Positioning:** trusted manufacturing + export partner — premium quality, competitive pricing, reliable supply, timely delivery, international compliance, sustainable sourcing, long-term relationships.
- **Own domain / existing site:** https://staragrevolution.com/ — the client's current site and target domain. New site replaces/upgrades it; review for existing products/branding/content to migrate.
- **Inspiration reference:** https://www.piyushfarms.com/ — minimum bar ("at least this"). Floor, not ceiling; target is to meet or exceed its polish/structure with a world-class B2B export experience.
- **Company name:** VNP Global (renamed from Star Agrevolution 2026-07-23; confirmed by user). Domain `staragrevolution.com` unchanged — cutover only at launch, per existing plan.
- **Content readiness:** almost nothing yet (logo/assets/product data/certs/photos being gathered). Build structure first; slot real assets later via CMS.
- **Advisory stance:** Claude acts as senior UX designer, branding consultant, and full-stack architect — challenge weak ideas, apply modern B2B export-site best practices, benchmark against leading international agro-export companies.

## Constraints

- **Localization**: 4 locales incl. Arabic RTL — full layout mirroring; i18n is foundational, architected in from day one, not retrofit.
- **Content model**: Headless CMS with per-locale fields; non-technical staff must edit products/content/translations without developer involvement.
- **Scalability**: Catalog and content must grow (new products/categories/languages) without re-architecture.
- **Performance/SEO**: International audience on varied networks; fast Core Web Vitals + technical SEO are requirements, not nice-to-haves.
- **Translation quality**: Published non-English copy must be professional human translation; English is the source of truth.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Corporate lead-gen site, not e-commerce | Buyers transact offline (inquiry → quote → contract); trust-building is the goal | — Pending |
| Conversion = RFQ/inquiry forms + WhatsApp | Covers formal RFQ buyers and quick-chat buyers; forms qualify leads, WhatsApp lowers friction | — Pending |
| Headless CMS with localization | Multi-language + non-technical editors + scaling catalog make hardcoding untenable; exact tool chosen in research | ✓ Good — Payload |
| CMS = Payload; Arabic admin glyph rendering verified on live deploy (D-02 spike) | Spike on Vercel/Neon showed Arabic renders/shapes correctly in admin fields (RTL, joined glyphs); no Sanity fallback needed | ✓ Good |
| Launch 4 languages: EN/AR(RTL)/FR/RU | GCC, Africa/Europe, and CIS/Central Asia coverage; English as source locale | — Pending |
| Professional human translation, no AI pipeline | Machine-translated B2B copy destroys credibility; avoid over-engineering a translation system | — Pending |
| SEO + insights/blog treated as table stakes | Importers discover suppliers via organic search ("bulk [product] supplier India") | ✓ Good — Phase 5 shipped metadata/structured-data/sitemap/hreflang + Insights CMS |
| Placeholder content + content checklist | Little real content exists; ship structure, slot real assets via CMS later | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-30 after completing Phase 9 (Motion and Micro-interactions)*
