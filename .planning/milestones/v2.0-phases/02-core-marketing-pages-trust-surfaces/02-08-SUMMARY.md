---
phase: 02-core-marketing-pages-trust-surfaces
plan: 08
subsystem: chrome-navigation
tags: [navigation, chrome, i18n, e2e, rtl, integration]

# Dependency graph
requires:
  - phase: 02-core-marketing-pages-trust-surfaces
    plan: 02
    provides: Pages collection + [locale]/[slug] routing + 7 seeded page slugs (home/about/certifications/manufacturing/export/company/contact)
  - phase: 02-core-marketing-pages-trust-surfaces
    plan: 06
    provides: ExportMap block (homepage compact variant) — the previously-missing block that lets the homepage full-order assertion close
  - phase: 01-foundation-cms-decision
    provides: chrome components (GlobalHeader/GlobalFooter/MobileNavPanel/LanguageSwitcher), next-intl Link (@/i18n/navigation), nav i18n namespace
provides:
  - Global chrome nav wired to the real D-08 route set (no href="#" stubs)
  - nav-links + chrome-consistency e2e coverage (en+ar)
  - homepage full 6-block-order assertion (Hero->FeatureGrid->CertStrip->StatsBand->ExportMap->CTABand)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Chrome nav item source: NAV_KEYS list + NAV_HREFS map, iterated into next-intl <Link> (locale-prefix + RTL handled by the Link + dir, no per-item logic)"
    - "Desktop one-line nav gates at the xl breakpoint (1280px); hamburger below xl — the 7-item D-08 nav does not fit a 1024px header alongside the wordmark/switcher/CTA"

key-files:
  created:
    - tests/e2e/nav-links.spec.ts
    - tests/e2e/chrome-consistency.spec.ts
  modified:
    - src/components/chrome/GlobalHeader.tsx
    - src/components/chrome/GlobalFooter.tsx
    - src/components/chrome/MobileNavPanel.tsx
    - src/i18n/messages/en.json
    - src/i18n/messages/ar.json
    - src/i18n/messages/fr.json
    - src/i18n/messages/ru.json
    - tests/e2e/homepage.spec.ts

decisions:
  - "products excluded from the primary nav entirely (not a disabled entry) — catalog is Phase 3; omitting is cleaner than a visibly-dead entry and satisfies D-08 + T-02-18 (no dead route)"
  - "New nav labels (home/about/export/company) added to ar/fr/ru as English placeholders — chrome strings pending professional human translation (MT out of scope per project constraints); existing real ar/fr/ru labels left untouched"
  - "Desktop nav breakpoint moved lg->xl (+ hamburger xl:hidden) so the 7-item nav fits; keeps the UI-SPEC one-line desktop nav, just at 1280px"

requirements-completed: [PAGE-04]

# Metrics
duration: ~40min
completed: 2026-07-15
---

# Phase 2 Plan 08: Global Chrome Nav Wiring Summary

**Retired the Phase-1 `href="#"` nav placeholders across GlobalHeader/GlobalFooter/MobileNavPanel and wired the global chrome to the real D-08 route set via next-intl `<Link>`, added nav-links + chrome-consistency e2e coverage (en+ar), and closed the homepage full 6-block-order assertion now that ExportMap exists — the site is one navigable whole.**

## Performance

- **Duration:** ~40 min
- **Tasks:** 2
- **Files:** 10 (2 created, 8 modified)

## Accomplishments

- Replaced every `href="#"` stub in `GlobalHeader.tsx`, `GlobalFooter.tsx`, and `MobileNavPanel.tsx` with a locale-aware next-intl `<Link>`; a shared `NAV_KEYS` list + `NAV_HREFS` map drives all three components off the full D-08 set (home, about, certifications, manufacturing, export, company, contact). `products` is omitted from the primary nav (Phase 3 catalog — no dead route).
- Extended the `nav` i18n namespace with `home`/`about`/`export`/`company` in all 4 catalogs (en real; ar/fr/ru English placeholders pending professional translation).
- `tests/e2e/nav-links.spec.ts` (en+ar): iterates every header (`nav[aria-label="Primary"]`) and footer (`nav[aria-label="Footer"]`) link, asserts each href is a real internal route (no `#`, locale-prefixed on `/ar`), then navigates each and asserts a 200 status + rendered hero (never a 404).
- `tests/e2e/chrome-consistency.spec.ts` (en+ar): visits all 7 routes and asserts the header wordmark, footer + its wordmark, and the language switcher render on each; sampled `<html dir>` check on `/ar/contact` (rtl) and `/contact` (ltr).
- `tests/e2e/homepage.spec.ts`: tightened the earlier ExportMap-tolerant partial check into the full 6-block order assertion Hero → FeatureGrid → CertStrip → StatsBand → ExportMap → CTABand (bounding-box y-ordering), en+ar.

## Task Commits

1. **Task 1: wire global chrome nav to real D-08 routes** — `876a635` (feat)
2. **Task 2: nav-links + chrome-consistency e2e, tighten homepage full-block order** — `7482727` (test)

_Plan metadata commit follows this summary._

## Verification

- `npx tsc --noEmit` — exit 0
- `npm run lint:rtl` (`node scripts/check-physical-direction.mjs`) — pass ("no physical-direction classes under src/")
- `npm run build` — exit 0 (all 7 pages × 4 locales prerendered, 31 static params)
- `npx playwright test` — **192 passed, 0 failed** (en+ar), including the 3 target specs and every pre-existing Phase-1/Phase-2 spec
- `grep 'href="#"' src/components/chrome/` — clean

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Desktop nav overflowed the header at lg (1024px) after growing from 4 to 7 items**
- **Found during:** Task 2, running `tests/e2e/responsive-rtl.spec.ts` (the `lg (ltr) — header/footer/hero render without overflow` case failed: `scrollWidth > clientWidth`).
- **Issue:** Task 1 grew the primary nav from 4 to 7 items. At the `lg` breakpoint (1024px) the 7-item one-line nav no longer fit alongside the wordmark, language switcher, and CTA button, causing horizontal overflow. It fit fine at `xl` (1280px), which is why that case passed.
- **Fix:** Moved the desktop nav reveal from `lg:flex` to `xl:flex` in `GlobalHeader.tsx` and the mobile hamburger from `lg:hidden` to `xl:hidden` in `MobileNavPanel.tsx`. Between 1024–1279px the hamburger now shows; the one-line desktop nav appears at 1280px+. Preserves the UI-SPEC "one-line desktop nav" intent, just at the `xl` breakpoint.
- **Files affected:** src/components/chrome/GlobalHeader.tsx, src/components/chrome/MobileNavPanel.tsx
- **Verification:** `responsive-rtl.spec.ts` all breakpoints (sm/md/lg/xl, ltr+rtl) pass; full suite 192/192.
- **Committed in:** `7482727` (Task 2 commit — surfaced by Task 2's e2e)

**2. [Rule 3 - Blocking] Fresh worktree had no node_modules, `.env`, or seeded SQLite DB**
- **Found during:** start of execution, before any verification could run.
- **Issue:** This worktree had no `node_modules`, `.env`, or `payload.db`; the `.planning` PLAN/CONTEXT/UI-SPEC docs were also absent (only prior SUMMARYs were present, as they are the only tracked planning files on the branch base).
- **Fix:** Symlinked `node_modules -> D:\PW\node_modules` (reuse main checkout per instructions — no reinstall), created a local gitignored `.env` (`DATABASE_URI=file:./payload.db` + a generated `PAYLOAD_SECRET`, no `BLOB_READ_WRITE_TOKEN` locally), ran `npm run db:seed`, and copied the plan's `02-08-PLAN.md` / `02-CONTEXT.md` / `02-UI-SPEC.md` into the worktree `.planning` dir from the main checkout for reference.
- **Files affected:** none committed (all gitignored / local-environment-only).
- **Verification:** `npm run build` exit 0; `npx playwright test` 192/192.

**Note:** The `contact.spec.ts` `[ar]` empty-submit cases showed as failing in the first full-suite run alongside the header-overflow failure, then passed cleanly on re-run after the overflow fix and in the final full suite — flaky under the overflowing-layout condition, not a code defect in this plan's scope.

---

**Total deviations:** 2 auto-fixed (1 Rule 1 — responsive overflow regression from the nav-item growth, 1 Rule 3 — environment bootstrap). No architectural changes; no scope creep.

## Known Stubs

- **`products` nav entry intentionally absent** — the product catalog is Phase 3 (CAT). Per D-08 + threat T-02-18, `products` is omitted from the primary nav rather than wired to a not-yet-built or dead route. The `products` i18n label is retained in all 4 catalogs for Phase 3 reuse. This is the documented deferral, not a gap in this plan's goal.
- **ar/fr/ru nav labels for home/about/export/company are English placeholders** — chrome strings awaiting professional human translation (post-launch, per project constraints; MT is out of scope). English is the source of truth.

## Self-Check: PASSED

- `tests/e2e/nav-links.spec.ts` — FOUND on disk
- `tests/e2e/chrome-consistency.spec.ts` — FOUND on disk
- Commit `876a635` — FOUND in git log
- Commit `7482727` — FOUND in git log
- `grep 'href="#"' src/components/chrome/` — CLEAN (no matches)

---
*Phase: 02-core-marketing-pages-trust-surfaces*
*Completed: 2026-07-15*
