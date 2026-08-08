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

- **Plausible chosen** (ANALY-01, checkpoint 04-05 — not still open): cookieless, no consent-banner engineering cost, minimal script weight given T-206's Lighthouse gap. Script mounted site-wide in `src/app/(site)/[locale]/layout.tsx`, guarded by `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (no-ops when unset). `trackEvent` (`src/lib/analytics.ts`) dispatches `rfq_submit`, `inquiry_submit`, `whatsapp_click` today — `sample_request`, `spec_download`, `tour_request` are not wired yet, add when those flows exist (T-202 Resources hub is the natural place for `spec_download`). **Remaining action is not code**: create a Plausible site for the production domain and set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` in Vercel's project env vars — data won't flow until that's done.
- Search Console + Bing Webmaster Tools from day one once the site is public. UTM discipline for outbound campaigns. Baseline CWV via PageSpeed Insights monthly.

## 10. Keyword Research Framework

Track every target keyword in one table before writing content against it — prevents scattergun pages and makes priority visible.

| Keyword | Search Intent | Product | Market | Priority | Target URL | Existing/New | Conversion Value | Current Ranking | Notes |
|---|---|---|---|---|---|---|---|---|---|
| mango pulp exporter india | commercial | Mango pulp | — | P0 | /products/fruit-pulps/mango-pulp | Existing | High | unranked (new domain) | needs validation |
| aseptic mango pulp 215kg drum | commercial/long-tail | Mango pulp | — | P0 | /products/fruit-pulps/mango-pulp | Existing | High | unranked | spec long-tail, our open lane |
| iqf green peas exporter india | commercial | Frozen green peas | — | P0 | /products/frozen-vegetables/green-peas | Existing | High | unranked | needs validation |
| frozen sweet corn supplier india | commercial | Frozen sweet corn | — | P0 | /products/frozen-vegetables/sweet-corn | Existing | High | unranked | needs validation |
| mango pulp supplier uae | commercial, Gulf-modified | Mango pulp | Gulf | P1 | /markets/gulf-middle-east + product page | Existing | High | unranked | needs validation |
| halal frozen vegetables supplier | commercial, Gulf-modified | Frozen vegetables | Gulf | P1 | /markets/gulf-middle-east | Existing | Medium | unranked | needs validation |
| how to import frozen vegetables from india | informational | — | — | P2 | /insights (deferred, T-401) | New | Medium | unranked | blog cluster seed, §6 |

Every row here is a hypothesis from §1's priority clusters, not a measured result — **do not fill "Current Ranking" or invent search volume without real Search Console/keyword-tool data.** Populate and re-prioritize monthly once Search Console has baseline data (§9).

## 11. Off-Page / Entity Consistency

Goal: search engines and AI answer systems resolve "VNP Global" to one unambiguous entity — same facts everywhere, not just on the website.

Keep identical across every surface: LinkedIn company page, Google Business Profile (Pune office), APEDA exporter directory, FSSAI license lookup, GST records, any trade-association or exhibition profile:
- Company legal name (exact match, no abbreviation drift)
- Logo (current version, not an old crop)
- Website URL
- Company description (one canonical paragraph, don't rewrite per-platform)
- Contact details (phone, email — same NAP everywhere)
- Business category/classification

**Do not**: buy directory-listing packages, mass-submit to low-quality business directories, or pursue backlinks purely for link count — matches this project's existing anti-fabrication stance (§8, DECISION_LOG pattern of rejecting unverifiable claims). Quality and consistency compound; volume of low-quality listings does not.
