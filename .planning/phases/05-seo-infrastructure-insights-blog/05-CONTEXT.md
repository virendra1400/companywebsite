# Phase 5: SEO Infrastructure & Insights/Blog - Context

**Gathered:** 2026-07-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Every page emits correct per-locale metadata, hreflang, and structured data; an XML sitemap covers all locales/published pages; a new Insights/blog section (list + article template) exists, CMS-editable per locale. Builds on Phase 1 (locale/translation-status data), Phase 2/3 (pages/products to describe and mark up).

</domain>

<decisions>
## Implementation Decisions

### Blog/Insights content model (new Payload collection — none exists yet)
- **D-01:** Simple fixed fields, not freeform blocks: `title`, `slug` (not localized), `excerpt`, cover image (`upload`), `category` (single relationship), `author` (plain text), `body` (richText). Modeled after `Products.ts` ("typed structured data"), not `Pages.ts` ("freeform layout") — articles are editorial content, not landing pages.
- **D-02:** Single `category` relationship field for grouping/filtering (same pattern as `Products.category`). No tag/multi-taxonomy in v1.
- **D-03:** Author is a plain text field only (e.g. "Export Team") — no author collection/photo. Minor E-E-A-T SEO signal at minimal CMS cost.
- **D-04:** Collection fields are `localized: true` (title/excerpt/body/author), following the exact Pages/Products pattern — `slug` stays unlocalized (one canonical URL, same as Pages/Products). Content itself stays English-only for now (per project-wide English-first priority) — architecture supports translation later with zero rework, using the same `isTranslated` existence-check pattern already in `src/lib/payload-fetch.ts`.

### Blog URL/nav placement
- **D-05:** New top-level nav item in `GlobalHeader` labeled "Insights", real route `/insights` (matches D-08's "fixed set of real routes" pattern and PROJECT.md's own wording "Insights/blog surface").
- **D-06:** Flat article URLs: `/insights/[slug]` — matches the existing `/products/[slug]` pattern. Category is used for on-page filtering/grouping only, not in the URL (avoids canonical churn if an article's category changes).

### hreflang scope for untranslated locales
- **D-07:** hreflang generation reuses the existing `isTranslated` detection (`src/lib/payload-fetch.ts` — fallback-ON display query + fallback-OFF existence check) per page/product/article. A locale only gets an emitted hreflang tag when it has REAL translated content — today that means only `en` (+ `x-default`) for virtually everything, since ar/fr/ru have no real translations yet. This directly satisfies SEO-02's requirement that hreflang be "generated from actual published-translation status (not hand-maintained)."
- **D-08:** `x-default` points to the English root URL (`/[slug]`, no locale prefix) — matches `next-intl` routing's existing `defaultLocale: "en"` with no path prefix.

### Structured data scope & Organization data gaps
- **D-09:** Add `address` (group: street/city/state/postalCode/country) and `sameAs` (array of social/profile URLs) fields to the `SiteSettings` global, alongside the existing `siteName`/`logo`/`contact` fields — same admin pattern as the existing `contact` group. This unlocks a complete Organization JSON-LD (name/logo/url/address/contactPoint/sameAs).
- **D-10:** Product structured data uses only fields that already exist on `Products`: `name`, `image` (from `imageGallery`), `description`, `category`, and `certifications` mapped as `additionalProperty`. Explicitly NO price/offers/availability (B2B RFQ site, not e-commerce — no listed prices) and NO review/rating markup (no reviews data model exists; out of scope for SEO-04).
- **D-11:** `BreadcrumbList` structured data is emitted on Product detail pages and blog article pages only (both have a natural parent: catalog category / insights list). Flat top-level marketing/trust pages (About, Certifications, etc. — one click from home) do not get breadcrumbs; low SEO value there.

### Claude's Discretion
- Exact sitemap generation mechanism (Next.js native `sitemap.ts` per STACK.md, locked) and whether to split into a sitemap index vs single file — implementation detail for planner/researcher.
- Exact JSON-LD script injection mechanism (per-page `generateMetadata` + a shared `<script type="application/ld+json">` helper) — implementation detail.
- Open Graph image strategy (dedicated OG image field vs. deriving from existing cover/hero images) — not discussed, left to researcher/planner to resolve against existing Media assets.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & success criteria (verbatim source)
- `.planning/REQUIREMENTS.md` — SEO-01…05, BLOG-01…02 requirement text
- `.planning/ROADMAP.md` §Phase 5 — goal, success criteria (hreflang/sitemap/structured-data/blog acceptance criteria, verbatim)

### Stack-locked decisions (do not re-litigate)
- `.planning/STACK.md` — native `sitemap.ts`/`robots.ts`/`generateMetadata` for hreflang/JSON-LD (locked); Tailwind v4 `max-w-[…]` bracket-value gotcha applies to any new blog list/article UI

### Existing translation-status detection (core mechanism for D-07)
- `src/lib/payload-fetch.ts` — `isTranslated` pattern: fallback-ON display query + fallback-OFF existence check, already implemented for Pages/Products/Categories/Certifications. New blog collection and hreflang generator MUST reuse this exact pattern, not invent a new one.

### Contact/brand single source of truth (extend for D-09)
- `src/globals/SiteSettings.ts` — existing `siteName`/`logo`/`contact` fields; add `address`/`sameAs` here, not a new global.

No other external specs/ADRs — requirements fully captured in ROADMAP.md + REQUIREMENTS.md + decisions above.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/payload-fetch.ts` `isTranslated` check — direct reuse for hreflang locale-gating (D-07) and for the new Insights collection's translation status.
- `src/collections/Products.ts` — structural template for the new Insights/Articles collection (typed fields, `localized: true` cascading, `revalidate` hook pattern via `revalidateProduct`-style hook).
- `src/i18n/routing.ts` — `locales: ["en","ar","fr","ru"]`, `defaultLocale: "en"` (no prefix) — feeds both hreflang generation and sitemap locale enumeration.
- `src/globals/SiteSettings.ts` — extend in place for Organization JSON-LD source data (D-09), same field-group pattern as `contact`.

### Established Patterns
- Collections use `access: { read: Boolean(user) }` (admin-gated) currently for Pages/Products — a new public-facing Insights collection will need `read: () => true` (like `SiteSettings`) so articles render for anonymous visitors, unlike the current admin-gated pattern on Pages/Products (which are fetched server-side with elevated access, not directly public API reads).
- `revalidateXxx` afterChange hooks + `export const revalidate = 60` ISR on content routes — new `/insights` routes should follow this.
- Slug fields are never localized (`unique: true, index: true`) — one canonical URL per document regardless of locale, consistent across Pages/Products; Insights collection follows the same rule (D-01/D-06).

### Integration Points
- `GlobalHeader.tsx` nav — fixed list of real routes (`nav` translations + `Link` from `@/i18n/navigation`); adding "Insights" is a one-line addition to this existing nav array plus a new next-intl `nav.insights` message key across locale message files.
- No existing `sitemap.ts`, `robots.ts`, or any `application/ld+json` output anywhere in `src/` — this phase is fully greenfield for SEO infra, not an extension of partial work.

</code_context>

<specifics>
## Specific Ideas

- "Insights" as the nav label (not "Blog") — matches PROJECT.md's own phrasing and reads more B2B-corporate for an international agri-export buyer audience.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 5-SEO Infrastructure & Insights/Blog*
*Context gathered: 2026-07-22*
