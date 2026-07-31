# MASTER_PLAN — VNP Global Website Transformation

Companion to PROJECT_MEMORY.md (facts) — this file holds strategy. Audit date: 2026-07-31.

## 1. Executive Summary

VNP Global is a new Indian agri-export company (frozen vegetables, fruit pulps, value-added) with a real manufacturing base (group facility in Karad) but zero customers and certifications still in progress. The current website looks modern but is credibility-fatal on inspection: fabricated trust claims, placeholder facility images, an empty certifications page, dead WhatsApp links, and an SEO setup that points Google at a still-live staging domain.

**The strategy:** become the most *transparent* exporter site in the category. Competitors (see COMPETITOR_INSIGHTS) all gate specs, dump decorative cert logos, and hide facilities. VNP wins the credibility game by publishing what others hide — full spec tables, container math, certification status with numbers, sample COA, commercial terms, facility evidence, named people — wrapped in restrained premium design. Honesty is the moat because it's the one thing a new company can do better than incumbents.

Three moves: (0) emergency hotfixes to stop active damage, (1) rebuild the trust core (products/certifications/facility/about + conversion flow), (2) polish + SEO + performance, (3) grow (content, Arabic, real photography).

## 2. Business Understanding

### 2.1 Value proposition
For import buyers who need consistent processed Indian produce without supply-chain surprises: export-grade IQF vegetables and aseptic fruit pulps, manufactured at an operating export-oriented facility, with batch documentation, open specifications, and a de-risked first-order path (samples, inspection-welcome, published terms).

### 2.2 Personas (priority order)

| Persona | Who | Cares about | Site must give them |
|---|---|---|---|
| P1 Gulf importer/distributor | Trading houses UAE/KSA/Kuwait/Qatar/Oman restocking frozen veg & pulp | Halal, price/MOQ, reefer logistics to Jebel Ali/Dammam, WhatsApp responsiveness, supplier legitimacy | Cert status, specs + container math, WhatsApp path, fast quote SLA, Arabic-labeling capability |
| P2 Food processor (B2B ingredients) | Beverage/dairy/bakery manufacturers buying pulp/IQF as input (Gulf + SEA) | Consistent specs (Brix, micro), COA per batch, aseptic packaging, traceability, sample evaluation | 4-block spec tables, sample COA, sample program, applications content |
| P3 SEA wholesaler | Smaller mixed-container buyers | Flexibility, MOQ, price | MOQ ranges, mixed-container note, easy inquiry |

### 2.3 Buyer journey (credibility-first model)
Outbound contact (email/WhatsApp/trade platform) → buyer opens website to vet → 3-minute diligence scan: *products real? specs? certs? factory? people? terms?* → if pass: replies / submits RFQ / downloads spec sheet → sample → small first order (LC/advance) → repeat. **The website's job is winning that 3-minute scan.** Every audit issue that fails the scan is a lost reply.

### 2.4 Pain points answered
New-supplier risk (→ de-risk kit: samples, inspection welcome, published terms, virtual tour) · spec opacity (→ open spec tables) · slow unresponsive suppliers (→ 24h SLA, WhatsApp) · doc chaos at customs (→ documentation checklist, per-shipment doc list) · "is this a real processor?" (→ facility evidence, group-plant framing).

## 3. Brand & Positioning

- **Position:** premium processor with hard trust proof (D-02). Tagline territory: "Documented for export." / "Export-grade, in the open."
- **Personality:** precise, transparent, industrially clean, quietly confident. Anti-personality: salesy, superlative, farm-clipart.
- **Differentiation vs competitors:** transparency (open specs/terms/status) + design quality + Gulf fluency. Vs Piyush Farms: same green DNA, export-B2B expression (darker, editorial, data-forward) — D-13.
- Visual & verbal systems: DESIGN_SYSTEM.md, CONTENT_PLAYBOOK.md.

## 4. Current-Site Audit (condensed — 2026-07-31)

Framework confirmed: **Next.js (App Router) + Payload CMS on Vercel**. Full details preserved here; per-page copy inventory available on request from audit.

### 4.1 CRITICAL (active damage — Phase 0 hotfixes)

| # | Issue | Evidence | Impact |
|---|---|---|---|
| A1 | Fabricated "Trusted by 60+ international buyers" hero badge (CMS template `{count}+`, count=60) | Homepage hero | Diligence discovers it's false → permanent credibility loss; legal risk |
| A2 | **Entire SEO identity points to staging domain** `star-agrevolution.vercel.app`: robots.txt sitemap line, all 23 sitemap URLs, product canonicals, Organization JSON-LD url, og:image URLs — and staging is still live serving a full duplicate | robots.txt, sitemap.xml, raw HTML | vnpglobal.in cannot rank; Google indexes the throwaway domain |
| A3 | **10 dead WhatsApp links** `wa.me/910000000000` in mid-page CTA bands on /about, /company, /export, /certifications, /manufacturing (2 each; header/footer links are correct) | Raw HTML | Primary conversion channel silently broken on 5 of 10 pages |
| A4 | Certifications page exists with ZERO certifications ("Certifications coming soon") | /certifications | #1 buyer gate; empty dedicated page worse than none |
| A5 | Payload **/admin publicly reachable** on production | HTTP 200, "Dashboard - Payload" | Attack surface; verify auth, restrict access |

### 4.2 HIGH

| # | Issue | Evidence |
|---|---|---|
| B1 | Mismatched stock photos: wheat=green peas, apple=sweet corn, spices=baby corn, corn field=ginger-garlic paste | /products raw HTML `/images/stock/*` |
| B2 | Manufacturing page: 4/4 facility images literal placeholder SVGs (alt "…placeholder photo"); hero image filename "ChatGPT Image Jul 30, 2026…" | /manufacturing |
| B3 | Anonymous leadership: 3 role cards (MD, Head of Quality, Export Ops), no names, placeholder avatars | /company |
| B4 | Compliance claims without numbers: "valid IEC registration", "APEDA registration" — no IEC/CIN/GST shown anywhere | /company |
| B5 | Product pages missing decision specs: no Brix, variety, sizing, shelf life, MOQ, drum/carton weights | all 8 product pages |
| B6 | Fake locale trees: /ar = RTL English (0 Arabic chars), /ru = 0 Cyrillic, /fr chrome-only — in sitemap, no hreflang | raw HTML scans |
| B7 | Identical `<title>VNP Global</title>` + identical meta description on all 10 top-level pages; no OG tags on top-level pages | curl all pages |

### 4.3 MEDIUM / LOW
robots.txt `Disallow: /api` blocks all CMS images (`/api/media/...`) from image indexing · /insights empty but footer-linked site-wide · "16+ markets" stat frames aspiration as track record · three-entity confusion (VNP/Kavita/Piyush) unexplained · /global-markets 404s (real route is /export); /company & /manufacturing footer-only · registered office lacks street address; no map/hours on /contact (verify reported "422010" PIN anomaly) · unverifiable process promises ("responds within one business day", "every stage documented") stated as facts.

### 4.4 Keep (verified good)
Contact/RFQ form engineering (validation, rate limiting, `?product=slug` deep links — aligns with C-18; note: it uses CAPTCHA, planned direction is honeypot per C-18, decide at implementation) · Product + BreadcrumbList schema types (fix URLs) · per-product titles/meta · honest "positioned to export" hedging on /export · consistent footer NAP · 5-step order process section (rewrite as "How We Work", D-16).

## 5. Target Information Architecture

### 5.1 Navigation (header)
Products (mega-menu C-02) · Facility & Quality · Certifications · Resources · About — plus CTA pair "Download Catalog" / **"Request a Quote"**. Footer adds Markets, Contact, Insights (when live), legal strip.

### 5.2 Sitemap & URL migration (301 map — LOCKED with E-01)

| Current URL | New URL |
|---|---|
| `/` | `/` |
| `/products` | `/products` |
| `/products/frozen-green-peas` | `/products/frozen-vegetables/green-peas` |
| `/products/frozen-sweet-corn` | `/products/frozen-vegetables/sweet-corn` |
| `/products/frozen-mixed-vegetables` | `/products/frozen-vegetables/mixed-vegetables` |
| `/products/baby-corn` | `/products/frozen-vegetables/baby-corn` |
| `/products/mango-pulp` | `/products/fruit-pulps/mango-pulp` |
| `/products/guava-pulp` | `/products/fruit-pulps/guava-pulp` |
| `/products/strawberry-pulp` | `/products/fruit-pulps/strawberry-pulp` |
| `/products/ginger-garlic-paste` | `/products/value-added/ginger-garlic-paste` |
| `/manufacturing` | `/facility` |
| `/company` | 301 → `/about` (compliance content moves to /certifications) |
| `/export` | `/markets/gulf-middle-east` (301) — `/markets` index optional |
| `/certifications`, `/about`, `/contact`, `/insights` | unchanged |
| `/ar/*`, `/fr/*`, `/ru/*` | 410/redirect to `/` until real translations (see 7.2) |
| `/global-markets` | 301 → `/markets/gulf-middle-east` (fixes existing 404) |

### 5.3 Page inventory (target)
Home · Products index · 8 product pages · Facility & Quality · Certifications · About · Markets (Gulf, SEA) · Resources · Contact · Insights (hidden until ≥3 posts) · 404 · Privacy.

## 6. Conversion Strategy

- **Primary conversion:** RFQ form submit. Secondary: WhatsApp click, sample request, spec download, tour booking. Events per SEO_PLAYBOOK §9.
- Every page ends in C-17 CTA band; product pages add sticky mobile bar. One form site-wide (C-18); "sample"/"tour" are intents, not new forms.
- SLA is the conversion promise: reply in 24h, spec + indicative FOB in 48h — stated at form, in CTA bands, in FAQ. Owner must actually staff this.
- De-risk kit on home + about: open specs / samples / inspection welcome / virtual tour. This is the answer to "why reply to a company with no track record".

## 7. Future-Proof Architecture

### 7.1 Stack
Keep Next.js + Payload + Vercel (already in place, fits static-first + CMS-ready requirement). Custom domain must be the canonical everywhere; staging protected (Vercel password/noindex).

### 7.2 i18n
Now: English only; **remove locale trees from sitemap + serve 410 (or 301 to `/`) for /ar, /fr, /ru; remove language switcher** (extends D-08 — fake RTL-English pages actively insult the #1 target market). Later (Phase 4): `/ar` path prefix, real translations, hreflang en/ar/x-default, logical-properties layout already RTL-safe.

### 7.3 CMS content model (Payload collections — LOCKED shape, E-03)

```
products:
  name, slug, category (rel), summary, applications[]
  gallery[] (media, role: pack|macro|context)
  specs: { physicoChemical[], organoleptic[], microbiological[], contaminants[] }  # rows: {parameter, value, unit?, method?}
  packagingOptions[]: {format, netWeight, unitsPerCarton, cartonsPerPallet}
  containerLoading: {teu20Units, teu20NetMT, palletNote}
  shelfLife, storageTemp, moqRange
  faq[]: {q, a}
  downloads[]: {label, file}
  seo: {title, description, ogImage}
categories: name, slug, intro, processingMethod
certifications: name, issuingBody, status (registered|in-certification), number?, validFrom?, validTo?, scope?, certificateFile?, targetDate?
facilityFacts: key, label, value, verified(bool)
resources: title, type, file, product? (rel)
posts (insights): deferred — title, slug, body, product-rel, seo
globals: contactChannels (single source for phone/WhatsApp/email — CTA bands must consume this, never hardcode numbers → prevents the 910000000000 class of bug), legalIdentity (CIN/GST/IEC/FSSAI), sla, addresses
```

### 7.4 Scalability
New products = CMS rows, no code. New market pages = template + CMS. Country/distributor pages, case studies, testimonials: schema slots reserved but UNPUBLISHED until real (D-01/D-03). Blog architecture exists, gated on content quality (D-15).

## 8. Media Plan

### 8.1 Replace
All 4 mismatched product stock photos (B1) · all placeholder facility SVGs (B2) · "ChatGPT Image" hero PNG (rename/replace; AI hero acceptable interim if it passes DESIGN_SYSTEM §5 rules and gets a proper filename/alt).

### 8.2 Real shoot (Karad facility — owner to schedule; shot list)
1. Exterior + signage (establishes plant is real) 2. Intake/grading with raw produce 3. Processing line (aseptic filler) 4. Cold storage interior, −18°C display visible 5. QA lab, instruments in use 6. Packing/dispatch, cartons + pallets 7. Gloved hands + hairnets details (food-safety cues) 8. Team portraits incl. founder (for C-20) 9. Finished packs: drums, cartons, pails 10. 60–90s walkthrough video (muted-autoplay-capable, captioned). Style per DESIGN_SYSTEM §5.

### 8.3 Interim AI imagery
Per DESIGN_SYSTEM §5 rules + PROMPT_LIBRARY P-17. Never: facility-as-real, fake staff, documents.

### 8.4 Product photography (phase 2–3)
Consistent set per product: pack shot on cream seamless + macro. Until then: correctly-matched licensed stock only (no wheat-for-peas).

## 9. Success Metrics

| Metric | Target (6 months post-relaunch) |
|---|---|
| RFQ submissions | baseline → track; primary KPI |
| WhatsApp clicks (working links!) | tracked from day 1 |
| Spec sheet downloads | tracked; leading indicator of serious buyers |
| Diligence-scan integrity | 0 fabricated claims on site (QA §A) |
| Lighthouse mobile / CWV | ≥90 / green on home + products |
| Indexing | vnpglobal.in canonical for 100% of pages; staging deindexed |
| Certifications displayed with real numbers | grows as certs land (owner-driven) |
