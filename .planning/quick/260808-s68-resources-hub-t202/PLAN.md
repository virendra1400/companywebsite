---
quick_id: 260808-s68
slug: resources-hub-t202
date: 2026-08-08
status: complete
---

T-202 Resources Hub, per the existing P-09/C-16 spec. Deliberately built directly (not via /gsd-plan-phase) — T-202 lives in playbook/TASK_BACKLOG.md's separate tracking system, not .planning/ROADMAP.md's 10 already-completed numbered phases; spec was already unambiguous, no research/discussion ceremony needed.

## Task

1. `SiteSettings.resourceDocuments` — new localized array field (title/description/file) + hand-written migration, for site-level docs (company profile, sample COA, export checklist).
2. `getResourceDocuments(locale)` — aggregates SiteSettings.resourceDocuments + Certifications.certificatePdf + Products.downloads, no data duplication.
3. `ResourceDocumentList` client component — icon/title/type+size/ungated-download row, fires new `spec_download` analytics event.
4. `/resources` page — hero, 2 sections (company/cert docs, product specs), honest "available on request" per-row, CTA band.
5. Added to footer nav + `nav.resources`/`resources.*` i18n keys across all 4 locales.
6. Fixed a second stale "Plausible decision still deferred" comment in `src/lib/analytics.ts` (same root cause as D-49).
7. Logged as DECISION_LOG D-53, flipped T-202 to `DONE (infra), BLOCKED(owner) — content`.

## Acceptance

- `npx tsc --noEmit` clean, `lint`/`lint:rtl` zero new issues.
- Unit suite 92/97 pass (5 pre-existing failures unchanged from D-51).
- e2e: homepage/nav-links/company fully clean; 3 pre-existing dev-server flakes recurring (already confirmed unrelated); `/resources` itself verified directly via curl (200, correct content) before confirming its own flaky first-nav Playwright hit was the same class, not a bug.
