# VNP Global — Premium Redesign Plan

**Prepared:** 2026-07-23 · Grounded in: full brief, current codebase audit, DESIGN.md refs (Stripe/Linear/Vercel/Apple), 2 slices already shipped.

---

## 1. Reality check (what the brief assumes vs. what exists)

The brief reads like a greenfield redesign. It is not. This is a **mature, near-shipped** Star Agrevolution → **VNP Global** site: Next.js 16 + Payload 3 + next-intl (4 locales incl. Arabic RTL), 5 of 6 GSD phases done (marketing pages, catalog, RFQ/WhatsApp/analytics, SEO+blog). The existing UI is **genuinely good** — disciplined design tokens, RTL-safe logical properties, CMS-driven blocks, accessible focus/aria.

So this is **elevation, not rescue**. The job is to push an already-solid B2B site to a Stripe/Linear-tier premium bar without destabilizing a launch-ready v1.

**Colors:** the brief's palette (emerald `#123524`, gold `#C8A24A`) ≈ the live tokens (`primary-900 #0F2E22`, `accent-600 #C9A227`). **No color overhaul needed** — keep the current ramp. This removes a whole category of risk the brief implies.

---

## 2. Already shipped (Phase 0 — done, live on prod)

- ✅ **Brand rename** Star Agrevolution → VNP Global (render paths + tests). Live.
- ✅ **Nav simplified 9 → 5** (Products · About · Global Markets · Certifications · Contact + "Request a Quote"). Footer keeps full set. Live at star-agrevolution.vercel.app.

---

## 3. The one gating decision: the type scale

The Phase-1 UI-SPEC **locks** typography to *exactly 4 sizes / 2 weights* (display=40px max, weights 400/600). That constraint is what caps the current hero's visual drama. Every DESIGN.md ref gets its premium feel from a **larger, thinner display tier with negative tracking** (Stripe: 56px/300/-1.4px).

**Cannot do a premium hero without amending that contract.** This is the pivotal early call:

- **Option A (recommended):** expand the scale — add `display-lg` (~52–56px) and `display-xl` (~40px) tiers, introduce a thin/light weight for display only, add negative letter-spacing on display. Keep body tiers as-is. It's a *controlled* amendment, not a free-for-all.
- **Option B:** keep 4 sizes/2 weights locked → hero stays modest, redesign is limited to spacing/imagery/motion. Lower ceiling.

**Font:** brief prefers Geist/Inter/Manrope; site uses **IBM Plex Sans** — chosen because it has a matched **Plex Sans Arabic** for RTL. Recommendation: **keep Plex for Arabic integrity**, optionally add Geist/Inter for **Latin display headings only** (locale-scoped, no RTL regression). Switching the whole stack risks the Arabic script quality — not worth it.

---

## 4. Phased plan (value × risk ordered; each phase ships to prod)

### Phase A — Design-system elevation *(foundation; medium risk)*
- Amend UI-SPEC type scale (see §3): display-xl/lg tiers, display light weight, negative tracking tokens in `globals.css @theme`.
- Rhythm: bump section padding toward 64–96px; tighten card radius/hairline system; replace heavier shadows with subtle elevation + atmospheric depth.
- Tabular figures (`font-feature-settings: tnum`) for numeric/stat cells.
- Deliverable: updated `01-UI-SPEC.md` amendment + `globals.css` tokens. Verify RTL + lint:rtl still green.

### Phase B — Hero + homepage narrative *(highest visible impact)*
- Elevate `HeroBlock`: large thin display headline, negative tracking, refined eyebrow/subhead/CTA rhythm, better image treatment + atmospheric gradient (not heavy overlay).
- Map brief's 12-section homepage flow to blocks. **Exist:** Hero, StatsBand, FeatureGrid, CertStrip, ExportMap, CTABand. **Gaps to add as CMS blocks:** Trust-indicator/partner-logo row, "Why Choose Us", Manufacturing Excellence, Export Process (timeline), Testimonials.
- Deliverable: elevated hero + 2–4 new blocks, all CMS-editable, seeded with realistic placeholders.

### Phase C — Component polish pass *(low risk)*
- ProductCard, StatsBand (tnum), CertCard, buttons, forms, CTA bands, FAQ → apply the amended system consistently. Remove any residual inconsistencies.

### Phase D — Motion & micro-interactions *(low risk, perf-guarded)*
- Tasteful reveal/stagger/hover/section transitions. `prefers-reduced-motion` respected; RTL-safe; no CLS/LCP regression.

### Phase E — Hardening *(merges with the already-planned GSD Phase 6)*
- SEO deltas (OG/Twitter/JSON-LD largely done in Phase 5 — verify against new sections), a11y audit (contrast/keyboard/focus), Lighthouse/CWV, image optimization, full cross-locale RTL QA.

---

## 5. Cross-cutting constraints (non-negotiable)

- **RTL:** every change uses logical properties (`ms/me/ps/pe`, `rtl:`); `npm run lint:rtl` must stay green. No physical-direction utilities.
- **CMS-driven:** new sections are Payload blocks (non-devs edit content), not hardcoded copy.
- **i18n / English-first:** build + verify in English now; translation keys added but pro-translation deferred (per existing project decision).
- **Deploy:** prod = Vercel + Postgres. Ship each phase via `npx vercel --prod` (authed) or merge-to-main. Preview builds need `PAYLOAD_SECRET`/`DATABASE_URL` added to Vercel **Preview** scope (dashboard action) to work.
- **Content gap:** real photography/certs/testimonials don't exist yet (stubs). Biggest *non-code* dependency — needs client assets to hit full premium bar.
- **GSD:** all edits route through GSD (quick for slices, or formalize as a milestone/ui-phase).

---

## 6. Brief's 12 deliverables — produced at completion

Executive Summary · Design Decisions · Skills Used · DESIGN.md Refs Used · Components Redesigned · UX Improvements · Performance · Accessibility · SEO · Code Quality · Breaking Changes · Future Recommendations.

---

## 7. Recommended execution vehicle

Formalize as a **new GSD milestone: "v2 — Premium Redesign"** with Phases A–E, OR run Phase A–B now via `/gsd-ui-phase` (design contract) and the rest as slices. Keeps atomic commits + verification while preserving the shippable v1.

**Housekeeping:** the `.planning/references/design-md/*` DESIGN.md files (~2300 lines) are reference-only — recommend gitignoring rather than committing.
