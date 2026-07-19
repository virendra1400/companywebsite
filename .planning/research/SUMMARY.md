# Project Research Summary

**Project:** Star Agrevolution — Agro Export Corporate + Lead-Gen Website
**Domain:** Premium multi-language (EN / AR-RTL / FR / RU) B2B corporate + lead-generation site for an India-based agro/food manufacturer and exporter
**Researched:** 2026-07-14
**Confidence:** MEDIUM-HIGH

## Executive Summary

This is a content-driven, SEO-critical B2B trust-building site, not e-commerce — the product looks like a catalog but the business model is "trust to RFQ/WhatsApp inquiry to offline quote to contract." Experts build this class of site as a statically-generated (SSG + on-demand ISR) Next.js app on top of a headless CMS with true per-locale content modeling, because the two hardest constraints — 4 languages including Arabic RTL, and a catalog that must grow without re-architecture — are exactly what naive approaches (WordPress+WPML, hardcoded pages, field-level `{en, ar, fr, ru}` locale objects) break under within months. The client's own benchmark (piyushfarms.com) and domain (staragrevolution.com, a parked page) confirm this is a pure greenfield build with a low competitive bar to clear and real room to differentiate on multi-language depth, structured RFQ qualification, and verifiable trust content (certifications with real PDFs, export data, facility depth).

The recommended approach: Next.js (App Router) + `next-intl` for locale routing/RTL, Tailwind v4 logical properties for one CSS layer that mirrors correctly, a headless CMS with document-level (or per-field-with-fallback) localization, `react-hook-form` + Zod + Server Actions for RFQ/inquiry forms, Cloudflare Turnstile + honeypot for spam defense, Resend for transactional email, `wa.me` click-to-chat (not the full WhatsApp Business API) for instant contact, and Vercel hosting. One material open decision remains unresolved between the two architecture-focused research passes: which headless CMS and which localization *pattern* to use — see "Open CMS Decision" below. This should be settled with a small spike before the CMS/content-model phase is built out, not deferred.

The key risks are not exotic — they are well-known failure modes that are cheap to prevent early and expensive to retrofit: RTL treated as a CSS-flip instead of an architecture (logical properties from day one), hreflang/canonical misconfiguration silently breaking international SEO, the CMS content model treating locale as a page-copy dimension instead of a field/document dimension (the single hardest thing to fix once real content exists), building templates against unrealistic lorem-ipsum placeholders that break when real Arabic certification names and full-resolution facility photos arrive, and RFQ forms getting spam-flooded because email authentication (SPF/DKIM/DMARC) and bot defense were treated as an afterthought. All five are addressed by decisions made in the foundational and CMS-design phases, reinforced by explicit QA checkpoints later.

## Key Findings

### Recommended Stack

Next.js 16 (App Router) + React 19 + TypeScript is the consensus meta-framework for a content-driven, SEO-critical site of this shape — SSG/ISR gives fast Core Web Vitals per locale, and the file-based metadata/sitemap APIs handle hreflang and structured data without hand-rolled plumbing. `next-intl` is the community-standard i18n layer for the App Router (RSC-aware, no client-side i18n bundle bloat) — do not use the legacy `next-i18next` (Pages Router only). Tailwind CSS v4's logical properties (`ms-*`/`me-*`/`ps-*`/`pe-*`, `rtl:`/`ltr:` variants) are the single biggest lever for building one layout that mirrors correctly for Arabic instead of maintaining parallel stylesheets.

**Core technologies:**
- Next.js 16 (App Router) — SSR/SSG/ISR + SEO-friendly routing — de facto standard for content-driven, SEO-critical React sites
- next-intl 4.x — locale routing, RSC-aware translations, typed message keys — the only well-supported App Router i18n library
- Tailwind CSS v4 — logical CSS properties + RTL variants — avoids a parallel RTL stylesheet
- react-hook-form + Zod + Server Actions — RFQ/inquiry form state, validation, and submission with one shared schema client/server
- Cloudflare Turnstile + honeypot — spam defense without CAPTCHA friction that could cost a real buyer's inquiry
- Resend + React Email — transactional RFQ/inquiry notifications with proper deliverability posture
- Vercel — zero-config Next.js hosting, global edge network for the international audience, ISR revalidation on CMS webhook
- GA4 + GTM (+ consent banner for EU/GCC traffic) or Plausible as a cookieless alternative — analytics/lead tracking
- `wa.me` click-to-chat link (not the WhatsApp Business Platform/Cloud API) — satisfies "instant-contact CTA" at zero backend cost; revisit the full API only if automation/CRM-sync is validated as a real later need

### Open CMS Decision (Not Yet Settled — Flag for Early Spike)

STACK.md and ARCHITECTURE.md diverge on both **which CMS** and **which localization pattern** to use, and this divergence should be presented to the client/team as an open decision, not silently resolved by whichever file happened to be read last:

| | STACK.md recommendation | ARCHITECTURE.md recommendation |
|---|---|---|
| **Primary CMS** | Payload CMS (self-hosted, embeds directly in the Next.js app, TypeScript-native, generated types shared with frontend) | Sanity or Strapi (external CMS service, GROQ/REST query layer) |
| **Localization pattern** | Field-level: Payload's native `localization` config with per-field values + configurable fallback locale — one document per entity, fields carry all 4 locale values | Document-level: a locale-invariant "data" document (SKU, HS code, images, cert refs) + a separate localized "Translation" document per language, linked by a stable key |

**The tradeoff, not a settled choice:**
- **Field-level (Payload-native)** is simpler to query (one document = one entity) and has an out-of-the-box fallback-locale mechanism, but every document carries mostly-empty fields for untranslated locales at launch, and giving an external translation agency scoped access to "just French" is more awkward (their edits sit inside a shared multi-locale document).
- **Document-level (Sanity-style, but implementable in Payload or Strapi too)** matches the actual editorial workflow better — English ships today, Arabic/French/Russian translations arrive independently over time from a professional translation vendor — and makes partial-translation state explicit (a `translationStatus` field per language document) rather than implicit (empty field = not yet translated). It costs one extra reference hop per query and is a more deliberate content-model design exercise up front.

Both STACK.md and PITFALLS.md's Pitfall 3 agree that **whatever pattern is chosen, "locale as a duplicated content type/page copy" is always wrong** — the real choice is field-level-with-fallback vs. document-level-with-explicit-status, not whether to localize properly at all. Given this project's stated constraint ("professional human translation delivered on its own timeline, English first"), the document-level pattern has a stronger workflow-fit argument, but this is not confirmed as final — resolve during the CMS/content-model design phase, informed by the RTL spike below (a CMS switch, if needed, should happen before schema commitment, not after).

**Recommended resolution path:** treat CMS + localization-pattern selection as a first-week spike, not a default. Prototype one real content type (e.g., Product with a certification reference) in both the Payload field-level pattern and a document-level pattern (whether in Payload, Strapi, or Sanity) before committing the full schema.

### Payload Arabic RTL Admin-Chrome Limitation (Flag)

If Payload CMS is selected, be aware: as of 2025, Payload's **admin dashboard chrome** (not content fields) does not fully flip to RTL when Arabic is selected as the admin UI language (open GitHub issues #9482, #11162, #10344) — locale dropdown position, document `dir` defaults, etc. This is cosmetic to the surrounding panel, not to content editing — an Arabic-speaking editor can still type/see Arabic text correctly inside any field regardless of chrome direction (same experience as editing Arabic content in Gmail). Strapi has the same caveat; Storyblok/Sanity's RTL admin support is unconfirmed in current docs. **Verify with a throwaway Arabic collection early in Phase 1, before further schema/engineering commitment** — this is exactly the kind of finding that should trigger a phase-specific research/spike flag on the roadmap rather than being assumed away.

### Expected Features

Feature research is grounded in a live-fetched client benchmark (piyushfarms.com), confirmed as the *floor*: single-language, generic one-dropdown inquiry form, no WhatsApp, no structured certifications, no export data, no technical SEO. Every Active requirement in PROJECT.md already exceeds this floor — feature research confirms none of it is over-engineering relative to what a real India agro-exporter competitor ships today.

**Must have (table stakes, P1):**
- Category to product-detail catalog with structured specs (grade, MOQ, HS code, packaging), CMS-driven, per-locale
- Per-product RFQ form (product, quantity, destination, incoterm) + general contact form
- WhatsApp click-to-chat as a persistent CTA
- Certifications page with logos (PDFs can trail as content, not structure, arrives)
- Manufacturing/facility page (photos at minimum, video later)
- Export markets list/simple map + basic credibility stats
- Company/About page + downloadable company profile PDF
- Full 4-locale architecture live at launch (EN/AR-RTL/FR/RU), even with placeholder-quality non-English content pending professional translation
- Technical SEO foundation (metadata, sitemap, hreflang, Core Web Vitals baseline)
- Analytics + lead-source tracking

**Should have (differentiators, P2):**
- Downloadable certificate PDFs per certification (once real certs are gathered)
- SEO-targeted insights/blog for buyer-intent search topics (not consumer recipe content)
- Deeper lead/CRM analytics (per-product inquiry volume, WhatsApp click tracking)
- Case studies / buyer success stories

**Defer (v2+):**
- Interactive/animated export world map (start static; upgrade only if traffic data justifies it)
- Facility process video (production-cost-heavy; photos + diagram cover most of the value)
- Buyer login/self-service portal, deeper CRM automation, additional locales — all explicitly deferred pending validated demand

**Explicit anti-features (do not build):** e-commerce cart/checkout/pricing, buyer accounts, AI chatbot for product Q&A, interactive 3D globe, machine-translation pipeline, marketplace-style bidding/reviews, gated trust content (specs/certs behind a form), and any "generic content-type builder" abstraction for a small non-technical editorial team.

### Architecture Approach

Static-first rendering (SSG + on-demand ISR triggered by CMS publish webhooks) sits in front of a headless CMS that is the sole source of truth for all editable content; the site itself holds no lead database (forms are a stateless relay to email + CRM, minimizing PII surface). Locale-scoped routing (`[locale]` segment) drives `dir="rtl"/"ltr"` at the document root, and hreflang is generated per-page from actual published-translation status — never a hardcoded 4-locale list — so a lagging Arabic translation never emits a broken alternate link.

**Major components:**
1. Locale router/layout (`next-intl` + `[locale]` segment) — URL-based locale, RTL/LTR switching, hreflang emission
2. CMS query layer (`cms/queries/`) — isolates CMS SDK from pages; one function per content type, so a future CMS swap touches one folder
3. Catalog pages (fixed template, structured fields) vs. marketing/page-builder blocks (About, Certifications, Export Track Record) — two content-authoring mental models, deliberately kept separate so catalog pages retain real structured data for JSON-LD
4. Form processing (Route Handler, server-only) — validation, rate-limit, honeypot/Turnstile, fan-out to email + CRM webhook
5. SEO infrastructure (sitemap, hreflang, JSON-LD, robots) — shared utilities built early, audited fully once all page types exist

**Suggested build order** (from ARCHITECTURE.md, informs roadmap phase sequencing): locale/RTL foundation and design system, then CMS schema + Studio with placeholder content, then content fetch layer + core static pages (About, Certifications, Export Track Record) proving the block pattern, then product catalog (most structurally complex piece), then RFQ/inquiry forms + spam/email, then WhatsApp, then blog/insights, then SEO hardening pass, then analytics wiring, then performance/RTL QA hardening pass before launch.

### Critical Pitfalls

1. **RTL treated as a CSS flip, not an architecture** — use logical CSS properties (`inline-start`/`inline-end`) and `dir` set server-side at the `<html>` root from the first component built, before any Arabic content exists; validate with a native Arabic reader on one full page early, not just automated screenshot diffing.
2. **hreflang/canonical misconfiguration silently breaks international SEO** — generate hreflang programmatically from CMS locale/translation-status data (never hand-maintained), reconcile with canonical, and audit with Screaming Frog/Search Console before launch and after any URL/CMS structural change.
3. **CMS content model treats locale as a page copy, not a dimension** — this is the single hardest thing to retrofit once real content and editor habits exist; must be resolved in the CMS/content-model design phase (directly tied to the Open CMS Decision above), with explicit fallback logic and a translation-status field per entity per locale.
4. **Building against unrealistic placeholder content** — realistic-shaped placeholders (long Arabic strings, real-resolution photos, actual cert-PDF shapes) stress-tested against templates, plus a mandatory "first real content batch" validation checkpoint before full catalog population.
5. **RFQ/contact forms get spam-flooded, killing sales trust in the channel** — layered honeypot + timing check + Turnstile + server-side validation, and SPF/DKIM/DMARC configured on the sending domain before launch (Gmail/Yahoo bulk-sender rules make this non-optional, not cosmetic).

Two additional pitfalls worth roadmap visibility: over-building toward e-commerce patterns on what looks like a product catalog (recurring discipline, not a one-time decision — flag any cart/price/stock-shaped feature request as scope creep), and trust surfaces (certifications, testimonials, export claims) that read as generic/unverifiable — every claim needs a verification path (real PDF, real logo with permission, real number), and placeholder trust content must never silently reach production given the legal/reputational risk of unverified claims or unauthorized logo use.

## Implications for Roadmap

Based on combined research, suggested phase structure:

### Phase 1: Foundation — Locale Architecture, RTL, Design System
**Rationale:** Every other phase depends on locale-aware routing and RTL-correct layout existing first; retrofitting this later is the single most expensive mistake in the pitfalls research.
**Delivers:** Next.js scaffold, `[locale]` routing (`next-intl`), `dir="rtl"/"ltr"` switching, logical-CSS-property component base, base design system (fonts incl. Arabic/Cyrillic subsetting strategy).
**Addresses:** Multi-language architecture requirement (FEATURES.md table stakes); premium/international visual bar (PROJECT.md).
**Avoids:** Pitfall 1 (RTL-as-CSS-flip) and lays groundwork against Pitfall 8 (per-locale Core Web Vitals/font issues).

### Phase 2: CMS Selection Spike + Content Model Design
**Rationale:** The Open CMS Decision (Payload field-level vs. document-level localization, plus the Payload RTL-admin-chrome caveat) must be resolved with a real throwaway prototype before schema work is load-bearing — this is explicitly flagged as needing a spike, not a default pick.
**Delivers:** Chosen CMS + confirmed localization pattern; Product/Category/Certification/Page/BlogPost/Settings schema (with explicit fallback-locale + translation-status modeling); Studio/admin deployed with realistic-shaped placeholder content.
**Uses:** Payload CMS or Strapi/Sanity (STACK.md/ARCHITECTURE.md alternatives) — final choice depends on spike outcome.
**Avoids:** Pitfall 3 (locale-as-page-copy) — the hardest-to-retrofit pitfall in the research — and Pitfall 4 (unrealistic placeholder content) by using realistic-shaped placeholders from the start.

### Phase 3: Content Fetch Layer + Core Static Trust Pages
**Rationale:** Proves the CMS query layer and page-builder block pattern end-to-end on lower-complexity pages before the structurally harder catalog is built.
**Delivers:** `cms/queries/` layer, Home, About, Certifications, Manufacturing/Facility, Export Track Record, Company Profile pages.
**Addresses:** Table-stakes trust surfaces (certifications, manufacturing, export track record, company/compliance) from FEATURES.md.
**Implements:** Page-builder block architecture component (ARCHITECTURE.md Pattern 2).

### Phase 4: Product Catalog
**Rationale:** Most structurally complex piece (data/translation split, spec tables, structured data for SEO) — sequenced after the block pattern is proven, per ARCHITECTURE.md's explicit build-order recommendation.
**Delivers:** Category listing to subcategory to product detail pages with ISR + on-demand revalidation webhook.
**Addresses:** Product catalog + product detail table-stakes features.
**Avoids:** Pitfall 5 (over-building e-commerce patterns) — reinforce "Request Quote," never "Add to Cart," at every component decision.

### Phase 5: RFQ/Inquiry Forms + Spam Defense + Email/CRM Fan-out
**Rationale:** Depends on the catalog existing (per-product RFQ pre-fill) and Settings singleton (CRM webhook URL); this is the core conversion event of the whole site.
**Delivers:** RFQ + general inquiry forms (react-hook-form + Zod + Server Actions), honeypot + Turnstile, rate limiting, SPF/DKIM/DMARC-configured transactional email (Resend), CRM webhook fan-out.
**Addresses:** Per-product RFQ + general inquiry (P1 features).
**Avoids:** Pitfall 6 (spam-flooded, distrusted lead channel) — ship spam defense and email auth together with the first working form, not after.

### Phase 6: WhatsApp CTA + Analytics/Conversion Tracking
**Rationale:** Trivial once product/category context exists for prefilled messages; analytics wiring depends on forms (Phase 5) existing so inquiry submission can be tracked as a conversion event.
**Delivers:** `wa.me` click-to-chat CTA (header/footer + floating), analytics events for both RFQ submission and WhatsApp click, GA4/GTM (+ consent banner) or Plausible.
**Avoids:** Pitfall 7 (WhatsApp shipped with no analytics ownership) — instrument identically to the RFQ form, not as an afterthought.

### Phase 7: SEO Infrastructure Hardening + Insights/Blog
**Rationale:** Shared SEO utilities (sitemap, hreflang, JSON-LD) should be built early but the full completeness audit happens once all page types exist; blog is lower priority (authority/SEO play, not core conversion path) and itself depends on the technical SEO foundation being in place first.
**Delivers:** Per-locale sitemap + index, structured data (Organization, Product, BreadcrumbList, FAQPage), locale-aware hreflang generated from actual translation status, robots.txt, blog list/detail pages with buyer-intent SEO content.
**Avoids:** Pitfall 2 (hreflang/canonical misconfiguration) — audit with Screaming Frog/Search Console before launch, not just a visual `<head>` check.

### Phase 8: Performance + Cross-Locale RTL QA Hardening (Pre-Launch)
**Rationale:** Final hardening pass — real media (facility photos, certificate PDFs) and real translated content behave differently than placeholders; per-locale validation must happen once real assets exist, not just once against English.
**Delivers:** Image/font optimization audit (subsetted fonts per script), Core Web Vitals validated per locale, native-Arabic-reader RTL review across every page type, first-real-content-batch validation checkpoint, legal/compliance review of trust claims (cert PDFs, testimonials, logo permissions).
**Avoids:** Pitfall 8 (media/font choices blowing CWV per locale), Pitfall 9 (generic/unverifiable trust content reaching production), and closes out the "looks done but isn't" checklist from PITFALLS.md.

### Phase Ordering Rationale

- Locale/RTL architecture must precede everything else — it is the most expensive pitfall to retrofit (PITFALLS.md Pitfall 1) and every other phase's UI depends on it.
- CMS + content-model decisions come immediately after, before any content-heavy phase, because Pitfall 3 (locale-as-page-copy) is the single hardest thing to fix once real content and editor habits exist — this is also where the Open CMS Decision and the Payload RTL-admin-chrome spike must be resolved.
- Trust-surface static pages are sequenced before the catalog because they are architecturally simpler (page-builder blocks vs. structured catalog + translation-split data), letting the team validate the CMS-to-page pattern on lower-risk content first (ARCHITECTURE.md's explicit build order).
- Forms depend on the catalog (for RFQ pre-fill) and WhatsApp depends on forms/catalog context existing — both lead-capture surfaces should ship together with spam/email-auth infrastructure, per Pitfall 6.
- SEO hardening and performance/RTL QA are placed near the end deliberately as full-system audits, but their *shared utilities* (SEO helper components, font-subsetting strategy) must be built early in Phase 1/7 — don't wait until the end to write the first line of hreflang code.

### Research Flags

Needs research/spike during planning:
- **Phase 2 (CMS Selection):** The Payload field-level vs. document-level localization tradeoff and the Payload Arabic RTL admin-chrome limitation are both open, unresolved questions per the Reconcile note above — this phase needs a dedicated research/spike sub-step before schema commitment, not a default pick.
- **Phase 5 (Forms/CRM):** CRM vendor is explicitly TBD (HubSpot/Zoho/Pipedrive) in ARCHITECTURE.md — needs research once a vendor is chosen by the business.
- **Phase 6 (WhatsApp):** WhatsApp Business Platform pricing/API details are flagged MEDIUM confidence (single-sourced on the July 2025 per-message pricing change) — re-verify against Meta's current developer docs only if/when the roadmap later considers the full Cloud API (not needed for launch-scope `wa.me` link).

Phases with standard, well-documented patterns (skip deep research-phase):
- **Phase 1 (Locale/RTL foundation):** next-intl + Tailwind v4 logical properties is HIGH-confidence, officially documented pattern.
- **Phase 4 (Catalog):** Static-first + ISR is a standard, well-documented Next.js pattern (HIGH confidence).
- **Phase 7 (SEO infrastructure):** Next.js sitemap/metadata APIs and hreflang best practices are well-documented (HIGH/MEDIUM-HIGH confidence, cross-corroborated).

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH (framework/i18n/forms/hosting); MEDIUM (CMS RTL admin polish, WhatsApp integration depth) | Core framework choices verified against official docs and npm registry; CMS RTL-admin caveat verified via open GitHub issues (HIGH) but Storyblok/Sanity RTL admin support is an acknowledged gap (MEDIUM) |
| Features | MEDIUM | Verified against one real client benchmark (piyushfarms.com, live-fetched) and cross-referenced India agro-exporter certification/RTL/B2B patterns; large agro-major claims (Olam, ITC, Cargill) are LOW confidence/directional only |
| Architecture | HIGH (rendering/i18n/SEO patterns); MEDIUM (CRM/WhatsApp specifics, CMS vendor choice) | Next.js/next-intl rendering patterns are HIGH confidence official-docs-backed; CRM vendor and final CMS choice remain open (see Open CMS Decision) |
| Pitfalls | MEDIUM-HIGH | Mix of verified official/technical sources (Payload docs, WCAG, Search Engine Journal) and cross-corroborated community sources; a few statistics (WhatsApp API pricing, specific hreflang-error percentages) are single-sourced and flagged LOW/directional |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **CMS + localization pattern is genuinely unresolved** (see Open CMS Decision) — STACK.md recommends Payload with field-level localization; ARCHITECTURE.md recommends Sanity/Strapi-style document-level localization. Resolve via an early Phase 2 spike prototyping one real content type both ways before committing the full schema — do not let the roadmap silently default to one without a decision checkpoint.
- **Payload Arabic RTL admin-chrome limitation** is a known, currently-open issue (not yet fixed upstream as of the research date) — verify with a throwaway Arabic collection early in Phase 1/2 regardless of which CMS is chosen, since Strapi shares the same caveat and Storyblok/Sanity's RTL admin support is unconfirmed.
- **CRM vendor is TBD** (HubSpot/Zoho/Pipedrive) — the form-processing architecture is designed to keep this behind one internal function (`sendToCrm(lead)`) so the choice can be deferred without blocking Phase 5, but it should be settled with the business before or during that phase.
- **Real content is "almost nothing yet"** per PROJECT.md — certifications, facility photos, export data, and translations don't exist at build time. The roadmap must build against realistic-shaped placeholders (per Pitfall 4) and include an explicit "first real content batch" validation checkpoint before full launch, not assume templates will just work once real assets arrive.
- **WhatsApp Business Platform pricing (per-message, July 2025)** is single-sourced/MEDIUM confidence — irrelevant to launch scope (`wa.me` link only) but should be re-verified against Meta's current docs if a later phase considers the full Cloud API.

## Sources

### Primary (HIGH confidence)
- next-intl official docs (next-intl.dev) — App Router routing/RSC translation pattern
- Payload CMS official docs (payloadcms.com/docs/configuration/localization) — localization/fallback-locale behavior
- Payload CMS GitHub issues #9482, #11162, #10344 — RTL admin-panel limitations (open issues, primary source)
- Strapi 5 official docs (docs.strapi.io/cms/features/internationalization) — i18n core in v5, RTL admin limitation stated directly
- Tailwind CSS v4 official blog (tailwindcss.com/blog/tailwindcss-v4) — logical properties, CSS-first config
- Next.js internationalization docs (nextjs.org/docs) — routing/metadata patterns
- WCAG / WebAIM — `lang` attribute and multilingual accessibility requirements
- Direct fetch/analysis of piyushfarms.com (client benchmark) and staragrevolution.com (client's parked domain), 2026-07-14
- .planning/PROJECT.md — internal project context, Active/Out-of-Scope requirements

### Secondary (MEDIUM confidence)
- Storyblok/Sanity official docs — localization capability; RTL admin support unconfirmed
- Search Engine Journal — common hreflang mistakes
- Multiple India agro-exporter certification/RTL/B2B-trust-signal sources (cross-referenced across several sites/blogs)
- WebSearch aggregates on Vercel vs. self-hosted hosting, GA4/Plausible/PostHog comparisons, WhatsApp Business Platform pricing changes

### Tertiary (LOW confidence)
- Large agro-major (Olam, ITC, Cargill) corporate site feature claims — directional only, no detailed feature inventory surfaced
- Specific single-sourced statistics (WhatsApp API July 2025 pricing figures, hreflang-error percentage claims) — treat as directional, not verified fact

---
*Research completed: 2026-07-14*
*Ready for roadmap: yes*
