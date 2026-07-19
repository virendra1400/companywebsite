# Architecture Research

**Domain:** Premium multi-language B2B corporate + lead-gen site (agro/food export), headless CMS, 4 locales incl. Arabic RTL
**Researched:** 2026-07-14
**Confidence:** HIGH (rendering/i18n/SEO patterns — Next.js/next-intl/Sanity docs + multiple corroborating sources), MEDIUM (CRM/WhatsApp specifics — vendor not yet chosen)

## Benchmark Reality Check

Client-provided reference `piyushfarms.com` was fetched and represents the **floor**, not the target:

- Single language, no hreflang/i18n at all
- Flat product list (2 categories, no subcategory depth, no per-product detail architecture visible)
- One generic contact form (no per-product RFQ, no incoterm/destination/quantity fields)
- No certifications displayed as structured trust content (text claims only, no PDF/logo system)
- No sitemap/structured-data signals, no blog taxonomy (recipe posts are unstructured)
- No WhatsApp integration

Everything in this document — locale architecture, structured product+certification content model, per-product RFQ, WhatsApp, technical SEO — is required specifically because the benchmark shows what "good enough" competitors ship, and the project's positioning goal (premium, trusted, international) depends on visibly exceeding it.

## Brand & Target Domain


Brand name: **Star Agrevolution**. `staragrevolution.com` is the client's target domain — currently a parked/placeholder page with zero built content (no nav, products, categories, or copy). It is pure greenfield: nothing to migrate, nothing to preserve. The only real external reference point is the `piyushfarms.com` benchmark above; treat `staragrevolution.com` purely as "where this new site will live," not as a design or content input.

## Standard Architecture

### System Overview

```
┌───────────────────────────────────────────────────────────────────────┐
│                         EDGE / CDN (Vercel or Cloudflare)              │
│   Static HTML (SSG), ISR cache, image optimization, geo routing        │
├───────────────────────────────────────────────────────────────────────┤
│                         NEXT.JS APP (App Router)                       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌───────────────────┐   │
│  │ [locale]/   │ │ [locale]/  │ │ [locale]/  │ │ API Route Handlers │   │
│  │ layout+i18n │ │ catalog    │ │ pages/blog │ │ (forms, revalidate,│   │
│  │ (RTL switch)│ │ (SSG+ISR)  │ │ (SSG+ISR)  │ │  sitemap, robots)  │   │
│  └──────┬─────┘ └──────┬─────┘ └──────┬─────┘ └──────────┬─────────┘   │
├─────────┴──────────────┴──────────────┴──────────────────┴────────────┤
│                    CONTENT FETCH LAYER (build + revalidate time)       │
│              GROQ/GraphQL query layer → typed content client            │
├───────────────────────────────────────────────────────────────────────┤
│   ┌────────────────┐   ┌──────────────────┐   ┌───────────────────┐   │
│   │ Headless CMS    │   │ Media CDN         │   │ Form Processing   │   │
│   │ (Sanity/Strapi)│   │ (CMS-native +     │   │ (Route Handler +  │   │
│   │ localized       │   │  Cloudinary/Mux   │   │  rate limit +     │   │
│   │ content model   │   │  for video)       │   │  spam filter)     │   │
│   └────────────────┘   └──────────────────┘   └──────────┬─────────┘   │
│                                                            │             │
│                                            ┌───────────────┴──────────┐ │
│                                            │ Email (transactional) +  │ │
│                                            │ CRM webhook + WhatsApp   │ │
│                                            │ click-to-chat            │ │
│                                            └───────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|-----------------|------------------------|
| Locale router/layout | URL-based locale segment, RTL/LTR switching, hreflang emission | Next.js `[locale]` segment + `next-intl` middleware |
| Content fetch layer | Typed query functions per content type, isolates CMS SDK from pages | GROQ (Sanity) or REST/GraphQL (Strapi) client module, one function per content type |
| Headless CMS | Source of truth for all editable content, per-locale fields, editor UX | Sanity Studio or Strapi Admin, deployed separately from the site |
| Catalog pages | Category listing + product detail, scalable without rebuild | Next.js dynamic routes, ISR + on-demand revalidation webhook from CMS |
| Static/marketing pages | About, Certifications, Export track record, Company profile | Block-based "page builder" schema in CMS, rendered by a generic block-renderer component |
| Blog/Insights | SEO content, authority building | Same pattern as catalog: list + detail, ISR |
| Form processing | Validate, filter spam, rate-limit, fan out to email + CRM | Next.js Route Handler, server-only, no client-side secrets |
| WhatsApp integration | Low-friction contact CTA | Static `wa.me` deep links with prefilled, context-aware message text |
| Media handling | Serve optimized images/video/PDF per locale | CMS asset pipeline (images/PDF) + external video host (Cloudinary/Mux/YouTube unlisted) |
| SEO infrastructure | Sitemaps, structured data, hreflang, robots | Route Handlers generating XML/JSON at request/build time from CMS data |

## Recommended Project Structure

```
src/
├── app/
│   ├── [locale]/                  # locale-scoped route tree (en, ar, fr, ru)
│   │   ├── layout.tsx             # dir="rtl"/"ltr", font, next-intl provider
│   │   ├── page.tsx               # homepage
│   │   ├── products/
│   │   │   ├── page.tsx           # category index
│   │   │   └── [category]/[product]/page.tsx
│   │   ├── certifications/page.tsx
│   │   ├── about/page.tsx
│   │   ├── insights/[slug]/page.tsx
│   │   └── contact/page.tsx
│   ├── api/
│   │   ├── inquiry/route.ts       # form submit handler
│   │   ├── revalidate/route.ts    # CMS webhook → on-demand ISR
│   │   └── sitemap/[locale]/route.ts
│   ├── sitemap.xml/route.ts       # sitemap index
│   └── robots.ts
├── cms/
│   ├── client.ts                  # CMS SDK singleton (Sanity client / Strapi fetcher)
│   ├── queries/                   # one file per content type (product.ts, category.ts…)
│   └── types.ts                   # generated/hand-written content types
├── components/
│   ├── blocks/                    # page-builder block renderers (Hero, StatBand, LogoGrid…)
│   ├── catalog/                   # ProductCard, CategoryNav, SpecTable
│   ├── forms/                     # RfqForm, InquiryForm (client components + server action)
│   └── seo/                       # JsonLd, HreflangLinks helpers
├── i18n/
│   ├── routing.ts                 # next-intl locale config, RTL locale list
│   └── messages/{en,ar,fr,ru}.json  # UI chrome strings (NOT CMS content)
└── lib/
    ├── rate-limit.ts
    └── spam-filter.ts
```

### Structure Rationale

- **`cms/queries/`:** one function per content type keeps pages ignorant of the CMS's query language; swapping Sanity↔Strapi later touches this folder only.
- **`components/blocks/`:** the "page builder" pattern (About, Certifications, Export Track Record are all instances of a flexible block-based `Page` document) avoids hardcoding every marketing page as bespoke React — new pages/sections come from CMS content, not code.
- **`i18n/messages/`:** UI chrome (nav labels, button text, form labels) is translation-file-based (small, developer-controlled, human-translated at build time); actual page/product content lives in the CMS. Don't conflate the two — CMS content changes far more often and by non-developers.

## Content Model Schema Sketch (CMS)

**Localization approach:** Document-level localization (one document per locale, linked by a shared, locale-invariant key), not field-level i18n objects. Reasoning: the project's stated constraint is *professional human translation delivered on its own timeline* — English ships first, AR/FR/RU follow later per document. Document-level lets an editor publish the English `Product` today and add the Arabic translation next week without a half-populated mega-object. Split each content type into:

1. A **locale-invariant "data" document** — the facts that don't change by language (SKU, HS code, MOQ, incoterms supported, images, certification refs, spec numbers).
2. A **localized "content" document per language** — name, description, marketing copy, locale-specific SEO fields — referencing the data document.

```
Product (data, locale-invariant)
├── productKey: slug (stable across locales, used for URL + reference)
├── sku, hsCode, moq, packagingOptions[], incotermsSupported[]
├── images[] (CDN asset refs)
├── specSheet (PDF asset ref)
├── category → ref(Category data)
├── certifications[] → ref(Certification)
└── status: draft | published | discontinued

ProductTranslation (localized, one per locale)
├── locale: en | ar | fr | ru
├── product → ref(Product data)
├── name, shortDescription, longDescription (rich text)
├── seo: { title, description, ogImage }
└── translationStatus: pending | in_review | published

Category (data) / CategoryTranslation (localized)
├── categoryKey (slug), parentCategory → ref(self)   # supports category > subcategory nesting
└── (translation): name, description, seo

Certification (data) / CertificationTranslation
├── certKey, logo (image asset), certificatePdf (file asset), issuingBody, validUntil
└── (translation): name, description

Page (data) / PageTranslation
├── pageKey (slug: about, export-track-record, company-profile…)
├── blocks[] → array of block references (Hero, StatBand, LogoGrid, MapBlock, PdfDownload…)
└── (translation): block content is itself localized per block — either the block
    schema carries locale-scoped fields, or blocks live inside PageTranslation entirely.
    Recommendation: blocks live inside PageTranslation (simpler mental model, one editor
    screen per language) — the "data" doc for Page is thin (just pageKey + block order template).

BlogPost (data) / BlogPostTranslation
├── postKey (slug), author, publishDate, category → ref(BlogCategory)
└── (translation): title, body (rich text), excerpt, seo

Settings (singleton, per-locale)
├── siteName, defaultOgImage, orgJsonLd fields (legal name, address, logo)
├── navigationMenu (localized labels + links)
└── contactChannels: { whatsappNumber, salesEmail, crmWebhookUrl (env-injected, not editor-facing) }
```

**Why not field-level `{en: "...", ar: "...", fr: "...", ru: "..."}` objects:** simpler for CMS tooling but forces every document into "all locales visible in one editor screen," makes partial-translation states awkward to represent, and every text field becomes a 4-way object even when it's a shared identifier. Document-level costs one extra reference hop per query but matches the actual editorial workflow (English first, translations trickle in) and lets a translator agency be given scoped access to only their locale's documents.

## Architectural Patterns

### Pattern 1: Static-first with on-demand ISR revalidation

**What:** Every page (catalog, marketing, blog) is statically generated at build/first-request and cached at the edge. The CMS webhook calls `/api/revalidate?path=...` on publish, invalidating only the changed page(s) — no full rebuild.
**When to use:** Any content-driven page where the editor expects "publish → live in seconds," but the content doesn't change per-request (true for this entire site — it's not personalized, no per-user state).
**Trade-offs:** Requires the CMS to fire a webhook with the correct path(s) per locale on every publish (Product + all its category ancestor pages + sitemap). Slightly more setup than plain SSG, but avoids full rebuilds as the catalog grows to hundreds of products.

### Pattern 2: Page-builder blocks for marketing pages, fixed templates for catalog

**What:** About/Certifications/Export-Track-Record/Company-Profile are free-form (block array), but Category and Product pages use a fixed, structured template (spec table, cert badges, RFQ CTA) driven by structured fields, not blocks.
**When to use:** Free-form blocks for pages that change shape over time and are edited rarely by marketing; fixed templates for pages that need consistent structured data (JSON-LD `Product` schema needs real fields, not opaque rich-text blocks).
**Trade-offs:** Two mental models in the CMS (blocks vs. fixed schema) — acceptable, and standard practice; don't force product pages into the block builder just for consistency, it breaks structured-data generation.

### Pattern 3: Locale-aware hreflang generation from actual published translations

**What:** `generateMetadata()` on each page queries which locales actually have a published `Translation` document for that entity (not a hardcoded list of all 4 locales) and emits `<link rel="alternate" hreflang>` only for those, plus `x-default` pointing at English.
**When to use:** Always, in a project where translations lag behind the source locale — emitting hreflang for a locale with no live page is a real SEO defect (broken alternate → Search Console errors).
**Trade-offs:** Requires the query layer to expose "translation status," slightly more query complexity than a static locale array.

## Data Flow

### Content publish flow

```
Editor writes content in CMS Studio (per locale)
    ↓ publish
CMS webhook → /api/revalidate (path + locale)
    ↓
Next.js on-demand ISR invalidates cached page(s)
    ↓
Next visitor request → regenerated HTML served from edge cache
```

### RFQ / inquiry flow

```
Visitor fills RFQ form (product context pre-filled if on a product page)
    ↓ client-side: honeypot field, basic validation
POST /api/inquiry (Route Handler, server-only)
    ↓
1. Rate-limit check (per-IP, e.g. Upstash Redis or in-memory+edge KV)
2. Honeypot + timing-based bot check
3. Optional invisible CAPTCHA (Cloudflare Turnstile) if suspicious
    ↓ (passes)
Fan-out (best-effort, both must succeed or be queued/retried):
    ├── Transactional email → sales inbox (Resend/SendGrid)
    └── CRM webhook (generic POST — HubSpot/Zoho/Pipedrive endpoint, TBD)
    ↓
Confirmation shown to visitor (+ optional "or WhatsApp us" fallback CTA)
```

### WhatsApp flow (MVP)

```
"Chat on WhatsApp" button (persistent + per-product)
    ↓
Static wa.me/<number>?text=<url-encoded, locale-aware, product-aware prefilled message>
    ↓
Opens WhatsApp app/web — conversation happens entirely outside the website
```

No backend involvement for MVP — it's a link, not an integration. Revisit WhatsApp Business Platform (Cloud API) only if the business later wants automated welcome replies, CRM logging of WhatsApp conversations, or broadcast campaigns — that requires a Business Solution Provider (e.g., Twilio, 360dialog, Meta directly) and materially more infrastructure (webhook receiver, message templates, opt-in management). Do not build that for v1; it's not justified by "instant contact CTA."

### Key data flows

1. **Content → page:** CMS is always the source of truth; Next.js never writes back to the CMS except via the revalidation webhook trigger (one-way for content).
2. **Form → lead system:** Website never stores lead data itself (no database of its own) — it's a stateless relay to email + CRM. Reduces PII-handling surface area on the site itself.
3. **Media → CDN:** Images/PDFs uploaded once into the CMS asset pipeline, served through its CDN with on-the-fly resizing; video is *not* uploaded to the CMS (bloats storage/bandwidth cost) — hosted on Cloudinary/Mux/YouTube-unlisted and embedded by reference.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|---------------------------|
| Launch (dozens of products, 4 locales) | Static-first + ISR is already correct; no changes needed |
| Growth (hundreds of products, more locales added) | Ensure category pages paginate/facet rather than listing all products; add locale-invariant/localized split scales linearly — no schema change needed to add a 5th locale, just a new Translation document type instance |
| High traffic (organic SEO success, spikes from trade-show mentions) | Edge caching absorbs most read load automatically (static/ISR); the only scaling concern is the form-submission path (rate-limit store + email/CRM API limits) — add a queue (e.g., simple DB or Upstash queue) if CRM API rate limits become the bottleneck |

### Scaling Priorities

1. **First bottleneck:** CMS query fan-out at build time if using pure SSG for a large catalog (hundreds of products × 4 locales = thousands of pages). Mitigated by relying on ISR/on-demand generation rather than generating everything at build time.
2. **Second bottleneck:** Form abuse/spam volume as the site gains organic traffic. Mitigated by the layered honeypot + rate-limit + optional CAPTCHA approach from day one, not bolted on later.

## Anti-Patterns

### Anti-Pattern 1: Hardcoding locale strings as flat `en`/`ar`/`fr`/`ru` keys on every CMS field

**What people do:** Add a JSON object `{en: "...", ar: "...", ...}` to every field for "simplicity."
**Why it's wrong:** Makes partial translation state invisible, bloats every document with mostly-empty fields at launch (only English exists), and complicates giving a translation agency scoped access to just their locale.
**Do this instead:** Document-level localization (see Content Model section) with an explicit `translationStatus` field.

### Anti-Pattern 2: Building the WhatsApp Business API integration for a v1 "contact us" CTA

**What people do:** Reach for the full Business Platform (webhooks, message templates, BSP account) because "WhatsApp integration" sounds like it needs one.
**Why it's wrong:** Adds a paid third-party BSP relationship, approval workflows, and webhook infrastructure for a feature that a static `wa.me` link fully satisfies at this stage.
**Do this instead:** Ship `wa.me` deep links; revisit only if there's a concrete need for automation/logging that a link can't provide.

### Anti-Pattern 3: Generating all locale × product pages at build time with plain SSG (`getStaticPaths`/`generateStaticParams` returning everything)

**What people do:** Pre-render every product page in every locale on every deploy.
**Why it's wrong:** Build times grow linearly with catalog size × locale count; a growing catalog (explicit project requirement) turns every deploy into a slow, CMS-hammering build.
**Do this instead:** Generate a small set of high-traffic paths at build time, let the rest resolve via ISR (`dynamicParams: true`) on first request, and invalidate via the CMS publish webhook thereafter.

### Anti-Pattern 4: Treating hreflang as a static, always-4-locale list

**What people do:** Emit `<link rel="alternate" hreflang="ar">` etc. on every page regardless of whether an Arabic version actually exists.
**Why it's wrong:** Search Console flags mismatched hreflang alternates as errors, and it sends crawlers/users to non-existent or fallback pages, undermining the "professional, complete" impression this project explicitly wants.
**Do this instead:** Query actual published translation status per document (Pattern 3 above).

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|----------------------|-------|
| Headless CMS (Sanity or Strapi) | Server-side fetch at build/revalidate time via SDK; webhook → `/api/revalidate` | Sanity: hosted, generous free tier, GROQ query language, native image CDN. Strapi: self-hosted, SQL-only, more ops burden but full data control — choose based on data-residency/cost constraints, covered in STACK.md |
| Transactional email (Resend/SendGrid/Postmark) | Server-side API call from `/api/inquiry` Route Handler | Use a dedicated transactional provider, not SMTP-from-app-server — deliverability and DKIM/SPF setup matter for B2B credibility |
| CRM (TBD — HubSpot/Zoho/Pipedrive) | Generic webhook POST from `/api/inquiry`, or Zapier/Make as a no-code intermediary if CRM choice is deferred | Keep the integration behind one internal function (`sendToCrm(lead)`) so swapping CRM vendors later doesn't touch form-handling code |
| WhatsApp (`wa.me`) | Static link, no API | No server involvement; see Data Flow section |
| Video hosting (Cloudinary/Mux/YouTube unlisted) | `<iframe>`/player embed referenced from CMS field (URL string), not uploaded as a CMS asset | Keeps CMS storage/bandwidth costs down |
| Rate-limit store (Upstash Redis or platform KV) | Called from `/api/inquiry` before processing | Needed regardless of hosting choice — in-memory rate limiting doesn't survive serverless cold starts/multiple instances |
| Analytics (GA4 / Plausible / similar) | Client-side tag + server-side conversion event on successful inquiry submit | Track inquiry submissions as conversion events, not just pageviews — this is a lead-gen site, pageviews alone don't measure success |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|----------------|-------|
| Pages ↔ CMS query layer | Function calls (`getProduct(slug, locale)`) | Never call the CMS SDK directly from a page component — always through `cms/queries/` |
| Forms (client) ↔ Route Handler | `POST` with JSON body, CSRF-safe (same-origin) | No client-side secrets (CRM/email API keys stay server-only, injected via env vars) |
| i18n routing ↔ page components | `next-intl` hooks (`useTranslations`, `useLocale`) for UI chrome only | Page *content* comes from CMS query layer, not translation files — don't mix the two systems |
| SEO helpers ↔ pages | Shared `components/seo/JsonLd` + `generateMetadata` conventions | Every page type implements the same `generateMetadata` contract so sitemap/hreflang/JSON-LD stay consistent across catalog, blog, and marketing pages |

## Suggested Build Order

1. **Foundation:** Next.js scaffold, `[locale]` routing skeleton, RTL/LTR layout switching, base design system (fonts, spacing, premium visual language) — everything downstream depends on locale-aware layout existing first.
2. **CMS schema + Studio:** Model Product/Category/Certification/Page/BlogPost/Settings (data + translation split) in the chosen CMS; deploy Studio; set up preview mode. Populate with realistic placeholder content per the project's "structure first, real content later" approach.
3. **Content fetch layer + core static pages:** `cms/queries/`, then Home, About, Certifications, Company Profile, Export Track Record — these validate the page-builder block pattern end-to-end before catalog complexity is added.
4. **Product catalog:** Category listing → subcategory → product detail, with ISR + on-demand revalidation webhook wired to the CMS. This is the most structurally complex piece (data/translation split, spec tables, structured data) — do it once the block pattern is proven, not before.
5. **RFQ/inquiry forms + spam/rate-limit + email/CRM fan-out:** Depends on catalog existing (per-product RFQ prefill) and on Settings singleton (contact channels/CRM webhook URL).
6. **WhatsApp click-to-chat:** Trivial once product/category context exists to build prefilled messages from; layer in after catalog and forms.
7. **Blog/Insights:** Same list/detail pattern as catalog; lower priority since it's an SEO/authority play, not core conversion path.
8. **SEO infrastructure hardening:** Sitemap generation (per-locale + index), structured data (Organization, Product, BreadcrumbList, FAQPage), locale-aware hreflang, robots.txt — build the *shared utilities* early (step 1's `components/seo/`), but do the full audit/completeness pass once all page types exist so nothing is missed.
9. **Analytics + conversion tracking:** Wire once forms exist (step 5) so inquiry submission can be tracked as a conversion event.
10. **Performance/Core Web Vitals + cross-locale RTL QA pass:** Final hardening before launch — image optimization audit, font-loading strategy for Arabic script, RTL visual regression check across every page type built.

## Sources

- [Next.js Internationalization docs](https://nextjs.org/docs/pages/guides/internationalization)
- [next-intl App Router routing configuration](https://next-intl.dev/docs/routing/configuration)
- [next-intl App Router getting started](https://next-intl.dev/docs/getting-started/app-router)
- [Headless CMS 2026: Contentful vs Strapi vs Sanity vs Payload](https://dev.to/pooyagolchian/headless-cms-2026-contentful-vs-strapi-vs-sanity-vs-payload-compared-5bi3)
- [Sanity: Top 5 Headless CMS Platforms for 2026](https://www.sanity.io/top-5-headless-cms-platforms-2026)
- [FocusReactive: Headless CMS SEO — architecture decisions that affect rankings](https://focusreactive.com/blog/the-best-headless-cms-for-seo-in-2026/)
- [Basin: 6 form spam prevention strategies](https://usebasin.com/blog/six-form-spam-prevention-strategies-you-can-deploy-today)
- [FORMLOVA: Honeypot vs CAPTCHA comparison](https://formlova.com/en/blog/contact-form-captcha-comparison-en)
- [Qualimero: wa.me / WhatsApp link reference](https://qualimero.com/en/blog/whatsapp-link)
- [Agencia Reinicia: WhatsApp Business API website integration 2026](https://www.agenciareinicia.com/en/blog/integrar-whatsapp-business-api-pagina-web/)
- Direct fetch/analysis of client benchmark: piyushfarms.com (2026-07-14)
- Direct fetch/analysis of client's target domain: staragrevolution.com (2026-07-14) — confirmed parked/placeholder, pure greenfield

---
*Architecture research for: Premium multi-language B2B agro/food export corporate + lead-gen site*
*Researched: 2026-07-14*
