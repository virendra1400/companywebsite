# Feature Research

**Domain:** Premium multi-language B2B corporate + lead-generation website for an India-based agro/food manufacturer & exporter (not e-commerce)
**Researched:** 2026-07-14
**Confidence:** MEDIUM — patterns verified across multiple India agro-exporter sites, general B2B export lead-gen practices, and one explicit client benchmark (piyushfarms.com). Large agro majors (Olam, ITC, Cargill) publish mostly investor/corporate content behind sparse public detail, so those specific claims are LOW confidence / directional only — treat as "what tier-1 corporate sites signal" rather than verified feature inventories.

## Brand: Star Agrevolution (staragrevolution.com is a parked domain — pure greenfield)

The client's brand name is **Star Agrevolution**; the domain staragrevolution.com is currently just a parked/placeholder registration with nothing built on it. There is no existing site, content, product list, or visual identity to review, migrate, or reuse — this is a pure greenfield build. This aligns with PROJECT.md's note that "content is almost nothing yet." No further review of that domain is needed or useful.

## Benchmark: piyushfarms.com (client-specified floor, not ceiling — the only real reference site)

The client named this site as the **minimum bar**. Structure found (via live fetch):

- Nav: Home / About Us / Our Story / Products (submenu) / FAQ / Contact Us
- Homepage: hero + 4 pillar trust cards (sourcing/processing/QA/sustainability) → product grid (frozen veg, fruit pulp, organic veg) → QA checklist → recipe/blog carousel → testimonials → inquiry form → FAQ → about → newsletter → footer
- Products: category grid → per-product pages for major SKUs; one inquiry form with a single product dropdown (11 options) feeding all products
- Trust: GMP mention, "EU/Middle East export" claim, testimonials, facility locations (Pune HQ, Satara plant), founded-date, brochure PDF
- Contact: phone + email + form; **no WhatsApp widget, no dedicated certifications page, no blog/insights index, no export-country map, no downloadable certificates, no per-product RFQ (just one generic form), no multi-language**

**What it does well (match):** clean visual polish, clear product photography, a functioning single inquiry form, a downloadable brochure, testimonials, an FAQ section, pillar-based trust framing on the homepage.

**Where a world-class export site must exceed it (this project's differentiators, not optional):**
1. Multi-language incl. Arabic RTL — Piyush Farms is English-only; this is a hard requirement for GCC/CIS reach.
2. Real certification proof — logos + downloadable certificate PDFs (ISO/HACCP/FSSAI/APEDA/Halal/organic), not a one-line "GMP" mention.
3. Per-product RFQ with qualifying fields (quantity, destination, incoterm) — not one generic dropdown form for all SKUs.
4. WhatsApp as a persistent secondary CTA — Piyush Farms has none.
5. Export track record made visible — countries served, years exporting, shipment/volume stats, incoterms handled — Piyush Farms only makes a vague export claim with no evidence.
6. Company profile PDF + IEC/registration numbers stated (not just a brochure) — visible compliance credentials, not just "brochure download."
7. Manufacturing/facility depth — process/QC-lab photos or video, not just a location name.
8. SEO-structured insights/blog (buyer-intent content: "bulk X supplier India", incoterms guides, etc.) vs. a recipe-only carousel that serves consumer intent, not B2B buyer intent.
9. Technical SEO foundation (hreflang, structured data, Core Web Vitals) — no evidence of this at the benchmark site.

Do not lower any Active requirement in PROJECT.md to match this benchmark — it is a floor. Everything above is already implied by PROJECT.md's Active requirements; this benchmark simply confirms none of it is over-engineering relative to what a real India agro-exporter competitor ships today.

## Feature Landscape

### Table Stakes (Buyers Expect These — Missing Them Signals "Not a Real Exporter")

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Clear product catalog (category → product grid → detail page) | Buyers need to scan what's available before engaging | LOW-MEDIUM | CMS-driven collection type; needs per-locale fields (name, description, specs, HS code, packaging options) |
| Product detail page with specs (grade, packaging sizes, MOQ, HS code, shelf life, origin) | Importers filter/qualify suppliers on these before ever emailing | LOW-MEDIUM | Structured fields, not free-text; feeds RFQ form pre-fill |
| Per-product RFQ / inquiry form (product, quantity, destination, incoterm, packaging) | This is the core conversion event of the whole site | MEDIUM | Requires form routing to email/CRM; qualifying fields reduce junk leads vs. one generic form (Piyush Farms gap) |
| General "Contact Us" inquiry (non-product) | Institutional/distributor buyers researching the company itself, not one SKU | LOW | Simple form + phone/email |
| WhatsApp Business click-to-chat CTA | Regional buyers (GCC, SE Asia, Africa) treat WhatsApp as primary business channel; >90% open rate vs. email | LOW | `wa.me` deep link or floating widget; needs a monitored number and locale-aware pre-filled message |
| Certifications page with logos + downloadable PDFs | Buyers verify compliance before RFQ; missing docs = distrust or extra email round-trips | LOW-MEDIUM | ISO 9001/22000, HACCP, FSSAI, APEDA registration, Halal, organic (as applicable); PDFs hosted in CMS media library |
| Company/About page (leadership, history, mission) | Baseline credibility; buyers check "who is this company" | LOW | Standard content page |
| Downloadable company profile PDF | Institutional/distributor buyers forward this internally for approval; a page link isn't enough | LOW | One PDF per locale, or one bilingual master; update via CMS |
| Manufacturing/facility page (photos, capacity, process overview) | Buyers can't visit in person pre-RFQ; visual proof substitutes for a site visit | MEDIUM | Photo/video gallery; ideally process-flow diagram (raw material → processing → QC → packaging → dispatch) |
| Export markets / countries served | Signals real export experience, not a domestic seller dabbling in export | LOW-MEDIUM | Can start as a simple list/logo strip; map is a differentiator (see below) |
| Multi-language site (EN source + AR/FR/RU) | Buyers in target regions expect content in a language they trust, especially formal AR markets | HIGH | Foundational i18n architecture, RTL for Arabic, professional human translation per PROJECT.md |
| Mobile-responsive, fast-loading pages | International buyers on variable networks/devices; Google penalizes slow sites in search ranking | MEDIUM | Core Web Vitals target; image optimization, CDN |
| Basic technical SEO (meta tags, sitemap, per-locale hreflang) | Organic search ("bulk [product] supplier India") is a primary discovery channel per PROJECT.md | MEDIUM | Foundational, must be architected not retrofitted |
| Privacy policy / terms / disclaimer pages | Baseline legal hygiene; expected on any corporate site collecting form data | LOW | Standard static pages; GDPR-aware wording for EU/UK buyers |
| Testimonials / client logos (if available) | Social proof reduces first-inquiry risk | LOW | Needs real client permission; placeholder-safe pattern for launch with little content |

### Differentiators (Competitive Advantage vs. Other India Exporters)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Export track record with data — years exporting, shipment/volume stats, incoterms handled (FOB/CIF/CFR etc.), interactive or static world map of countries served | Turns a vague "we export" claim into evidence; most India competitor sites (incl. the benchmark) only assert export capability without proof | MEDIUM | Static choropleth/list is enough at launch; avoid an over-engineered interactive globe for v1 (see Anti-Features) |
| Deep manufacturing/process showcase — QC lab photos, cold-chain/packaging line video, capacity figures, food-safety process flow | Differentiates from text-only "GMP certified" claims; builds confidence for buyers who can't do a factory audit yet | MEDIUM | Video adds production cost; photos + a process diagram cover 80% of the value at lower cost |
| Structured RFQ with per-product qualifying fields (destination country, incoterm, target quantity/container size, packaging pref) | Higher lead quality than a single generic dropdown form (the benchmark's approach); sales team gets an actionable brief on first contact | MEDIUM | Form logic + CRM/email routing; validate fields server-side |
| IEC number, registration numbers, and compliance credentials surfaced directly on the compliance/company page (not just a brochure) | Institutional/distributor buyers often need this for their own internal supplier-approval checklists | LOW | Just structured content fields; no new system |
| SEO-targeted insights/blog for buyer-intent topics (sourcing guides, incoterms explainers, "how to import [product] from India", seasonal harvest updates) | Consumer-recipe content (the benchmark's approach) serves the wrong audience; buyer-intent content captures organic B2B search traffic | MEDIUM | Needs an editorial content plan + CMS blog collection with per-locale SEO metadata |
| Full 4-language parity incl. Arabic RTL done properly (logical CSS properties, not mirrored numerals/phone numbers, correct Arabic typography line-height) | Almost no India agro-exporter competitor site (including the benchmark) offers real multi-language, let alone correct RTL | HIGH | Architectural decision made up front; retrofitting RTL later is expensive |
| Lead/inquiry analytics + CRM handoff (form source tracking, per-product inquiry volume, WhatsApp click tracking) | Lets the business see which products/markets generate real demand, informing sales prioritization | MEDIUM | Analytics events + CRM/email integration; not a public-facing feature but a business-value differentiator |
| Downloadable certificate PDFs per certification (not just logos) | Some competitors show cert logos with no proof document; downloadable PDFs let a buyer's compliance team verify without asking | LOW | Just CMS media fields |
| Case studies / buyer success stories (anonymized if needed) | Goes beyond generic testimonials to show a real supply relationship outcome | MEDIUM | Needs real content; can be deferred to v1.x if no case studies exist at launch |

### Anti-Features (Commonly Requested, Often Problematic Here)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|------------------|-------------|
| E-commerce cart / online checkout / payments | "Modern sites let you buy online" | B2B agro export deals go through negotiated pricing, contracts, incoterms, and often sampling — not a fixed-price cart; building this contradicts the site's actual sales motion (per PROJECT.md, explicitly out of scope) | RFQ form → sales team quotes → offline contract |
| Buyer login / customer account portal (v1) | "Buyers want to track their orders online" | No repeat-buyer self-service need yet; adds auth, session, and data-privacy surface for no validated demand | Revisit post-launch if repeat buyers request order-status visibility |
| Real-time chat / AI chatbot for product Q&A | Feels modern, matches consumer e-commerce expectations | For a low-volume, high-value B2B sales motion, a chatbot either gives generic answers (erodes trust) or requires live staffing the business likely can't sustain across 4 languages/time zones | WhatsApp (async, human-staffed) + well-structured product/FAQ pages |
| Interactive 3D/animated globe for export map | Looks impressive in a demo | High build/maintenance cost, accessibility and mobile-performance risk, marginal trust gain over a static map/list — most real export competitor sites use a simple static graphic or list | Static map or shaded region list with country names, upgrade later only if traffic data justifies it |
| Machine-translated content pipeline (auto-translate via API for all 4 locales) | Fast, cheap, "get to market sooner" | Explicitly called out in PROJECT.md — machine-translated B2B copy destroys credibility with buyers evaluating trust | Professional human translation workflow, EN as source of truth |
| Full multi-vendor marketplace features (comparison tools, buyer reviews of the company, RFQ bidding wars) | Seen on B2B marketplaces (Alibaba, TradeWheel) | This is a single company's corporate site, not a marketplace; marketplace UX patterns (bidding, third-party reviews) undermine the "trusted single-source exporter" positioning | Keep it a single-brand trust-building site; testimonials instead of open reviews |
| Gated content (must fill a form to see product specs/certs) | "Captures more lead data earlier" | Hostile to the actual buyer journey — international buyers doing first-pass vetting will bounce rather than trade contact info just to see a spec sheet or cert PDF; hurts SEO (gated pages don't index) | Keep product specs and cert PDFs public; gate only the RFQ/contact step itself |
| Overbuilt CMS/admin abstractions (generic "any content type" builder, workflow/approval engine) for a small non-technical team | "Future-proofing" instinct | Team is small and non-technical; a generic page builder adds training burden and dev complexity for content needs that are well-known upfront (products, certs, blog posts, static pages) | Use the CMS's built-in localized collection types directly; add custom content types only when a real new need appears |

## Feature Dependencies

```
Multi-language architecture (EN/AR-RTL/FR/RU)
    └──requires──> Headless CMS with per-locale fields
                       └──requires──> Content model design (products, certs, pages, blog posts)

Per-product RFQ form
    └──requires──> Product catalog with structured fields (for pre-fill: product name, packaging options)
                       └──requires──> Content model design

WhatsApp CTA
    └──enhances──> RFQ form (secondary/faster conversion path, same lead-capture goal)

Export track record (countries/map/volumes)
    └──requires──> Real export data from the business (content dependency, not technical)

Certifications page (logos + PDFs)
    └──requires──> CMS media library / file storage for PDFs

SEO insights/blog
    └──requires──> Multi-language architecture (blog posts need per-locale SEO metadata + hreflang)
    └──requires──> Technical SEO foundation (sitemap, structured data)

Analytics + lead tracking
    └──enhances──> RFQ form + WhatsApp CTA (measures which conversion paths work)

Company profile PDF ──enhances──> About/Compliance page (downloadable artifact referencing on-page claims)

E-commerce cart ──conflicts──> RFQ/inquiry lead-gen model (out of scope; do not combine)
Buyer login/portal ──conflicts──> "no authenticated accounts v1" scope (out of scope)
```

### Dependency Notes

- **Multi-language requires Headless CMS with per-locale fields:** Retrofitting i18n onto a hardcoded site is expensive and error-prone; PROJECT.md already treats this as foundational — the roadmap must put CMS + locale architecture in an early phase, before content-heavy phases (catalog, blog).
- **Per-product RFQ requires structured product catalog:** The RFQ form needs to reference real product identifiers/fields (name, packaging) to pre-fill and qualify leads — catalog data model must exist before building the qualified-RFQ flow, or the form ships as a generic contact form initially (acceptable fallback, matches the benchmark's minimum but should be upgraded in the same milestone).
- **SEO blog requires multi-language + technical SEO foundation:** Publishing blog content before hreflang/sitemap/structured-data groundwork wastes the SEO value of that content — sequence technical SEO before/alongside first blog posts.
- **E-commerce cart conflicts with the lead-gen model:** Explicitly out of scope per PROJECT.md; flag any stakeholder request to "add a buy button" as scope creep against the core value ("trust → inquiry", not "trust → purchase").
- **Certifications page requires CMS media/file storage:** Downloadable PDFs need a file-asset content type, not just rich text — confirm the chosen headless CMS supports file/media fields per locale (or shared across locales, since certs are usually locale-independent artifacts).

## MVP Definition

### Launch With (v1)

Minimum viable product — enough to validate that a first-time buyer will trust the site enough to submit an RFQ.

- [ ] Homepage — positioning, pillar trust signals, product/category teaser, CTA to RFQ + WhatsApp
- [ ] Product catalog (categories → product detail pages) with real or realistic placeholder specs
- [ ] Per-product RFQ form (product, quantity, destination, incoterm) routed to email/CRM
- [ ] General contact/inquiry form
- [ ] WhatsApp click-to-chat CTA (header/footer + floating, or at minimum persistent header CTA)
- [ ] Certifications page with logos (PDFs can follow once real certs are gathered — content gap, not structural gap)
- [ ] Manufacturing/facility page with photos (video can follow later)
- [ ] Export markets list/simple map + basic export credibility stats
- [ ] Company/About page + downloadable company profile PDF (placeholder-safe)
- [ ] Multi-language architecture live for all 4 locales (EN/AR-RTL/FR/RU), even if initial non-English content is placeholder-quality pending professional translation
- [ ] Technical SEO foundation (metadata, sitemap, hreflang, Core Web Vitals baseline)
- [ ] Analytics + basic lead-source tracking

### Add After Validation (v1.x)

- [ ] SEO insights/blog — add once the core conversion path is proven and there's bandwidth for an editorial cadence
- [ ] Downloadable certificate PDFs per cert (once real certification documents are gathered from the business)
- [ ] Facility process video
- [ ] Case studies/buyer success stories (once real client relationships can be referenced)
- [ ] Interactive export map upgrade (only if user behavior data shows the static version isn't landing)

### Future Consideration (v2+)

- [ ] Buyer self-service order/inquiry status (only if repeat-buyer demand is validated post-launch)
- [ ] Deeper CRM integration (lead scoring, automated follow-up sequences) — defer until inquiry volume justifies the tooling investment
- [ ] Additional locales beyond EN/AR/FR/RU — defer until a new target market is confirmed

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Product catalog + detail pages | HIGH | MEDIUM | P1 |
| Per-product RFQ form | HIGH | MEDIUM | P1 |
| WhatsApp CTA | HIGH | LOW | P1 |
| Certifications page (logos) | HIGH | LOW | P1 |
| Multi-language + RTL architecture | HIGH | HIGH | P1 |
| Manufacturing/facility page | HIGH | MEDIUM | P1 |
| Export track record (countries/stats) | HIGH | LOW-MEDIUM | P1 |
| Company profile PDF | MEDIUM | LOW | P1 |
| Technical SEO foundation | HIGH | MEDIUM | P1 |
| Certificate PDFs (downloadable) | MEDIUM | LOW | P2 |
| SEO insights/blog | MEDIUM | MEDIUM | P2 |
| Analytics + lead tracking | MEDIUM | MEDIUM | P2 |
| Interactive export map | LOW-MEDIUM | HIGH | P3 |
| Case studies | MEDIUM | MEDIUM | P3 |
| Facility process video | LOW-MEDIUM | HIGH (production cost) | P3 |
| Buyer login/portal | LOW (unvalidated) | HIGH | Out of scope (v1) |
| E-commerce cart | N/A (conflicts with model) | HIGH | Out of scope |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | piyushfarms.com (client-named floor, only real reference site) | Typical India agro-exporter site (JFT Agro, Spice of Indian, etc.) | Our Approach (Star Agrevolution) |
|---------|---------------------------------------|----------------------------------------------------------------------|--------------|
| Product catalog | Category grid + per-product pages, no per-locale content | Similar flat catalog, often thin specs | Structured specs (grade/MOQ/HS code/packaging), CMS-driven, multi-locale |
| RFQ/inquiry | Single generic form, one product dropdown for all SKUs | Usually a single contact form; some have per-product "enquire" buttons but shallow fields | Per-product RFQ with destination/quantity/incoterm fields for lead qualification |
| WhatsApp | Not present | Inconsistent — some have it, many don't | Persistent CTA across site, treated as first-class conversion path |
| Certifications | One-line "GMP" claim, no logos/PDFs | Logos present on several (JFT Agro, Spice of Indian); PDFs sometimes downloadable | Logos + downloadable PDFs for every held certification |
| Export track record | Vague "EU/Middle East export" claim, no data | Rarely quantified across the sample reviewed | Countries list/map + years exporting + shipment stats — evidence, not assertion |
| Company profile / compliance | Brochure PDF only | Sometimes lists IEC/FSSAI/APEDA numbers directly on page | Company profile PDF + compliance numbers surfaced on-page |
| Multi-language | English only | English only (all reviewed) | 4 locales incl. proper Arabic RTL — clear differentiation opportunity, low competitor coverage |
| Blog/insights | Consumer recipe carousel (wrong audience for B2B) | Largely absent or thin | Buyer-intent SEO content (sourcing/import guides), not consumer recipes |
| Manufacturing showcase | Location names only, no photos/video found | Occasional facility photos | Photo gallery + process-flow overview at minimum |

Note: The project brand is **Star Agrevolution**. Its domain (staragrevolution.com) is a parked placeholder with no built site, so there is no legacy content/branding to reconcile — this is a pure greenfield build with piyushfarms.com as the only real external reference point (a floor, not a ceiling).

## Sources

- https://www.piyushfarms.com/ — client-specified benchmark, live-fetched and reviewed directly (MEDIUM-HIGH confidence, primary source)
- https://indianspicetrader.com/certifications.html, https://jftagro.com/certificates.html, https://www.radianceoverseas.com/Certification.html, https://spiceofindian.com/ — India agro/spice exporter certification page patterns (MEDIUM confidence, WebSearch-sourced, cross-referenced across multiple sites)
- https://farmerconnect.apeda.gov.in/Content/APEDA_Agri_Export_Manual_FINAL.pdf — APEDA official agri-export guidance (HIGH confidence, government source)
- https://www.dgft.gov.in/CP/?opt=iec-profile-management — DGFT IEC certificate process (HIGH confidence, official source)
- https://www.copagomarket.com/blog/best-way-to-generate-export-leads-for-food-products, https://blog.tradewheel.com/10-best-b2b-agriculture-websites-for-2023 — B2B agro lead-gen and WhatsApp conversion-rate context (MEDIUM confidence, industry blog, directionally consistent with known B2B trade patterns)
- https://www.olamgroup.com/, https://www.olamagri.com/ — large agro-major corporate site presence (LOW confidence — search did not surface detailed feature inventory; used only to confirm these firms present as trade/sustainability-led corporate sites, not e-commerce)
- RTL/Arabic UX best practices: https://aivensoft.com/en/blog/rtl-arabic-website-design-guide, https://www.reffine.com/en/blog/rtl-website-design-and-development-mistakes-best-practices, https://hamrix.com/ksa/blog/arabic-rtl-ui-ux-design-guide, https://www.weglot.com/blog/rtl-web (MEDIUM confidence, cross-referenced across multiple sources, consistent guidance on logical CSS properties, non-mirrored numerals/media controls, typography adjustments)
- World map/export-visualization patterns: https://growthnatives.com/blogs/data-visualization/data-visualization-in-b2b-website-strategies/, https://www.newmediacampaigns.com/blog/examples-of-interactive-maps-on-websites (MEDIUM confidence, general B2B data-viz patterns, not agro-specific)
- .planning/PROJECT.md — internal project context and stated Active/Out-of-Scope requirements (HIGH confidence, primary source of truth for scope decisions)

---
*Feature research for: Premium multi-language B2B agro/food export corporate + lead-gen website*
*Researched: 2026-07-14*
