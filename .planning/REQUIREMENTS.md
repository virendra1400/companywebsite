# Requirements — Star Agrevolution Website

**Milestone:** v1 (launch)
**Core value:** A first-time international buyer trusts Star Agrevolution enough to send a serious inquiry/RFQ.

Requirement ID format: `[CATEGORY]-[NUMBER]`. All v1 items are hypotheses until shipped and validated.

---

## v1 Requirements

### Foundation & Internationalization (FOUND)

- [ ] **FOUND-01**: Locale-aware routing exists for 4 locales (en, ar, fr, ru) with correct per-locale URLs
- [ ] **FOUND-02**: English is live at launch; Arabic/French/Russian are built-in and can be switched on per-page as professional translations arrive
- [ ] **FOUND-03**: Arabic renders full RTL correctly using CSS logical properties (not left/right flips), with non-mirrored numerals
- [ ] **FOUND-04**: Language switcher lets a visitor change locale from any page, preserving the current page context
- [ ] **FOUND-05**: Site is fully responsive/mobile-first across phone, tablet, desktop — including RTL layouts on mobile
- [ ] **FOUND-06**: Only published (translated) locale versions are exposed; untranslated pages fall back or hide per a defined rule (no half-translated pages shown)

### Content Management (CMS)

- [ ] **CMS-01**: Non-technical staff can create/edit/publish products, certifications, and pages via an admin UI without developer involvement or redeploy
- [ ] **CMS-02**: Content model stores per-locale field values for all localizable content with an English fallback
- [ ] **CMS-03**: Adding a new product or product category requires no code change or rebuild trigger by staff (ISR/webhook revalidation)
- [ ] **CMS-04**: Media (images, video, certificate PDFs, company-profile PDF) is uploadable and managed through the CMS

### Product Catalog (CAT)

- [ ] **CAT-01**: Visitor can browse products grouped by category
- [ ] **CAT-02**: Each product has a detail page (description, specifications, packaging, imagery, applicable certifications)
- [ ] **CAT-03**: Catalog scales to new products/categories without redesign
- [ ] **CAT-04**: Catalog structure supports placeholder content now, real specs slotted in later via CMS

### Lead Conversion (LEAD)

- [x] **LEAD-01**: Visitor can submit a general inquiry via a form (name, company, country, message)
- [x] **LEAD-02**: Visitor can submit a per-product RFQ with qualifying fields (product, quantity, destination country, incoterm, message)
- [x] **LEAD-03**: Form submissions are protected against spam (honeypot + rate-limit + Cloudflare Turnstile)
- [x] **LEAD-04**: Submissions are delivered by transactional email (Resend) with SPF/DKIM/DMARC configured for deliverability
- [x] **LEAD-05**: A CRM webhook integration point exists (stub) so a CRM can be wired later without rework
- [ ] **LEAD-06**: WhatsApp Business click-to-chat CTA (`wa.me`) is available prominently across the site
- [ ] **LEAD-07**: Inquiry/RFQ submissions and WhatsApp clicks are tracked as conversion events in analytics

### Trust Surface (TRUST)

- [ ] **TRUST-01**: Certifications page lists certifications (ISO, HACCP, FSSAI, APEDA, organic, Halal, etc.) with logos and downloadable certificate PDFs
- [ ] **TRUST-02**: Halal certification is featured prominently alongside major certs when the company holds it (high GCC trust value)
- [ ] **TRUST-03**: Manufacturing & process page shows facility photos/video, production capacity, QC labs, packaging, cold-chain
- [ ] **TRUST-04**: Export track record page shows countries served (world map), years exporting, volume/shipment stats, incoterms handled
- [ ] **TRUST-05**: Company & compliance content: about/leadership, downloadable company-profile PDF, IEC/registration details, logistics & documentation support
- [ ] **TRUST-06**: Trust content structures ship with safe placeholders; real assets (PDFs, stats, logos) slot in via CMS without layout breakage

### Core Marketing Pages (PAGE)

- [ ] **PAGE-01**: Premium homepage communicating positioning (quality, reliability, compliance, global reach) with clear conversion CTAs
- [ ] **PAGE-02**: About/company page telling the Star Agrevolution story and value proposition
- [ ] **PAGE-03**: Contact page with inquiry form, WhatsApp, email, phone, and physical/registered address
- [ ] **PAGE-04**: Consistent premium global header/footer with navigation, language switcher, and primary CTAs

### SEO (SEO)

- [ ] **SEO-01**: Every page emits correct metadata (title, description, Open Graph) per locale
- [ ] **SEO-02**: Correct reciprocal hreflang tags + x-default across all locales, CMS-generated (not hand-maintained)
- [ ] **SEO-03**: XML sitemap(s) generated including all locales
- [ ] **SEO-04**: Structured data (Organization, Product, BreadcrumbList) emitted where applicable
- [ ] **SEO-05**: Clean canonical URLs; no duplicate-content or canonical/hreflang conflicts

### Insights / Blog (BLOG)

- [ ] **BLOG-01**: Blog/insights section + article template built in v1 (structure ready)
- [ ] **BLOG-02**: Staff can publish articles via CMS per locale as content is written

### Analytics (ANALY)

- [ ] **ANALY-01**: Web analytics installed (GA4/GTM or equivalent) tracking traffic and key conversion events

### Performance & QA (PERF)

- [ ] **PERF-01**: Good Core Web Vitals on key pages (home, product, catalog) on mobile and desktop
- [ ] **PERF-02**: Images/video/PDFs optimized and lazy-loaded appropriately
- [ ] **PERF-03**: Cross-locale RTL/LTR QA pass before launch (Arabic layout, fonts, numerals verified against real content)

---

## v2 / Deferred

- Arabic/French/Russian full content go-live (translations completed post-launch per FOUND-02)
- CRM vendor selection + full integration (webhook stub lands in v1 per LEAD-05)
- Populated blog article library (structure ships v1 per BLOG-01)
- WhatsApp Business Platform (Cloud API) automation/chatbot — only if instant-contact `wa.me` proves insufficient

## Out of Scope

- E-commerce / cart / online payments / stock — lead-gen corporate site; buyers transact offline
- Buyer login / customer portal / account area — no authenticated buyer accounts in v1
- AI / machine-translation pipeline — professional human translation only; MT copy destroys B2B credibility
- Marketplace features (bidding, public reviews/ratings) — not a marketplace
- Interactive 3D globe / heavy gimmicks — evidence-based export map instead
- Overbuilt generic drag-and-drop page-builder — structured content blocks only

---

## Traceability

<!-- Filled by roadmap: maps each REQ-ID to its phase. -->

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Pending |
| FOUND-05 | Phase 1 | Pending |
| FOUND-06 | Phase 1 | Pending |
| CMS-01 | Phase 1 | Pending |
| CMS-02 | Phase 1 | Pending |
| CMS-03 | Phase 1 | Pending |
| CMS-04 | Phase 1 | Pending |
| PAGE-01 | Phase 2 | Pending |
| PAGE-02 | Phase 2 | Pending |
| PAGE-03 | Phase 2 | Pending |
| PAGE-04 | Phase 2 | Pending |
| TRUST-01 | Phase 2 | Pending |
| TRUST-02 | Phase 2 | Pending |
| TRUST-03 | Phase 2 | Pending |
| TRUST-04 | Phase 2 | Pending |
| TRUST-05 | Phase 2 | Pending |
| TRUST-06 | Phase 2 | Pending |
| CAT-01 | Phase 3 | Pending |
| CAT-02 | Phase 3 | Pending |
| CAT-03 | Phase 3 | Pending |
| CAT-04 | Phase 3 | Pending |
| LEAD-01 | Phase 4 | Complete |
| LEAD-02 | Phase 4 | Complete |
| LEAD-03 | Phase 4 | Complete |
| LEAD-04 | Phase 4 | Complete |
| LEAD-05 | Phase 4 | Complete |
| LEAD-06 | Phase 4 | Pending |
| LEAD-07 | Phase 4 | Pending |
| ANALY-01 | Phase 4 | Pending |
| SEO-01 | Phase 5 | Pending |
| SEO-02 | Phase 5 | Pending |
| SEO-03 | Phase 5 | Pending |
| SEO-04 | Phase 5 | Pending |
| SEO-05 | Phase 5 | Pending |
| BLOG-01 | Phase 5 | Pending |
| BLOG-02 | Phase 5 | Pending |
| PERF-01 | Phase 6 | Pending |
| PERF-02 | Phase 6 | Pending |
| PERF-03 | Phase 6 | Pending |

**Coverage:** 42/42 v1 requirements mapped. No orphans.
