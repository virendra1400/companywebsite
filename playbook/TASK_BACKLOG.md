# TASK_BACKLOG — VNP Global

Task cards for execution sessions. Workflow: pick card → run its PROMPT_LIBRARY prompt with P-00 preamble → verify acceptance criteria → run QA sections → log decisions. Statuses: `TODO / IN-PROGRESS / DONE / BLOCKED(owner)`.

Legend: Model S=Sonnet, O=Opus · Context S/M/L.

## Phase 0 — Hotfixes (all Critical, current codebase, no redesign)

### T-001 Remove fabricated claims — `DONE` · S · Small · P-19
Objective: eliminate false trust claims from live site.
Actual finding: codebase had moved on from this card's original assumptions (see DECISION_LOG Session Additions) — "16+" markets stat and the old meta wording were already gone. The live violation was HeroBlock.tsx rendering "Trusted by {count}+ international buyers" (hardcoded to 60) on every homepage load in all 4 locales, kept alive specifically to satisfy an e2e assertion.
Done: removed the badge + underlying `sample.count` translation key from en/ar/fr/ru; retargeted the RTL Western-digit e2e test to InsightCard's published-date field instead of deleting RTL-digit coverage. Commit 1c703b4.
Acceptance: `grep -rn "Trusted by|sample-count|60+" src tests` = zero hits (comments only); `npx tsc --noEmit` clean; `tests/e2e/rtl-arabic.spec.ts` 14/14 pass.

### T-002 Fix dead WhatsApp links — `DONE` (pre-existing) · S · Small · P-19
Objective: every WhatsApp link reaches the real number.
Actual finding: already fixed by prior work. `src/lib/payload-fetch.ts`'s `getSiteBrand()` is the single source (reads `SiteSettings.contact.whatsapp`); every CTA component (HeroBlock, ContactBlockView, WhatsAppTrackedLink, floating WhatsApp button) consumes it — no hardcoded `910000000000` left in any component, only as the CMS field's dev-safety default. No code change made.
Caveat: could not verify the real number is populated in the production CMS from this session (local dev DB has no site_settings row saved) — owner should confirm the live value in `/admin` → Site Settings → Contact.

### T-003 SEO domain identity fix — `DONE` · S/O · Medium · P-19
Objective: vnpglobal.in is the canonical identity; staging invisible.
Actual finding: mechanism was already correct — `robots.ts`, `sitemap.ts`, `[locale]/layout.tsx`, `alternates.ts` all build every URL from `process.env.NEXT_PUBLIC_SITE_URL`, zero hardcoded staging references anywhere in `src/`. Two real gaps: (1) `.env.example`'s guidance comment still named the retired `staragrevolution.com` domain plan instead of the current `vnpglobal.in` decision (D-17) — fixed, commit b919d1b. (2) The actual Vercel production env var was never set — verified live (robots.txt still pointed at the staging alias a full day after being marked DONE-on-mechanism).
Done (2026-08-01): set `NEXT_PUBLIC_SITE_URL=https://vnpglobal.in` in Vercel production env, redeployed. Also added a middleware 301 redirect for the two known persistent staging aliases → vnpglobal.in (no CLI access to Vercel's dashboard deployment-protection toggle, so this guarantees no indexable duplicate content independent of dashboard settings). Commit b760b6b, see DECISION_LOG D-26.
Acceptance: `curl https://vnpglobal.in/robots.txt` sitemap line reads vnpglobal.in; `curl -I https://star-agrevolution.vercel.app` returns 301 → vnpglobal.in. Both verified live.

### T-004 Lock down /admin — `DONE` (adequate pre-launch) · S · Small
Objective: reduce attack surface of Payload admin on production.
Actual finding: `Users.ts` uses Payload's default auth (`maxLoginAttempts: 5`, `lockTime: 600000` — Payload's built-in default, no override needed) plus API-key auth; the entire site (including /admin) currently sits behind Vercel SSO Deployment Protection pre-launch, which is stronger than IP-allowlisting alone. That already satisfies "blocked or challenge-gated." No code change made.
Follow-up (not a Phase-0 blocker): once SSO comes off at public launch, /admin loses that outer gate and needs its own IP-allowlist or basic-auth middleware — flagged for the T-306 pre-launch gate, logged in DECISION_LOG Session Additions.

### T-005 De-list fake locales — `DONE` · S · Small · P-19
Objective: no English-content /ar /fr /ru pages served without disclosure, and none of them submitted for indexing where untranslated.
Actual finding: this codebase has real i18n architecture (not a stub) — `getTranslatedLocales()` already gates every CMS-driven interior page (about, certifications, manufacturing, export, company, contact) out of the sitemap/switcher for locales with no real translation, and `LocaleFallbackNotice` discloses English-fallback content everywhere it's shown. The language switcher is fully functional, not empty (original D-08 premise no longer applies to this build). Two gaps found across two sessions: (1) the two code-only listing routes (`/products`, `/insights`) had no per-locale translation possible and were rendering English content for ar/fr/ru with zero disclosure, unlike every other page type — fixed first (commit 2602a72). (2) Verified live a day later: those same two routes were STILL unconditionally listing all 4 locales in the sitemap despite having zero real translation — disclosure isn't the same as not indexing duplicate content.
Done (2026-08-01): sitemap now lists only the English entry for `/products` and `/insights`; the routes still render normally (with disclosure) for direct/linked visits in other locales, just aren't submitted for indexing. Commit b760b6b, see DECISION_LOG D-26.
Acceptance: `curl /ar/products` and `curl /ar/insights` both contain `data-testid="fallback-notice"`; switcher confirmed functional; `curl https://vnpglobal.in/sitemap.xml | grep -c "/ar/\|/fr/\|/ru/"` = 0.

### T-006 Correct mismatched product images — `DONE` (re-scoped) · S · Small
Objective: every product card/page shows a category-appropriate image.
Actual finding: the product catalog itself no longer matched PROJECT_MEMORY's 8-SKU list (frozen veg/pulp/value-added) — the CMS was seeded with a different placeholder catalog (rice/spices/lentils/sesame, 6 SKUs). Rebuilding the real catalog was Phase 1 scope (T-103/T-105), not a Phase-0 surgical fix, and PROJECT_MEMORY's own spec data was still all placeholder tokens. **Flagged as a new open item at the time — since resolved, see DECISION_LOG D-27**: a session replaced the placeholder catalog with the real 8 SKUs (SKU list/naming only — T-103's structured spec-table schema is still not built).
What WAS fixable now: `pickProductFallback()`'s image-matching bug — it hash-picked across all 7 stock photos regardless of category, so e.g. Red Lentils could resolve to `crop-field-corn.jpg`. Fixed to key the fallback pool by category slug (grains/spices/pulses/oilseeds); dropped corn/apple/watermelon from the product pool entirely since none match any live category. Commit 58f12a2.
Acceptance: `curl /products` shows only category-plausible stock images (verified: grain-rice-macro present, crop-field-corn/produce-apple absent).

### T-007 Dead-ends — `DONE` (pre-existing) · S · Small
Actual finding: already fixed. Footer links `/insights` (2 published articles exist, not empty); "Global Markets" nav resolves to a real `/export` route, no literal `/global-markets` path referenced anywhere. No code change made.

### T-008 Soften unverifiable claims — `DONE` · S · Small · P-14 (scoped)
Scope found live: `/company` page stated IEC/APEDA registration as settled fact ("VNP Global operates under a valid... registration") and claimed "leadership with decades of trade experience" — neither confirmed per PROJECT_MEMORY (both registrations are Open Placeholders; no founder tenure documented anywhere).
Done: reworded registration claim to in-progress framing; dropped the unverified experience claim from the hero subhead. Commit ce26034. Left "responds within one business day" phrasing untouched — already phrased as a team commitment, not a numeric/registration claim, and out of scope for this pass per the original card's own framing.
Acceptance: `grep -n "valid Importer-Exporter\|decades of trade experience" src` = zero hits.

## Phase 1 — Trust Core

### T-101 Design tokens & global styles — `TODO` · S · Small · P-01
Acceptance: per prompt; QA §B sample-page pass.

### T-102 Header/mega-menu/footer — `DONE` (re-scoped) · S · Medium · P-02
Done (2026-08-01): sticky header shrink 72->60px after 80px scroll (IntersectionObserver sentinel, not a raw scroll listener — `HeaderShell.tsx`). Products mega-menu (`ProductsMegaMenu.tsx`) built against real CMS category/product data via `getProductsByCategory` — no hardcoded SKU list, new products/categories show up automatically; keyboard-accessible (Escape closes + returns focus, click-outside closes). Footer legal identity strip (CIN/GST/IEC/FSSAI) added to SiteSettings and rendered only when at least one field is filled in — no placeholder-dash wall for numbers that don't exist yet.
Not done this pass (logged, not silently dropped): (1) mega-menu's two-column-by-processing-method layout — built one column per CMS category instead, which is the more correct data model for an evolving catalog than a hardcoded "IQF/Aseptic/Value-Added" grouping; (2) buyer-type links + catalog-PDF-download inside the mega-menu — no /resources hub or PDF pipeline exists yet (T-202, Phase 2); (3) mobile drawer's product list stays a flat "Products" link, not a nested tree — /products already shows the full categorized catalog on tap, judged lower value than the desktop mega-menu for the time spent; (4) header nav doesn't yet include "Facility & Quality" or "Resources" — neither page exists yet (T-107, T-202).
Acceptance: shrink verified programmatically (`data-shrunk` 72px->60px on scroll); mega-menu verified visually + real category data; full e2e regression + isolated nav-links/homepage/rtl/language-switcher runs — all pre-existing pass rate, zero new failures. See DECISION_LOG D-29.
Follow-up fix (2026-08-01, commit `8ae4021`): initial ship's shrink sentinel was broken in production only — `data-shrunk` stuck permanently `true` regardless of scroll (sentinel pinned at document y:0 with a `-80px` rootMargin never intersected the shrunk observation box, so it reported "not intersecting" from first render). Local pre-ship testing happened to show correct behavior, masking the bug. Fixed by repositioning the sentinel itself to `top-[80px]` in normal flow and dropping the rootMargin — the standard scroll-past-N-pixels sentinel pattern. Re-verified via Playwright on both local and production (`vnpglobal.in`) post-deploy.

### T-103 CMS content model — `TODO` · O · Medium
Objective: implement MASTER_PLAN §7.3 Payload collections (products with structured specs, certifications, facilityFacts, resources, globals incl. contactChannels/legalIdentity/sla) + migrate existing content.
Acceptance: all 8 products render from structured fields; contactChannels global consumed by CTA bands (regression-proofs T-002); cert entries drive status board.

### T-104 Homepage rebuild — `TODO` · O · Large · P-03
Acceptance: per prompt; QA §A–§F; Lighthouse ≥90.

### T-105 Product template + 8 pages + URL migration — `TODO` · O · Large · P-04
Includes 301 map from MASTER_PLAN §5.2.
Acceptance: per prompt; old URLs 301; QA §A–§G on 2 sample pages.

### T-106 Certifications page — `TODO` · S · Medium · P-05
Acceptance: per prompt; no cert rendered as held without number.

### T-107 Facility & Quality page — `TODO` · S · Medium · P-06
Acceptance: per prompt; D-14 IQF wording verified.

### T-108 About page — `TODO` · S · Medium · P-08
Includes /company → /about consolidation + redirect; three-entity relationship explained (VNP = export company; Kavita = manufacturer; Piyush Farms = sister brand).
Acceptance: QA §A–§D; entity explanation present; founder block (tokens OK).

### T-109 RFQ form & conversion flow — `TODO` · O · Medium · P-07
Note: current form engineering is good — extend rather than rewrite (add buyer_type/products multi-select/timeline per C-18; keep rate-limiting; CAPTCHA→honeypot decision at implementation, log it).
Acceptance: per prompt; QA §G end-to-end incl. email receipt.

### T-110 Owner input collection — `BLOCKED(owner)` · —
Collect: DECISION_LOG §Open Placeholders (capacity, cold storage, packaging specs, MOQs, shelf life, ports, payment terms, founder bio+photo, CIN, cert numbers/dates as issued, ISO standard). Deliver as filled table → unblocks de-placeholdering across pages.

## Phase 2 — Depth & Polish

### T-201 Markets pages — `TODO` · S · Medium · P-08 (markets scope) — acceptance per prompt
### T-202 Resources hub + PDF pipeline — `TODO` · S · Medium · P-09 — acceptance per prompt
### T-203 Product FAQs + FAQPage schema — `TODO` · S · Medium — 5–8 Qs/product per CONTENT_PLAYBOOK §4; answers from verified facts/tokens only; Rich Results valid
### T-204 Technical SEO pass — `TODO` · S · Medium · P-10 — incl. robots `/api/media` unblock (allow media path while keeping API disallowed), image filename/alt audit
### T-205 Accessibility audit — `TODO` · S · Medium · P-11
### T-206 Performance pass — `TODO` · S · Medium · P-12
### T-207 Animation & polish — `TODO` · S · Small · P-13
### T-208 Copy editorial pass — `TODO` · O · Medium · P-14

## Phase 3 — Evidence Upgrade

### T-301 Facility shoot — `BLOCKED(owner)` — shot list MASTER_PLAN §8.2
### T-302 Replace interim imagery — `TODO after T-301` · S · Medium — swap by CMS `source: ai-interim` flag; QA §I image items
### T-303 Publish cert numbers/PDFs — `BLOCKED(owner)` · S · Small per cert — flip status board entries; QA §A cert rule
### T-304 Real COA + doc checklist PDFs — `BLOCKED(owner)` · S · Small
### T-305 Product photography — `BLOCKED(owner)` · S · Small
### T-306 Pre-launch gate — `TODO last` · O · Large · P-16 — QA §I full; produces launch-blocker list; **site not shared with buyers until this passes**

## Phase 4 — Growth

### T-401 Insights first 3 posts — `TODO` · O · Medium — topics SEO_PLAYBOOK §6; unhide section at ≥3 substantive posts
### T-402 Arabic locale — `TODO` · O · Large · P-18 — needs professional translation (owner); QA §H full RTL
### T-403 Real social proof activation — `BLOCKED(real customers)` — first testimonial/case study only with named, consenting customer; log in DECISION_LOG
### T-404 Market/distributor page expansion — `TODO per sales` · S · Medium each
### T-405 Quarterly SEO/CWV review — recurring · S · Small · P-10/P-12 subset
