---
status: complete
phase: 07-hero-and-homepage-narrative-elevated-hero-plus-new-cms-trust
source: [07-01-SUMMARY.md, 07-02-SUMMARY.md, 07-03-SUMMARY.md]
started: 2026-07-24T11:11:36Z
updated: 2026-07-24T15:10:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Hero headline reads as premium, not just resized
expected: On the homepage, the hero headline is large, thin-weight, tightly tracked — reads as an intentional premium display treatment, not just "bigger text." Overlay is atmospheric (image reads through), not a heavy dark scrim.
result: pass
reported: "Confirmed via full-page screenshot of https://star-agrevolution.vercel.app/en — headline large/thin/tracked, overlay atmospheric."

### 2. New homepage blocks render coherently (TrustBar, Export Process, Testimonials)
expected: Scrolling the homepage, the new TrustBar (region chips), Export Process (5-step timeline), and Testimonials (3-card grid) sections render with no broken layout, no missing content, no visual regression against the rest of the page's existing premium look.
result: pass
reported: "All new blocks render clean in the full-page screenshot. Two pre-existing (non-Phase-7) issues noted and explicitly deferred: CertStrip logos mostly show placeholder tiles, ExportMap SVG renders unrecognizable as a map — neither touched by this phase."

### 3. Full homepage narrative flow reads as one coherent story
expected: The 11-block homepage (Hero → TrustBar → Why Choose Us → Manufacturing Excellence → stats → certifications → stats → Export Process → Global Presence → Testimonials → CTA) reads as a coherent trust narrative, not a disjointed stack of sections. Section rhythm/spacing feels consistent throughout (no visually cramped or oversized gaps).
result: pass
reported: "Confirmed via full-page screenshot — flow reads coherently top to bottom. User separately flagged header (5 items) vs footer (9 items) nav mismatch as a question — confirmed as an intentional, pre-existing (pre-Phase-6) design decision documented in REDESIGN-PLAN.md, not a Phase 7 defect; user said move on."

### 4. Hero display-xl typography tokens applied (auto-verified)
expected: Homepage full-variant Hero headline uses text-display-xl font-display font-light tracking-display (56px/300/-0.025em); compact variant (interior pages) stays byte-identical to before
result: pass
source: automated
coverage_id: D-01

### 5. Hero atmospheric overlay + rhythm applied (auto-verified)
expected: Overlay softened to from-primary-900/75 via-primary-900/25; xl:py-4xl rhythm and gap-xl applied to full variant; RTL lint green
result: pass
source: automated
coverage_id: D-02

### 6. Hero test hooks preserved (auto-verified)
expected: data-testid="hero" and data-testid="sample-count" preserved verbatim; no globals.css edit; tsc clean; Arabic e2e sample-count assertion passes
result: pass
source: automated
coverage_id: D-04

### 7. 3 new Payload blocks exist with correct field shapes (auto-verified)
expected: TrustBar, ExportProcess, Testimonials block configs exist with exact field shapes from UI-SPEC; payload-types.ts regenerated with all 3 block union members
result: pass
source: automated
coverage_id: D-03

### 8. TrustBar is standalone, not a CertStrip extension (auto-verified)
expected: TrustBar.ts and TrustBarBlock.tsx have zero imports from CertStrip/Certifications collection
result: pass
source: automated
coverage_id: D-03

### 9. New blocks registered end-to-end and render without crashing (auto-verified)
expected: All 3 renderers registered in RenderBlocks.tsx BLOCK_MAP; render seeded and empty states without crashing (11 integration test cases)
result: pass
source: automated
coverage_id: D-05

### 10. Export Process badges use literal digit strings, not locale-formatted numbers (auto-verified)
expected: ExportProcess step badges render literal "01"-"05" via padStart, never Intl.NumberFormat — cannot leak Arabic-Indic digits on ar locale
result: pass
source: automated
coverage_id: D-05

### 11. New blocks are RTL-safe and token-compliant (auto-verified)
expected: Logical properties only in all new blocks/renderers; lint:rtl green; no color/typography/globals.css token change
result: pass
source: automated
coverage_id: D-04

### 12. Postgres migration is additive-only (auto-verified)
expected: Committed migration adds 6 new block tables via CREATE TABLE/ADD CONSTRAINT/CREATE INDEX only — no DROP/ALTER of pre-existing tables (confirmed: unrelated site_settings drift was manually stripped by executor)
result: pass
source: automated
coverage_id: D-05

### 13. Homepage composed in exact 11-block order (auto-verified)
expected: home Pages document composes Hero → TrustBar → FeatureGrid → MediaGallery → StatsBand → CertStrip → StatsBand → ExportProcess → ExportMap → Testimonials → CTABand; existing e2e monotonic-order assertion passes
result: pass
source: automated
coverage_id: D-03

### 14. Seed content avoids fabricated clients (auto-verified)
expected: TrustBar seeded with 5 logo-less region descriptors (no invented company names); Testimonials seeded with role+buyer-category+country (no fabricated named clients), flagged in-code as placeholder
result: pass
source: automated
coverage_id: D-05

### 15. Manufacturing Excellence reuses existing blocks with verbatim copy (auto-verified)
expected: Homepage MediaGallery+StatsBand "Manufacturing Excellence" teaser reuses /manufacturing page's verbatim copy — no new block, no schema change; gallery items carry real placeholder image IDs after seed
result: pass
source: automated
coverage_id: D-03

### 16. Facility photo injection generalized (auto-verified)
expected: injectFacilityPhotos() attaches placeholder images to homepage's new MediaGallery items (keyed by caption), reusing upsertMediaByAlt as-is
result: pass
source: automated
coverage_id: D-05

### 17. Existing test suites unaffected (auto-verified)
expected: homepage.spec.ts, rtl-arabic.spec.ts, fallback-notice.spec.ts all pass; lint:rtl green; vitest 76/76 pass; no en.json/color/body-tier/globals.css change
result: pass
source: automated
coverage_id: D-04

### 18. Full production build succeeds (auto-verified)
expected: npm run build succeeds, all 69 static paths generated; full e2e suite (70 tests) passes on the fully-merged Phase 7 codebase
result: pass
source: automated
coverage_id: D-05

## Summary

total: 18
passed: 18
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
