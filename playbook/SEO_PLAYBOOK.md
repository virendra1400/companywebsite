# SEO_PLAYBOOK — VNP Global

Reality check first: a new domain will not outrank Shimla Hills/A-1 on head terms soon. SEO strategy = (1) win long-tail buyer-intent queries with the transparent-specs content nobody else publishes, (2) be technically flawless so outbound-driven visitors convert, (3) build the architecture so authority compounds. Credibility-first objective (PROJECT_MEMORY §5) means on-page quality > link chasing.

## 1. Keyword Strategy

### Priority clusters (buyer-intent, long-tail first)
| Cluster | Example terms | Target page |
|---|---|---|
| Mango pulp export | mango pulp exporter india, alphonso/totapuri mango pulp supplier, aseptic mango pulp 215kg drum, mango pulp price per ton FOB | /products/fruit-pulps/mango-pulp |
| Guava/strawberry pulp | guava pulp exporter india, aseptic guava pulp supplier | respective product pages |
| IQF vegetables | iqf green peas exporter india, frozen sweet corn supplier india, iqf mixed vegetables bulk | respective product pages |
| Ginger-garlic paste | ginger garlic paste exporter india, bulk ginger garlic paste supplier | product page |
| Gulf-modified | mango pulp supplier uae/dubai/saudi arabia, halal frozen vegetables supplier | /markets/gulf + product pages |
| Spec/doc long-tail (the open lane) | mango pulp specification brix, iqf green peas specification, 20ft container mango pulp drums quantity, mango pulp COA | product pages + resources |

Rules: one primary keyword per page; product pages target `[product] + exporter/supplier + india` plus spec long-tail in section headings; never keyword-stuff — spec tables naturally carry the long-tail.

## 2. URL Structure (LOCKED — E-01)

```
/                          /about                    /contact
/products                  /facility                 /resources
/products/frozen-vegetables/{green-peas|sweet-corn|mixed-vegetables|baby-corn}
/products/fruit-pulps/{mango-pulp|guava-pulp|strawberry-pulp}
/products/value-added/ginger-garlic-paste
/certifications            /markets/{gulf-middle-east|southeast-asia}
/insights/{slug}           (deferred)
```
Lowercase, hyphens, no trailing slashes, no dates in slugs. Future locale: `/ar/...` prefix; `en` stays unprefixed (E-02).

## 3. Metadata Templates

- Title: `{Product} Exporter & Supplier from India | VNP Global` (≤60 chars). Home: `VNP Global — Frozen Vegetables & Fruit Pulp Exporter, India`.
- Meta description (≤155): fact-dense, includes pack format + CTA. Example (mango): `Aseptic Alphonso & Totapuri mango pulp in 215 kg drums. Full specifications, COA per batch, samples available. FOB Indian ports. Get a quote in 24h.`
- OG: og:title/description/image (1200×630 branded product card), og:type website/product; twitter:card summary_large_image.
- One H1 per page = primary keyword phrase naturally worded.

## 4. Structured Data (JSON-LD)

- **Organization** (site-wide): name, url, logo, address (both), contactPoint (tel, email, availableLanguage), sameAs (LinkedIn, Instagram). Add `iso6523Code`/identifiers when IEC/GST public.
- **Product** (each product page): name, image, description, brand VNP Global, category; `additionalProperty` for Brix/pack size etc. **No offers/price/aggregateRating — never fake ratings.**
- **BreadcrumbList** on all nested pages. **FAQPage** on product FAQ blocks. **WebSite** on home.
- Validate with Google Rich Results test in QA.

## 5. Technical SEO Checklist

- `sitemap.xml` auto-generated, referenced in `robots.txt`; robots allows all, blocks CMS/admin + `/api/`.
- Canonical on every page (self); 301s from any legacy URLs at relaunch (map old → new in TASK_BACKLOG T-303).
- hreflang: none until Arabic ships; then `en`, `ar`, `x-default`.
- Core Web Vitals budget: LCP <2.5s (hero image preload, AVIF/WebP, responsive `srcset`), CLS <0.1 (dimensions on all media, font-display swap + size-adjusted fallbacks), INP <200ms (minimal JS, no heavy sliders).
- Images: descriptive filenames (`aseptic-mango-pulp-215kg-drum.avif`), alt per DESIGN_SYSTEM §8, lazy-load below fold, explicit width/height.
- 404 returns 404 (not soft-200); trailing-slash policy enforced once.
- Server: HTTPS, HSTS, compression (brotli), cache headers on static assets.

## 6. Content Clusters & Blog (Phase 4, deferred)

Seed topics (each targets a real buyer question, supports a product page):
1. "Mango pulp specifications explained: Brix, acidity, and what a COA covers"
2. "Aseptic drum vs OTS can vs frozen pulp: choosing formats for beverage production"
3. "How to import frozen vegetables from India: documentation checklist"
4. "Halal certification for GCC food imports: what buyers should verify"
5. "IQF vs block-frozen vegetables: yield and handling differences"
Internal links: each post → its product page + resources page; product pages → cluster posts once live. Publish only when ≥3 are ready and substantive (thin blog = trust damage).

## 7. Internal Linking Rules

- Home → category pages → product pages (2 clicks max to any product).
- Every product page links: sibling products (same category), certifications page, resources, contact-with-product-param.
- Footer links to all key pages (crawl paths) but no link farms.

## 8. Off-Page (owner actions, not code)

- Google Business Profile (Pune office). APEDA exporter directory listing once registered. LinkedIn company page completeness. Consistent NAP everywhere.
- Directories that matter for verification (not links): APEDA, FSSAI license lookup, GST — buyers cross-check; ensure names match exactly.

## 9. Measurement

- GA4 (or privacy-light alternative e.g. Plausible) + Search Console from day one; events: rfq_submit, sample_request, whatsapp_click, spec_download, tour_request. UTM discipline for outbound campaigns. Baseline CWV via PageSpeed Insights monthly.
