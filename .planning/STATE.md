---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: Premium Redesign
current_phase: 07
current_phase_name: Hero and Homepage Narrative — elevated hero plus new CMS trust/manufacturing/process/testimonial blocks
status: planning
stopped_at: Phase 07 UI-SPEC approved
last_updated: "2026-07-24T02:33:21.169Z"
last_activity: 2026-07-24
last_activity_desc: Phase 06 complete, transitioned to Phase 07
progress:
  total_phases: 5
  completed_phases: 1
  total_plans: 2
  completed_plans: 2
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-07-14)

**Core value:** A first-time international buyer who has never heard of the company leaves the site trusting it enough to send a serious inquiry/RFQ.
**Current focus:** Phase 06 — design-system-elevation-premium-type-scale-display-tokens-rh

## Current Position

Phase: 07 — Hero and Homepage Narrative — elevated hero plus new CMS trust/manufacturing/process/testimonial blocks
Plan: Not started
Status: Ready to plan
Last activity: 2026-07-24 — Phase 06 complete, transitioned to Phase 07

## Performance Metrics

**Velocity:**

- Total plans completed: 12
- Average duration: - min
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 04 | 5 | - | - |
| 05 | 5 | - | - |
| 06 | 2 | - | - |

**Recent Trend:**

- Last 5 plans: -
- Trend: -

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 06 P01 | 20min | 3 tasks | 3 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: CMS + localization pattern (Payload field-level vs. Sanity/Strapi document-level) is an OPEN decision — resolve via spike inside Phase 1, before schema commitment.
- Roadmap: Payload Arabic RTL admin-chrome limitation (if Payload chosen) must be verified as cosmetic-only in Phase 1, not assumed away.
- Roadmap: hreflang, form spam/email-auth, and per-locale Core Web Vitals are built into their implementation phases (1, 4, 6), not deferred to launch-day polish.
- [Phase ?]: Copied .env/payload.db from main checkout into worktree (gitignored, dev-only) to run build/test verification end-to-end

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 1: CMS vendor/localization pattern is unresolved until the spike runs — Phase 2+ content-model work depends on this being settled first.
- Phase 4: CRM vendor is TBD (HubSpot/Zoho/Pipedrive) — form/webhook architecture keeps this behind one internal function so the choice doesn't block the phase, but should be settled with the business before or during Phase 4.
- All phases: real content (certs, photos, translations) doesn't exist yet — build against realistic-shaped placeholders; Phase 6 includes a first-real-content-batch validation checkpoint.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260723-duo | Rebrand company name Star Agrevolution → VNP Global (code defaults, metadata, seed copy, tests) | 2026-07-23 | 5d2b566 | [260723-duo-rebrand-company-name-star-agrevolution-t](./quick/260723-duo-rebrand-company-name-star-agrevolution-t/) |
| 260723-e35 | Simplify primary navigation 9 → 5 per brief (Products, About, Global Markets, Certifications, Contact) | 2026-07-23 | 94245f2 | [260723-e35-simplify-primary-navigation-from-9-items](./quick/260723-e35-simplify-primary-navigation-from-9-items/) |

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-07-24T02:33:21.155Z
Stopped at: Phase 07 UI-SPEC approved
Resume file: .planning/phases/07-hero-and-homepage-narrative-elevated-hero-plus-new-cms-trust/07-UI-SPEC.md
