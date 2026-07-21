---
phase: 04-lead-conversion-rfq-inquiry-whatsapp-analytics
plan: 01
subsystem: ui
tags: [analytics, whatsapp, i18n, vitest, playwright, next-intl]

requires:
  - phase: 01-foundation-cms-decision
    provides: SiteSettings global + getSiteBrand() (waHref)
provides:
  - Provider-agnostic trackEvent() analytics wrapper (dataLayer/plausible/no-op)
  - Shared WhatsAppIcon component (single SVG source)
  - WhatsAppCta client component (fires whatsapp_click on click)
  - Persistent header (desktop) + mobile-nav-sheet WhatsApp CTA
  - Standardized "Chat on WhatsApp" copy across en/ar/fr/ru
  - Vitest `unit` project (tests/unit/**, no SQLite DB)
affects: [04-02, 04-03, 04-04, 04-05]

tech-stack:
  added: []
  patterns:
    - "trackEvent(name, params) — single import site per CTA, typeof window guard, dataLayer-then-plausible-then-noop branch, never throws"
    - "WhatsAppCta client component — one call site owns whatsapp_click firing + non-PII location param, consumed by header/mobile-nav"

key-files:
  created:
    - src/lib/analytics.ts
    - src/components/icons/WhatsAppIcon.tsx
    - src/components/chrome/WhatsAppCta.tsx
    - tests/unit/analytics.spec.ts
    - tests/e2e/whatsapp-header-cta.spec.ts
  modified:
    - vitest.config.ts
    - src/components/blocks/ContactBlockView.tsx
    - src/components/chrome/GlobalHeader.tsx
    - src/components/chrome/MobileNavPanel.tsx
    - src/i18n/messages/en.json
    - src/i18n/messages/ar.json
    - src/i18n/messages/fr.json
    - src/i18n/messages/ru.json
    - tests/e2e/contact.spec.ts

key-decisions:
  - "Locale catalogs keep whatsappLabel/whatsappAria as literal 'Chat on WhatsApp' in all 4 locales (not translated) — matches the existing hardcoded CTA-band secondaryCta labels and the pre-existing contact.spec.ts test design (identical accessible name asserted on both /contact and /ar/contact); real per-locale translation is deferred project-wide, consistent with the phase not touching translation work."
  - "contact.spec.ts's WhatsApp locator scoped to getByRole('main') — the new header CTA now shares the same 'Chat on WhatsApp' accessible name site-wide, so an unscoped locator became ambiguous (strict-mode violation)."

patterns-established:
  - "Analytics event params are always Record<string,string> containing only non-PII values (event name + location/product slug) — enforced at the one WhatsAppCta call site, never at 5 separate hand-wired anchors."

requirements-completed: [LEAD-06, LEAD-07, ANALY-01]

coverage:
  - id: D1
    description: "Provider-agnostic trackEvent() wrapper — no-ops safely with no vendor mounted, pushes to dataLayer or calls plausible when present, exact D-06 event name strings"
    requirement: "ANALY-01"
    verification:
      - kind: unit
        ref: "tests/unit/analytics.spec.ts (4 tests: no-window no-op, dataLayer push, plausible call, non-PII param passthrough)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Shared WhatsAppIcon (single SVG, extracted from ContactBlockView) + WhatsAppCta client component firing whatsapp_click with only a non-PII location param"
    requirement: "LEAD-07"
    verification:
      - kind: e2e
        ref: "tests/e2e/whatsapp-header-cta.spec.ts (desktop + mobile CTA render/href checks, exercises WhatsAppCta)"
        status: pass
      - kind: other
        ref: "npx tsc --noEmit && npx eslint (WhatsAppCta.tsx, WhatsAppIcon.tsx, ContactBlockView.tsx)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Persistent WhatsApp CTA reachable from every page: 44px icon-only button in GlobalHeader (desktop), full-width labelled button in MobileNavPanel sheet (closes sheet on click), href always from getSiteBrand().waHref, standardized 'Chat on WhatsApp' copy site-wide"
    requirement: "LEAD-06"
    verification:
      - kind: e2e
        ref: "tests/e2e/whatsapp-header-cta.spec.ts (2 tests: desktop icon CTA + wa.me href, mobile sheet labelled CTA + sheet close)"
        status: pass
      - kind: e2e
        ref: "tests/e2e/contact.spec.ts (5 tests, en+ar projects: WhatsApp link visible/href, empty-submit validation, RTL layout)"
        status: pass
    human_judgment: false

duration: ~35min (execution) + environment repair (see Deviations)
completed: 2026-07-21
status: complete
---

# Phase 04 Plan 01: WhatsApp CTA + Analytics Wrapper Summary

**Provider-agnostic `trackEvent()` wrapper, a shared `WhatsAppCta` component wired into the header and mobile-nav sheet firing `whatsapp_click`, and a new Vitest `unit` test project — the independent, no-server-dependency slice of Phase 4.**

## Performance

- **Duration:** ~35 min hands-on execution (task work spanned a session interruption; total elapsed includes idle time between the two segments)
- **Completed:** 2026-07-21T02:41:47Z
- **Tasks:** 3/3 completed
- **Files modified:** 9 modified, 5 created

## Accomplishments
- `trackEvent(name, params)` — vendor-agnostic analytics wrapper (`dataLayer` → `plausible` → no-op), never throws, exact `rfq_submit`/`inquiry_submit`/`whatsapp_click` event names
- New Vitest `unit` project (`tests/unit/**`) with no SQLite DB/globalSetup — unblocks later Phase 4 form plans' unit tests
- `WhatsAppIcon` promoted to one shared component (extracted verbatim from `ContactBlockView.tsx`, zero duplication)
- `WhatsAppCta` client component — single call site for `whatsapp_click` firing, passes only a non-PII `location` param
- WhatsApp CTA now reachable from every page: 44px icon-only button in `GlobalHeader` (desktop), full-width labelled button in the mobile nav sheet (closes sheet on click)
- Standardized `"Chat on WhatsApp"` copy site-wide (was `"Message us on WhatsApp"` in `contact.whatsappLabel`/`whatsappAria`, mismatched against 3 existing hardcoded CTA-band call sites)

## Task Commits

Each task was committed atomically (Task 1 followed RED→GREEN TDD):

1. **Task 1: Provider-agnostic analytics wrapper + Vitest unit project**
   - `a009e4d` (test — RED: failing `tests/unit/analytics.spec.ts`, added `unit` vitest project)
   - `e694d30` (feat — GREEN: `src/lib/analytics.ts`)
2. **Task 2: Extract shared WhatsAppIcon + build WhatsAppCta client component** - `d4567e3` (feat)
3. **Task 3: Wire WhatsApp CTA into header + mobile nav, standardize copy, e2e** - `bede4ec` (feat)

_Plan metadata commit intentionally omitted — worktree mode, orchestrator handles shared-file commits after merge._

## Files Created/Modified
- `src/lib/analytics.ts` - `trackEvent()` wrapper + `EventName` union type
- `src/components/icons/WhatsAppIcon.tsx` - shared monochrome WhatsApp glyph (extracted)
- `src/components/chrome/WhatsAppCta.tsx` - client component: `Button asChild` + `<a target=_blank>`, fires `whatsapp_click` on click
- `vitest.config.ts` - added `unit` project (`tests/unit/**`, node env, no DB)
- `tests/unit/analytics.spec.ts` - 4 behaviors covering no-window, dataLayer, plausible, non-PII passthrough
- `src/components/blocks/ContactBlockView.tsx` - imports shared `WhatsAppIcon` instead of local definition
- `src/components/chrome/GlobalHeader.tsx` - icon-only `WhatsAppCta` between `LanguageSwitcher` and "Request a Quote"; passes `waHref` down to `MobileNavPanel`
- `src/components/chrome/MobileNavPanel.tsx` - accepts `waHref` prop, renders labelled `WhatsAppCta` above "Request a Quote", closes sheet on navigate
- `src/i18n/messages/{en,ar,fr,ru}.json` - `contact.whatsappLabel`/`whatsappAria` standardized to `"Chat on WhatsApp"`
- `tests/e2e/whatsapp-header-cta.spec.ts` - desktop icon CTA + mobile sheet CTA e2e coverage
- `tests/e2e/contact.spec.ts` - updated WhatsApp locators to new copy, scoped to `<main>` to avoid colliding with the new header CTA

## Decisions Made
- Kept `whatsappLabel`/`whatsappAria` as literal English `"Chat on WhatsApp"` across all 4 locale catalogs rather than translating — the codebase's existing WhatsApp CTA-band labels (`seed-content.ts`, product pages) are already hardcoded English regardless of locale, and the pre-existing `contact.spec.ts` asserts the identical accessible name on both `/contact` and `/ar/contact`. Real translation work is deferred project-wide (per project convention); this plan's job was de-duplicating the label, not localizing it.
- `contact.spec.ts`'s own-page WhatsApp locator scoped to `getByRole("main")` — necessary once the header CTA (site-wide) started sharing the same accessible name as `ContactBlockView`'s existing link.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Restored missing `@rolldown/binding-linux-x64-gnu` optional dependency**
- **Found during:** Task 1 (first `vitest run`)
- **Issue:** `node_modules` was missing a native binding already pinned in `package-lock.json` (partial/incomplete install in the shared repo root), so every Vitest run failed before any test executed.
- **Fix:** Ran `npm install` (no args — reconciles `node_modules` against the existing lockfile; did not add or change any dependency version).
- **Files modified:** none (node_modules only, gitignored).
- **Verification:** `npx vitest run tests/unit/analytics.spec.ts` then ran to completion.

**2. [Rule 3 - Blocking] Installed Playwright's Chromium browser binary**
- **Found during:** Task 3 (`npx playwright test tests/e2e/whatsapp-header-cta.spec.ts`)
- **Issue:** Playwright's npm package was present but no browser binary was downloaded, so every e2e run failed at browser launch.
- **Fix:** `npx playwright install chromium --with-deps` (official Playwright CLI, not a new npm dependency).
- **Files modified:** none (browser cache only, outside the repo).
- **Verification:** e2e specs launched and ran successfully afterward.

**3. [Rule 3 - Blocking] Seeded the local dev database**
- **Found during:** Task 3 (`contact.spec.ts` failing to find seeded address/content, `/ar/contact` rendering an error page)
- **Issue:** The worktree's SQLite dev DB (`file:./payload.db`) was empty (fresh worktree, no prior `db:seed` run) — Pages/SiteSettings content didn't exist, so the app either 404'd or omitted expected content.
- **Fix:** Ran `npm run db:seed` (existing project script, no new tooling).
- **Files modified:** none (local `payload.db` only, gitignored).
- **Verification:** all 5 `contact.spec.ts` tests + both `whatsapp-header-cta.spec.ts` tests pass on `en` and `ar` Playwright projects (14/14).

**4. [Rule 1 - Bug] Scoped `contact.spec.ts`'s WhatsApp locator to `<main>`**
- **Found during:** Task 3 (running `contact.spec.ts` after standardizing copy)
- **Issue:** The unscoped `getByRole("link", { name: /chat on whatsapp/i })` became ambiguous (Playwright strict-mode violation, 2 matches) once the header CTA started sharing the exact same accessible name as `ContactBlockView`'s pre-existing link — both now say "Chat on WhatsApp" site-wide, which is the intended, correct outcome of this plan.
- **Fix:** Scoped the locator to `page.getByRole("main")` so it targets only `ContactBlockView`'s own link.
- **Files modified:** `tests/e2e/contact.spec.ts`
- **Verification:** all 5 `contact.spec.ts` tests pass on `en` + `ar`.
- **Committed in:** `bede4ec` (Task 3 commit)

---

**Total deviations:** 4 auto-fixed (3 blocking-environment repairs, 1 bug in newly-written test scoping)
**Impact on plan:** All fixes were prerequisites for running the plan's own required verification (`npx vitest run`, `npx playwright test`) — no scope creep into application code beyond what the plan specified.

## Issues Encountered
- A stuck/runaway `next-server` process (from an earlier interrupted background test run) held port 3000 without responding after ~10 minutes of CPU usage; killed and restarted cleanly. No code change involved — environment noise from the session interruption, not a defect introduced by this plan.

## Scope Note (not a stub — pre-existing, out of this plan's task list)
UI-SPEC's "Analytics wiring" note lists 5 WhatsApp CTA call sites that should eventually fire `whatsapp_click` (header, hero secondary CTA, product-detail CTA band, catalog CTA band, `ContactBlockView`). This plan's tasks only wired the **header** and **mobile-nav sheet** through the new `WhatsAppCta` component (per its own `files_modified`/task list) — the hero/CTA-band/`ContactBlockView` WhatsApp anchors are untouched pre-existing links that do not yet call `trackEvent`. No later 04-0x plan in this phase's task list wires them either. Flagging for phase-level follow-up, not blocking this plan's own success criteria (all of which are satisfied).

## User Setup Required
None - no external service configuration required. Analytics vendor (GA4+GTM vs Plausible) remains an open decision per STACK.md; `trackEvent` works correctly with no vendor mounted (no-op).

## Next Phase Readiness
- `trackEvent()` and the Vitest `unit` project are ready for 04-02+ (RFQ/inquiry form plans) to import and extend with `rfq_submit`/`inquiry_submit` firing.
- `WhatsAppCta`/`WhatsAppIcon` are ready to be reused by hero/CTA-band/`ContactBlockView` if a later plan chooses to close the Scope Note gap above.
- No blockers for downstream Phase 4 plans.

---
*Phase: 04-lead-conversion-rfq-inquiry-whatsapp-analytics*
*Completed: 2026-07-21*
