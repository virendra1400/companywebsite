# Agro Export Corporate Website

## What This Is

A premium, multi-language corporate website for an India-based agricultural and food products manufacturer and exporter. Its job is to establish a credible global online presence and convert international B2B buyers — importers, wholesalers, distributors, retailers, supermarkets, food processors, and institutional buyers — into qualified inquiries. It is a corporate + lead-generation site, **not** an e-commerce store: it showcases products, manufacturing capability, quality standards, certifications, export experience, and global reach.

## Core Value

A first-time international buyer who has never heard of the company leaves the site trusting it enough to send a serious inquiry/RFQ. Everything else serves that conversion of trust into a qualified lead.

## Requirements

### Validated

(None yet — ship to validate)

### Active

<!-- Hypotheses until shipped and validated. -->

- [ ] Modern, premium, international corporate design (not a typical local-business look)
- [ ] Multi-language site: English (source), Arabic (RTL), French, Russian — all managed per-locale
- [ ] Scalable product catalog: categories + product detail pages, add products without a rebuild
- [ ] Headless CMS with localization so non-technical staff manage products/content/translations
- [ ] Conversion path: per-product RFQ + general inquiry forms (product / quantity / destination / incoterm fields), routed to email/CRM
- [ ] WhatsApp Business instant-contact as a secondary CTA throughout
- [ ] Trust surface — Certifications: ISO/HACCP/FSSAI/APEDA/organic/Halal etc. with logos + downloadable certificate PDFs
- [ ] Trust surface — Manufacturing & process: facility photos/video, production capacity, QC labs, packaging, cold-chain
- [ ] Trust surface — Export track record: countries served (world map), years exporting, volume/shipment stats, incoterms handled
- [ ] Trust surface — Company & compliance: about/leadership, downloadable company-profile PDF, IEC/registration, logistics & documentation support
- [ ] Technical SEO foundation (metadata, structured data, sitemaps, per-locale hreflang, fast Core Web Vitals) — organic search is a primary export lead channel
- [ ] Insights/blog surface for authority + SEO content
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
| Headless CMS with localization | Multi-language + non-technical editors + scaling catalog make hardcoding untenable; exact tool chosen in research | — Pending |
| Launch 4 languages: EN/AR(RTL)/FR/RU | GCC, Africa/Europe, and CIS/Central Asia coverage; English as source locale | — Pending |
| Professional human translation, no AI pipeline | Machine-translated B2B copy destroys credibility; avoid over-engineering a translation system | — Pending |
| SEO + insights/blog treated as table stakes | Importers discover suppliers via organic search ("bulk [product] supplier India") | — Pending |
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
*Last updated: 2026-07-14 after initialization*
