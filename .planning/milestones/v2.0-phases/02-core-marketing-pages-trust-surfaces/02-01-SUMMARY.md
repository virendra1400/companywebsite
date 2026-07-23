---
phase: 02-core-marketing-pages-trust-surfaces
plan: 01
subsystem: ui
tags: [shadcn, tailwind-v4, css-variables, design-tokens, react-hook-form, zod]

# Dependency graph
requires:
  - phase: 01-foundation-cms-decision
    provides: Locked brand design tokens (01-UI-SPEC.md color ramp) and existing shadcn Button/DropdownMenu/Sheet primitives
provides:
  - Complete shadcn :root semantic CSS variable set (--destructive, --border, --input, --ring, --muted, --card, --popover, --secondary, --accent + -foreground pairs) mapped to Phase 1 brand tokens
  - 7 new shadcn primitives: Card, Badge, Input, Textarea, Label, Form, AspectRatio
  - react-hook-form + zod + @hookform/resolvers now installed (pulled in by Form primitive)
affects: [02-02, 02-03, 02-04, 02-05, 02-06, 02-07, 02-08]

# Tech tracking
tech-stack:
  added: ["react-hook-form 7.81.x", "zod 4.4.x", "@hookform/resolvers 5.4.x (shadcn Form dependency)"]
  patterns: ["shadcn generic --accent maps to neutral-100 (hover slot), brand gold accent-600/800 reserved for explicitly-designed badge/PDF-icon/divider uses only"]

key-files:
  created:
    - src/components/ui/card.tsx
    - src/components/ui/badge.tsx
    - src/components/ui/input.tsx
    - src/components/ui/textarea.tsx
    - src/components/ui/label.tsx
    - src/components/ui/form.tsx
    - src/components/ui/aspect-ratio.tsx
  modified:
    - src/app/globals.css
    - package.json
    - package-lock.json

key-decisions:
  - "shadcn --accent mapped to neutral-100 (not brand gold) so gold never floods hover states on outline/ghost buttons and menu items"
  - "--ring mapped to accent-600 to match existing PrimaryButton focus-visible:ring-accent-600 pattern from Phase 1"
  - "Accepted react-hook-form/zod/@hookform/resolvers arriving now (via Form primitive) rather than deferring to Plan 06 - they are a genuine runtime dependency of Form, not an optional peer dep"

patterns-established:
  - "Pattern: shadcn semantic vars always map to Phase 1 @theme brand tokens (var(--color-*)), never to shadcn's generic defaults or raw hex outside the two explicitly-approved literals (--destructive, --background/card/popover white)"

requirements-completed: [PAGE-04]

# Metrics
duration: 25min
completed: 2026-07-15
---

# Phase 2 Plan 01: shadcn CSS-Variable Gap Closure + Primitive Install Summary

**Closed the Phase 1 shadcn CSS-variable gap (7 missing semantic vars, brand-mapped) and installed the 7 shadcn primitives (Card/Badge/Input/Textarea/Label/Form/AspectRatio) every Phase 2 block depends on.**

## Performance

- **Duration:** 25 min
- **Started:** 2026-07-15T04:33:00Z
- **Completed:** 2026-07-15T04:57:58Z
- **Tasks:** 2
- **Files modified:** 10 (1 modified globals.css, 7 created ui primitives, 2 modified package.json/package-lock.json)

## Accomplishments
- `globals.css` `:root` now defines the full shadcn semantic variable contract (`--destructive`, `--border`, `--input`, `--ring`, `--muted`, `--card`, `--popover`, `--secondary`, `--accent` + `-foreground` pairs), each mapped to a Phase 1 brand token per RESEARCH Pitfall 1's table
- `--accent` correctly resolves to `neutral-100` (hover slot) with an inline comment forbidding brand gold there — verified via grep, no `accent-600`/`accent-800` in the `--accent`/`--accent-foreground` values
- 7 shadcn primitives added via official `npx shadcn add` registry command; `button.tsx` untouched (shadcn CLI skipped it as identical)
- `npx tsc --noEmit`, `npm run lint:rtl`, and `npm run build` all exit 0 across all 4 locales (en/ar/fr/ru)

## Task Commits

Each task was committed atomically:

1. **Task 1: Reconcile shadcn :root semantic variables** - `347a9b6` (feat)
2. **Task 2: Add the 7 shadcn primitives and verify clean build** - `f7f7bb6` (feat)

_Plan metadata commit follows this summary._

## Files Created/Modified
- `src/app/globals.css` - Added 16 shadcn semantic CSS variables mapped to brand tokens
- `src/components/ui/card.tsx` - shadcn Card primitive (registry, unmodified)
- `src/components/ui/badge.tsx` - shadcn Badge primitive (registry, unmodified)
- `src/components/ui/input.tsx` - shadcn Input primitive (registry, unmodified)
- `src/components/ui/textarea.tsx` - shadcn Textarea primitive (registry, unmodified)
- `src/components/ui/label.tsx` - shadcn Label primitive (registry, unmodified)
- `src/components/ui/form.tsx` - shadcn Form/FormField/FormMessage react-hook-form wrapper (registry, unmodified)
- `src/components/ui/aspect-ratio.tsx` - shadcn AspectRatio primitive (registry, unmodified)
- `package.json` / `package-lock.json` - added `react-hook-form`, `zod`, `@hookform/resolvers` (Form primitive's runtime deps)

## Decisions Made
- `--accent`/`--accent-foreground` map to `neutral-100`/`neutral-900`, never brand gold — matches RESEARCH Pitfall 1's explicit rule that shadcn's generic accent slot is a hover background, not the brand's reserved-trim gold ramp.
- `--ring` maps to `accent-600` to stay consistent with the existing Phase 1 `PrimaryButton` `focus-visible:ring-accent-600` override.
- No `--radius` token was added — none of the 7 primitives required it to compile (per plan's conditional instruction).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] react-hook-form/zod/@hookform/resolvers installed by shadcn CLI (contrary to plan's historical-behavior assumption)**
- **Found during:** Task 2
- **Issue:** The plan (citing 01-03-SUMMARY.md Deviation #1) expected the shadcn CLI to *not* pull peer deps, and its acceptance criteria stated "react-hook-form deferred to Plan 06." Running the exact command the plan specified (`npx shadcn add ... form`) caused the CLI to install `react-hook-form`, `zod`, and `@hookform/resolvers` as genuine runtime dependencies of the generated `form.tsx` (it literally imports `react-hook-form`'s `useFormContext`/`Controller`) — this is not an optional peer dep that can be deferred, it is required for the Form primitive to compile and function at all.
- **Fix:** Accepted the versions the registry installed (`react-hook-form ^7.81.0`, `zod ^4.4.3`, `@hookform/resolvers ^5.4.0`), which match CLAUDE.md's approved stack versions (`react-hook-form 7.81.x`, `zod 4.4.x`) exactly. No extra action needed; Plan 06 will still own the RFQ-form-specific wiring, just against packages that already exist in `node_modules` now.
- **Files modified:** package.json, package-lock.json
- **Verification:** `npx tsc --noEmit` clean, `npm run build` exits 0
- **Committed in:** f7f7bb6 (Task 2 commit)

**2. [Rule 3 - Blocking] Fresh worktree had no local `.env` or seeded SQLite DB, causing `npm run build` to fail at static prerender**
- **Found during:** Task 2 verification (`npm run build`)
- **Issue:** This worktree had no `.env` file and no `payload.db`. `npm run build` sets `NODE_ENV=production`, under which Payload's sqlite adapter disables auto schema-push by default — the `home` table didn't exist, so prerendering `/en` (and other locales) failed with `SQLITE_ERROR: no such table: home`. This is a fresh-environment setup gap, not caused by this plan's code changes (globals.css / new ui primitives) — required to satisfy Task 2's own `npm run build` verification step.
- **Fix:** Created a local `.env` (`DATABASE_URI=file:./payload.db` + a freshly generated `PAYLOAD_SECRET`, both gitignored via existing `.env*` rule) and ran `npm run db:seed`, which runs outside `NODE_ENV=production` and pushes the schema + seeds Home content before building. No source files were changed for this fix.
- **Files modified:** none (`.env` and `payload.db` are gitignored, not committed)
- **Verification:** `npm run build` subsequently exits 0, all 4 locale routes (`/en`, `/ar`, `/fr`, `/ru`) prerender successfully
- **Committed in:** N/A (local environment file only, not committed)

---

**Total deviations:** 2 auto-fixed (both Rule 3 - blocking issues necessary to complete Task 2's own verification)
**Impact on plan:** No scope creep. Both fixes were required to satisfy the plan's own stated verification commands; no architectural changes, no code outside the plan's `files_modified` list was touched (aside from local-only `.env`/`payload.db`, which are gitignored and not part of the codebase).

## Issues Encountered
- `payload-types.ts` shows as modified in `git status` but the diff is empty (0 lines) — confirmed this is line-ending normalization noise from `core.autocrlf=true` interacting with Payload's LF-generated file, not an actual content change. Left untouched; out of this plan's scope (not in `files_modified`).

## User Setup Required

None - no external service configuration required. (Local `.env`/`payload.db` were created for build verification only, gitignored, and not part of deployment config.)

## Next Phase Readiness
- Every shadcn semantic CSS variable referenced by Card/Badge/Input/Textarea/Label/Form/AspectRatio and Button's outline/destructive/secondary variants now resolves to a real brand-mapped value.
- The 7 primitives are installed, uneditted (Registry Safety preserved), and build clean against the new variables.
- react-hook-form/zod/@hookform/resolvers are already present in node_modules at CLAUDE.md-approved versions, ahead of Plan 06's RFQ form work.
- No blockers for downstream Phase 2 block plans (02-02 through 02-08).

## Self-Check: PASSED

All 8 created/modified files confirmed present on disk; both task commit hashes (347a9b6, f7f7bb6) confirmed in `git log --oneline --all`.

---
*Phase: 02-core-marketing-pages-trust-surfaces*
*Completed: 2026-07-15*
