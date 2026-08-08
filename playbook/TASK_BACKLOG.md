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

### T-101 Design tokens & global styles — `DONE` · S · Small · P-01
Done: card was never flipped after the work landed — token layer already implemented in `src/app/globals.css`'s `@theme` block (colors §2, type scale, spacing/radius/shadow §4, motion durations §6), comment-tagged "(T-101)" in the source. Folded into earlier styling work rather than run as its own dedicated pass.
Acceptance: per prompt; QA §B sample-page pass.

### T-102 Header/mega-menu/footer — `DONE` (re-scoped) · S · Medium · P-02
Done (2026-08-01): sticky header shrink 72->60px after 80px scroll (IntersectionObserver sentinel, not a raw scroll listener — `HeaderShell.tsx`). Products mega-menu (`ProductsMegaMenu.tsx`) built against real CMS category/product data via `getProductsByCategory` — no hardcoded SKU list, new products/categories show up automatically; keyboard-accessible (Escape closes + returns focus, click-outside closes). Footer legal identity strip (CIN/GST/IEC/FSSAI) added to SiteSettings and rendered only when at least one field is filled in — no placeholder-dash wall for numbers that don't exist yet.
Not done this pass (logged, not silently dropped): (1) mega-menu's two-column-by-processing-method layout — built one column per CMS category instead, which is the more correct data model for an evolving catalog than a hardcoded "IQF/Aseptic/Value-Added" grouping; (2) buyer-type links + catalog-PDF-download inside the mega-menu — no /resources hub or PDF pipeline exists yet (T-202, Phase 2); (3) mobile drawer's product list stays a flat "Products" link, not a nested tree — /products already shows the full categorized catalog on tap, judged lower value than the desktop mega-menu for the time spent; (4) header nav doesn't yet include "Facility & Quality" or "Resources" — neither page exists yet (T-107, T-202).
Acceptance: shrink verified programmatically (`data-shrunk` 72px->60px on scroll); mega-menu verified visually + real category data; full e2e regression + isolated nav-links/homepage/rtl/language-switcher runs — all pre-existing pass rate, zero new failures. See DECISION_LOG D-29.
Follow-up fix (2026-08-01, commit `8ae4021`): initial ship's shrink sentinel was broken in production only — `data-shrunk` stuck permanently `true` regardless of scroll (sentinel pinned at document y:0 with a `-80px` rootMargin never intersected the shrunk observation box, so it reported "not intersecting" from first render). Local pre-ship testing happened to show correct behavior, masking the bug. Fixed by repositioning the sentinel itself to `top-[80px]` in normal flow and dropping the rootMargin — the standard scroll-past-N-pixels sentinel pattern. Re-verified via Playwright on both local and production (`vnpglobal.in`) post-deploy.

### T-103 CMS content model — `DONE (schema only, additive)` · O · Medium
Objective: implement MASTER_PLAN §7.3 Payload collections (products with structured specs, certifications, facilityFacts, resources, globals incl. contactChannels/legalIdentity/sla) + migrate existing content.
Done (2026-08-01): all §7.3 fields shipped on Products (specs by category, packagingOptions, containerLoading, shelfLife/storageTemp/moqRange, faq, downloads, seo, gallery role) and Certifications (status/number/validFrom/validTo/scope/targetDate), added ADDITIVELY alongside the existing flat fields (real prod content depends on those — see D-30). New FacilityFacts + Resources collections. SiteSettings `sla.responseTime` added (contactChannels/legalIdentity/addresses already existed pre-T-103). Migration `20260801_145559_t103_cms_content_model`, commit `d6cb334`.
Not done this pass: product-page rendering still reads only the old flat fields — every new field is empty on all real products (T-110 hasn't entered data yet), so there's nothing to render. Recategorizing existing flat spec rows into the new typed buckets is an editor/T-110 task, not automated here. Old `specifications`/`packaging` fields NOT removed — still the only populated source for the live catalog.
Acceptance (re-scoped): schema live in prod, editors can enter structured data immediately. "All 8 products render from structured fields" carries forward to T-105 (product template) once T-110 populates real data — see DECISION_LOG D-30.

### T-104 Homepage rebuild — `DONE (Lighthouse gap open)` · O · Large · P-03
Done (2026-08-01): rebuilt to CONTENT_PLAYBOOK §4's full 9-section order (was 7 blocks, missing Product categories + Markets entirely, stale copy on Proof strip + De-risk tiles). Fixed a real production bug found along the way: 29.3s LCP from unoptimized 2-2.3MB hero/logo PNGs (next.config.ts's blanket `images.unoptimized: true`), now 4.8s. See DECISION_LOG D-31/D-32.
Not done: Lighthouse mobile performance is 51/100 on production, short of the ≥90 gate. Root cause is diffuse (3.8s main-thread JS/hydration work + a first-visit-only locale-cookie redirect), not a single fixable bug — flagged as a dedicated follow-up (bundle-size/hydration audit), not silently treated as passing. Accessibility 96/best-practices 100/SEO 100.
Acceptance: QA §A–§F content/structure — met. Lighthouse ≥90 — NOT met (51/100), open follow-up.

### T-105 Product template + 8 pages + URL migration — `DONE (re-scoped)` · O · Large · P-04
Done (2026-08-02): all 8 real products now live at `/products/{category}/{product}` (nested, matches §5.2); old flat URLs 308-redirect via live category lookup, including correct locale-prefixing under /ar. Product detail template now consumes T-103's structured schema (specs by category, packaging options, container loading, shelf life/storage/MOQ, applications, downloads, FAQ+FAQPage JSON-LD), with graceful fallback to the old flat specifications/packaging fields — every real product's spec data still lives there until T-110 migrates it, so nothing regressed. See DECISION_LOG D-34.
Not done (deliberately re-scoped, not silently dropped): §5.2's other renames (`/manufacturing`→`/facility`, `/company`→`/about`, `/export`→`/markets/gulf-middle-east`) belong to T-107/T-108/a not-yet-built Markets page — moving the URL before the destination content exists is premature, picked up when those tasks build the real pages. §5.2's `/ar /fr /ru`→redirect-to-`/` line NOT implemented — stale instruction from the playbook's superseded English-only assumption (D-08/D-18), already overridden by D-22; the real 4-locale site is a CLAUDE.md hard requirement.
Acceptance: old URLs redirect (not literally 301 — Next's `permanentRedirect()` emits 308, same semantic, search engines treat identically) — met. QA §A–§G — content/structure verified (populated + empty-fallback states, RTL, full e2e regression zero-regression); full formal QA checklist pass not separately run.

### T-106 Certifications page — `DONE` · S · Medium · P-05
Done (2026-08-02): status board populated with the 7 real in-progress certs from PROJECT_MEMORY §3 (APEDA/FSSAI/IEC/GST/ISO 22000/HALAL/KOSHER), all "In Certification", no numbers. `Certifications.logo` made optional (was blocking — no rights to display cert-body logos pre-certification); CertCard shows a text-only status pill instead. Page also gained audit-openness statement, per-shipment documentation list, and a sample-COA document card (honest "available on request" state, no file yet). See DECISION_LOG D-35.
Acceptance: met — structurally guarded, not just editorially: a cert can only ever show "Registered" when status="registered" AND a real number exists.

### T-107 Facility & Quality page — `DONE (re-scoped)` · S · Medium · P-06
Done (2026-08-02): D-14 exact IQF wording added to /manufacturing (never claims in-house IQF line), plus traceability (lot-code chain) and audit-openness paragraphs. Fixed stale seed-content.ts manufacturing copy ("our own processing floor") that predated D-27's honest-partnership rewrite. See DECISION_LOG D-36.
Not done: MASTER_PLAN §5.2's `/manufacturing`→`/facility` rename — deliberately deferred (touches nav/sitemap/redirects site-wide, separable from content). Pick up alongside T-108 or as its own IA pass.
Acceptance: D-14 wording verified (present, "in-house IQF" overclaim absent) — met.

### T-108 About page — `DONE (re-scoped)` · S · Medium · P-08
Done (2026-08-02): three-entity relationship explained on /about verbatim per CONTENT_PLAYBOOK §4 (VNP = export company; Kavita = manufacturer; Piyush Farms = sister brand). "What We Promise Buyers" de-risk section added (reused from T-104's homepage tiles). Fixed intro copy implying VNP itself processes product (D-27: it doesn't). Also found+fixed a real bug while starting this: /company had a false "operates under a valid IEC registration" claim under the pre-rebrand company name — see D-37. See DECISION_LOG D-38.
Not done: /company → /about consolidation + redirect — this line item isn't in CONTENT_PLAYBOOK §4's actual spec (which keeps About = story/promises and Company & Compliance = leadership/registration details as two distinct pages, cross-linked); treating the more detailed CONTENT_PLAYBOOK as authoritative over this terse backlog line, same as prior re-scope calls. Founder block — despite "tokens OK", omitted rather than added as a `{{FOUNDER_NAME}}` placeholder: the (1) "why VNP exists" section is specified as FIRST-PERSON prose, and a bracketed token in first-person voice reads as broken, not as an honest placeholder (unlike a spec-sheet token like `{{PLANT_CAPACITY_MT_YEAR}}`); the (3) name/photo card would also duplicate /company's existing "Managing Director" leadership tile. Revisit once T-110 supplies a real name/story.
Acceptance: entity explanation present — met. Founder block — deliberately omitted, not fabricated (see reasoning above).

### T-109 RFQ form & conversion flow — `DONE` · O · Medium · P-07
Done (2026-08-02): added the 3 fields C-18's LOCKED schema had that the existing form didn't — buyer_type (select), products (multi-select, real 8-SKU catalog, new Checkbox primitive), timeline (select). Everything else kept as-is (extended, not rewritten): same schema/action/rate-limiting. CAPTCHA→honeypot decision: kept Turnstile (CLAUDE.md's explicit stack choice overrides C-18's "no CAPTCHA friction" text) — logged per the note's own instruction. Subject line now `[RFQ] {products} — {company}, {country}` per PROMPT_LIBRARY. See DECISION_LOG D-39.
Acceptance: QA §G end-to-end — form validation/RFQ-mode/error-states covered by 26-test e2e regression; real email receipt test not run (no live RESEND_API_KEY in this session's environment — code path already existed pre-T-109 and is unchanged).

### T-110 Owner input collection — `BLOCKED(owner)` · —
Collect: DECISION_LOG §Open Placeholders (capacity, cold storage, packaging specs, MOQs, shelf life, ports, payment terms, founder bio+photo, CIN, cert numbers/dates as issued, ISO standard). Deliver as filled table → unblocks de-placeholdering across pages.

## Phase 2 — Depth & Polish

### T-201 Markets pages — `DONE (export only)` · S · Medium · P-08 (markets scope) — acceptance per prompt
Done (2026-08-02): /export rebuilt to CONTENT_PLAYBOOK §4's Gulf-first structure (was a broad 16-country map + fabricated-feeling stat tile — same over-claiming pattern D-31 already fixed on the homepage). See DECISION_LOG D-41.
Not done: MASTER_PLAN §5.2's `/export` → dedicated `/markets/gulf` + `/markets/sea` page split + redirect — this pass fixed the honesty issue on the EXISTING single page rather than also doing the URL restructure, same "content now, URL rename separately" split used for T-107/T-108. SEA section is thin (Singapore-only highlight, no dedicated deep content) pending real SEA business specifics.
### T-202 Resources hub + PDF pipeline — `TODO` · S · Medium · P-09 — acceptance per prompt
### T-203 Product FAQs + FAQPage schema — `TODO` · S · Medium — 5–8 Qs/product per CONTENT_PLAYBOOK §4; answers from verified facts/tokens only; Rich Results valid
### T-204 Technical SEO pass — `DONE` · S · Medium · P-10 — incl. robots `/api/media` unblock (allow media path while keeping API disallowed), image filename/alt audit
Done (2026-08-02): robots.txt fix shipped — real bug, `Disallow: /api` was blocking Google Image Search from every site image (product photos, hero, logos). New regression test. Alt text audited: zero missing site-wide, no action needed. JSON-LD audited: valid on home/product/certifications/about. Filenames messy but not fixed (would need re-upload, alt text already covers the stronger signal). See DECISION_LOG D-42.
### T-205 Accessibility audit — `DONE` · S · Medium · P-11
Done (2026-08-02): real automated audit (@axe-core/playwright, WCAG 2.0/2.1 A+AA) across all page types + both locales. Zero violations — nothing to fix, reflects a11y discipline already built in all session. Locked in as a permanent regression test (a11y-audit.spec.ts). See DECISION_LOG D-43.
### T-206 Performance pass — `IN PROGRESS` · S · Medium · P-12
Started (2026-08-02): found + fixed the react-hook-form-on-every-page bug (dynamic-import in RenderBlocks.tsx), but it didn't move the needle — root cause is Next 16 + Turbopack shipping one unified shared script bundle to every route (confirmed empirically), not app-level code-splitting. See DECISION_LOG D-40. Open: decide whether forcing webpack as the production bundler is worth the trade-off, or wait for Turbopack to mature. Lighthouse still ~51/100 production.
### T-207 Animation & polish — `DONE` · S · Small · P-13
Done (2026-08-02): entry-animation duration was 2x the DESIGN_SYSTEM §6 ceiling (600ms/500ms vs 200-300ms spec) — fixed to 300ms on both Reveal.tsx and RevealItem.tsx. Hover micro-transitions, no-carousel rule, and reduced-motion fallbacks all already spec-compliant, checked not just assumed. See DECISION_LOG D-44.
### T-208 Copy editorial pass — `DONE` · O · Medium · P-14
Done (2026-08-02): grep-verify pass against CONTENT_PLAYBOOK §1's banned-word/pattern list. Found and fixed 2 systemic issues: hero headline used banned "Premium" bare adjective; every CTA band heading site-wide (10 instances) used the banned rhetorical-question pattern. Banned words + exclamation marks: already clean, verified not assumed. See DECISION_LOG D-45.
### T-209 Live bug-report fixes (logo, WhatsApp button, mega-menu, export map) — `DONE` · O · Small
Done (2026-08-03): owner-reported against production. Logo looked small no matter the CSS box height — root cause was ~70% empty transparent padding baked into the uploaded canvas, fixed by cropping the source asset to its real content bounding box (+ added the spec's 150ms hover micro-transition). Header WhatsApp button was 44px next to a 32px sibling button — dropped a size override so it matches the standard 36px icon-button size. Mega-menu: clicking a product made the menu disappear before the click landed — the panel was offset from its trigger with a CSS margin (an unrendered gap), so a mouse path through it left the hover root and unmounted the panel mid-transit; fixed by using padding instead of margin. Found while investigating: `/export`'s world map was unlabeled floating gray blocks reading as an unfinished skeleton — added canvas background, strokes, and ISO-code labels, and fixed a highlighted-country label contrast bug (fails WCAG AA on primary-500 green) plus a stale color hex that had drifted from the design token. See DECISION_LOG D-46. Deployed and live.
### T-209 follow-up: real world map — `DONE (committed, not deployed)` · O · Medium
Done (2026-08-03), pending deploy: owner's reaction to the D-46 legibility fix was "I thought it would be an actual beautiful world map" — replaced the rectangle-tile placeholder with real country geometry (server-rendered via d3-geo/topojson-client, no map library shipped to the client). Fixed two real rendering bugs along the way (regional-zoom centering, sub-pixel-invisible small countries). Owner then confirmed Vietnam/Indonesia/Maldives as currently-served markets (not "capacity to extend") and asked to combine the Gulf + Southeast Asia maps into one "Our Primary Focus" map — homepage's map brought into sync with the same set so the two pages stop making different claims. Full regression clean. See DECISION_LOG D-47. Committed locally, awaiting final go-ahead to deploy.

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
