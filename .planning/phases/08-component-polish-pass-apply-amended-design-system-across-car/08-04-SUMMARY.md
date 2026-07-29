---
phase: 08-component-polish-pass-apply-amended-design-system-across-car
plan: 04
subsystem: ui
tags: [verification, playwright, vitest, tailwind-v4, button, accordion, rtl]

# Dependency graph
requires:
  - phase: 08-component-polish-pass-apply-amended-design-system-across-car
    provides: "08-01 card-recipe/tabular-nums convergence, 08-02 Button consolidation (outlineOnDark + shared focus ring/hover), 08-03 FAQ block end-to-end"
provides:
  - "Full automated gate suite (lint, lint:rtl, typecheck, vitest, production build, Playwright e2e) run against the merged Wave 1 tree"
  - "Human live-render sign-off on the 08-UI-SPEC backstop item: outlineOnDark transparent-interior CTAs, gold focus rings at all 8 Contract §4 call sites, hairline card recipe, equal-width digits, and the FAQ accordion in both LTR and RTL"
  - "Phase 8 diff-confinement proof: merged tree touches only the three Wave 1 plans' declared files plus the new migration pair, zero new npm dependencies"
affects: [phase-completion, next-phase-context]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Verification-only plan pattern: no source files change from this plan; gate failures are triaged back to the owning Wave 1 plan's files, never patched locally"

key-files:
  created: []
  modified:
    - .planning/phases/08-component-polish-pass-apply-amended-design-system-across-car/deferred-items.md

key-decisions:
  - "Local dev DB's Contact page predated 08-03's FAQ addition to seed-content.ts; seed-pages.ts's per-slug idempotency meant db:seed alone would not inject it. Patched the local dev DB directly (payload.db, gitignored, no source/committed file touched) via a throwaway script mirroring PAGES_EN_SEED's contact layout, so the Task 2 checkpoint had a real FAQ to verify against."
  - "Playwright browsers were missing from this environment; installed via `npx playwright install chromium` (a browser-binary download for an already-installed devDependency, not a new npm package) rather than treating it as an unrunnable gate."
  - "16 initial e2e failures were root-caused by direct inspection rather than accepted at face value: 1 real pre-existing bug (GlobalFooter.tsx footer-link overflow at 640px), 1 real pre-existing bug (ContactForm.tsx required-asterisk markup breaking exact label match, from a pre-Phase-8 quick task), 1 fragile pre-existing test design (nav-links.spec.ts's 7-navigation-in-30s budget), and 2 confirmed dev-server-contention flakes (passed clean on an isolated low-concurrency rerun). None touch any file in the three Wave 1 plans' declared scope, so none were fixed from this plan — logged to deferred-items.md per the scope-boundary rule."

patterns-established:
  - "Diff-confinement check anchored to the correct phase-start commit (right before the first Wave 1 task commit), not the prior phase's completion commit — intervening quick-task commits would otherwise falsely appear in the phase diff"

requirements-completed: [POLISH-VR]

coverage:
  - id: D1
    description: "Full automated gate suite (lint, lint:rtl, typecheck, vitest, production build) passes on the merged Wave 1 tree, and the phase diff is confined to the three plans' declared files with zero new dependencies"
    requirement: POLISH-VR
    verification:
      - kind: unit
        ref: "npm run lint (5 pre-existing errors reconfirmed unrelated, 0 in Phase 8 files) && npm run lint:rtl (green) && npm run typecheck (exit 0) && npm test (82/82 passing) && npm run build (exit 0, 69 static pages)"
        status: pass
      - kind: other
        ref: "git diff --name-only ca33ce5..HEAD confined to Wave 1's files_modified + migration pair + .planning/; git diff --stat package.json package-lock.json ca33ce5..HEAD empty"
        status: pass
    human_judgment: false
  - id: D2
    description: "Playwright e2e suite run against the merged tree with a seeded FAQ; all failures root-caused and confirmed pre-existing/environmental, none caused by Phase 8"
    requirement: POLISH-VR
    verification:
      - kind: e2e
        ref: "npm run test:e2e (227/243 passing); isolated reruns + DOM/git-log inspection traced all 16 failures to GlobalFooter.tsx, ContactForm.tsx, and nav-links.spec.ts test design (all outside Wave 1 scope) plus dev-server contention"
        status: pass
    human_judgment: false
  - id: D3
    description: "Human confirmed live-render: both dark-surface secondary CTAs show a white outline over a genuinely transparent interior (hero photo/gradient visible through the button), not an opaque panel"
    requirement: POLISH-VR
    verification: []
    human_judgment: true
    rationale: "outlineOnDark is a real rendering-path change unprovable by grep; this repo has no visual-regression harness. Human confirmed via live render at /en (hero) and the closing CTA band."
  - id: D4
    description: "Human confirmed a visible gold focus-visible ring on keyboard Tab at all 8 Contract §4 Button call sites"
    requirement: POLISH-VR
    verification: []
    human_judgment: true
    rationale: "Focus-ring visibility has no automated a11y/visual-regression coverage in this repo. Human confirmed via keyboard Tab across header, hero, CTA band, mobile nav, and product-detail RFQ button."
  - id: D5
    description: "Human confirmed the FAQ accordion renders correctly in both LTR (/en/contact) and RTL (/ar/contact), including chevron side/direction and no overflow at mobile width"
    requirement: POLISH-VR
    verification: []
    human_judgment: true
    rationale: "08-UI-SPEC's RTL contract explicitly calls for build-time verification, not assumption, for the accordion chevron under RTL. Human confirmed both locales."
  - id: D6
    description: "Human confirmed the card and digit fixes landed visually: FeatureGrid/SpecTable cards carry the hairline border + soft resting shadow, and StatsBand/ExportMap/SpecTable digits are equal-width"
    requirement: POLISH-VR
    verification: []
    human_judgment: true
    rationale: "No automated visual-regression harness exists in this repo (same gap Phase 6 recorded for its own card-recipe change). Human confirmed via live render at /en and a product detail page."

# Metrics
duration: 95min
completed: 2026-07-29
status: complete
---

# Phase 8 Plan 4: Wave 1 Merged-Output Verification + Live-Render Sign-off Summary

**Ran the full automated gate suite (lint/lint:rtl/typecheck/vitest/build/Playwright e2e) against the merged Button-consolidation + card-recipe + FAQ-block output, root-caused every e2e failure back to pre-existing unrelated files rather than accepting them at face value, and closed 08-UI-SPEC's one `🧪 backstop, human-needed` item with a human-confirmed live-render sign-off.**

## Performance

- **Duration:** 95 min
- **Started:** 2026-07-29T07:33:00+05:30 (approx, file reads)
- **Completed:** 2026-07-29T09:08:00+05:30 (approx)
- **Tasks:** 2 completed
- **Files modified:** 1 (`deferred-items.md`)

## Accomplishments
- Ran lint, lint:rtl, typecheck, vitest, and a production Next build against the merged Wave 1 tree — all green (lint's 5 errors reconfirmed pre-existing and unrelated to any Phase 8 file).
- Confirmed the phase diff (anchored to `ca33ce5`, the commit right before 08-01's first task commit) touches only the three Wave 1 plans' declared files plus the new FAQ migration pair and `.planning/` artifacts, with zero new npm dependencies.
- Discovered and fixed a local-environment gap blocking the checkpoint: `db:seed`'s per-slug idempotency meant the already-seeded Contact page never received 08-03's new FAQ block. Patched the local dev DB directly (gitignored `payload.db`, no source change) so the FAQ was live for verification.
- Installed missing Playwright browsers and ran the full e2e suite (227/243 passing); root-caused all 16 failures via isolated reruns, direct DOM inspection, and `git log` provenance checks to three pre-existing, unrelated issues (`GlobalFooter.tsx` footer-link overflow, `ContactForm.tsx` required-asterisk accessible-name mismatch from a pre-Phase-8 quick task, and a fragile `nav-links.spec.ts` test design) plus confirmed dev-server-contention flakiness — none touching any Wave 1 file.
- Obtained explicit human sign-off on all 13 live-render checkpoint steps: dark-surface secondary CTA transparency (Hero + CTA band), gold focus rings at all 8 Contract §4 call sites, FeatureGrid/SpecTable hairline card recipe with no hover lift, equal-width tabular digits, and the FAQ accordion's collapse/expand + chevron behavior in both `/en/contact` and `/ar/contact`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Run the full automated gate suite on the merged Wave 1 output** - `b804288` (docs)
2. **Task 2: Live-render sign-off on the Button consolidation, card recipe, tabular figures, and FAQ** - human-verify checkpoint, approved (no source commit — verification only)

**Plan metadata:** final docs commit follows this Summary.

## Files Created/Modified
- `.planning/phases/08-component-polish-pass-apply-amended-design-system-across-car/deferred-items.md` - Logged pre-existing gate findings (lint re-confirmation, GlobalFooter.tsx overflow, ContactForm.tsx label mismatch, nav-links.spec.ts test-design fragility) discovered while verifying the merged tree.

## Decisions Made
- Anchored the diff-confinement check to `ca33ce5` (the commit immediately preceding 08-01's first task commit), not the prior phase's completion commit — several unrelated quick-task commits (logo sizing, footer social icons, contact-form UX, CLAUDE.md docs, eslint scope fix) landed between Phase 7's close and Phase 8's start and would otherwise have falsely inflated the phase diff.
- Patched the local dev database directly to add the FAQ block to the already-seeded Contact page, rather than treating `db:seed`'s idempotent skip as an unfixable blocker — this is a data-only fix (gitignored `payload.db`), not a source-code change, consistent with this plan's "no source files change here" constraint.
- Treated `npx playwright install chromium` as installing a missing binary for an already-declared devDependency, not as adding a new package — proceeded without a package-legitimacy checkpoint.
- Did not fix any of the 3 root-caused pre-existing e2e issues from this plan, per the scope-boundary rule; logged all three to `deferred-items.md` for a future cleanup task.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Patched local dev DB so the seeded FAQ block actually exists on /en/contact**
- **Found during:** Task 1 (`npm run db:seed` step)
- **Issue:** `seed-pages.ts` skips a slug that already has an English doc; the local Contact page predated 08-03's FAQ addition to `seed-content.ts`, so re-running `db:seed` silently did not add the FAQ block, which would have made Task 2's FAQ checkpoint steps fail on a page with no FAQ.
- **Fix:** Wrote a throwaway script (deleted after use) using the Payload local API to update the existing Contact page doc's `layout` to match `PAGES_EN_SEED`'s current contact entry (adds the `faq` block only, no other change). Verified via `sqlite3` that `pages_blocks_faq`/`pages_blocks_faq_items` now hold the 4 seeded items.
- **Files modified:** None (data-only; `payload.db` is gitignored, `git status --short` confirmed no source drift).
- **Verification:** `sqlite3 ./payload.db "SELECT question FROM pages_blocks_faq_items"` returned all 4 seeded questions; `/en/contact` and `/ar/contact` both confirmed live with the FAQ during the Task 2 checkpoint.
- **Committed in:** N/A (no source file changed).

**2. [Rule 3 - Blocking] Installed missing Playwright browsers**
- **Found during:** Task 1 (`npm run test:e2e` step)
- **Issue:** `browserType.launch: Executable doesn't exist` — Playwright's Chromium binary was never downloaded in this environment.
- **Fix:** Ran `npx playwright install chromium` (binary download for the already-installed `@playwright/test` devDependency).
- **Files modified:** None (browser cache, not repo state).
- **Verification:** `npm run test:e2e` subsequently launched and ran the suite.
- **Committed in:** N/A.

---

**Total deviations:** 2 auto-fixed (both Rule 3 - blocking issues preventing the gate suite / checkpoint from running against real content).
**Impact on plan:** Both fixes were environment/data-only — no source file was touched, consistent with this plan's "no source files change here" design. No scope creep.

## Issues Encountered
- Initial full-parallel `npm run test:e2e` run reported 16 failures. Rather than accepting these as an unexplained blocker or blindly re-running, root-caused each one: isolated single-worker reruns (some passed clean, confirming dev-server-contention flakiness), direct DOM inspection via a throwaway Playwright script (confirmed `ContactForm.tsx`'s required-asterisk markup breaks exact label matching), an overflow-offender scan (confirmed two `GlobalFooter.tsx` footer links overflow at 640px), and `git log <baseline>..HEAD -- <file>` checks (confirmed both files have zero commits since the Phase 8 baseline). All three real, reproducible issues are pre-existing and outside every Wave 1 plan's declared file scope — logged to `deferred-items.md`, not fixed here.

## User Setup Required
None - no external service configuration required. The local dev DB patch is dev-only and gitignored; it has no effect on other environments (fresh environments will get the FAQ block from `seed-content.ts` via `db:seed`'s normal create path, since their Contact page won't already exist).

## Next Phase Readiness
- Phase 8 (component polish pass) is fully signed off: automated gates green on the merged tree, diff confined to declared scope, zero new dependencies, and the one `🧪 backstop, human-needed` item from 08-UI-SPEC (Button consolidation visual regression) plus the FAQ's RTL-chevron "verify at build time" instruction are both explicitly closed via human confirmation.
- Three pre-existing, unrelated defects were surfaced during this verification and logged to `deferred-items.md` for a future cleanup task: `GlobalFooter.tsx` footer-link overflow at 640px, `ContactForm.tsx` required-asterisk breaking exact accessible-name label matching (from quick task 260725-69i), and `nav-links.spec.ts`'s fragile 7-navigation-in-30s test design. None block Phase 8 sign-off since none touch this phase's files.
- No blockers for the next phase.

---
*Phase: 08-component-polish-pass-apply-amended-design-system-across-car*
*Completed: 2026-07-29*

## Self-Check: PASSED

`08-04-SUMMARY.md` found on disk; both commits (`b804288`, `b320da4`) found in git log.
