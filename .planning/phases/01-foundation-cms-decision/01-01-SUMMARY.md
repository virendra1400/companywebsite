---
phase: 01-foundation-cms-decision
plan: 01
subsystem: infra
tags: [nextjs, next-intl, tailwind-v4, typescript, i18n, rtl, playwright, vitest, shadcn, ibm-plex]

# Dependency graph
requires: []
provides:
  - Next.js 16 App Router + Tailwind v4 + TypeScript-strict scaffold
  - next-intl path-prefix routing (en root, /ar //fr //ru) with middleware
  - Server-set <html lang/dir> per locale (ar=rtl) — no client toggle
  - IBM Plex Sans / IBM Plex Sans Arabic per-script font loading
  - latn numeral format for Arabic (FOUND-03)
  - Design token @theme (UI-SPEC color ramp, spacing, typography)
  - shadcn foundation (components.json + cn util) for Plan 03 components
  - Vitest (int project) + Playwright (en+ar matrix) test harness
  - RTL physical-direction grep gate (scripts/check-physical-direction.mjs)
affects: [01-02 Payload CMS, 01-03 chrome components, 01-04 deploy]

# Tech tracking
tech-stack:
  added: [next@16.2.10, react@19.2.4, next-intl@4.13.2, tailwindcss@4.3.2, clsx, tailwind-merge, vitest@4, "@playwright/test@1.61"]
  patterns:
    - "next-intl path-prefix routing with localeDetection disabled (stable English root)"
    - "Server-only dir/lang via routing locale + RTL_LOCALES set"
    - "Per-script next/font subsetting (latin vs arabic) applied conditionally"
    - "Logical Tailwind utilities only; grep gate enforces no physical-direction classes"
    - "Explicit format.number(n,'latn') for Arabic numerals (avoids ICU # plural pitfall)"

key-files:
  created:
    - src/i18n/routing.ts
    - src/i18n/navigation.ts
    - src/i18n/request.ts
    - src/middleware.ts
    - src/i18n/messages/{en,ar,fr,ru}.json
    - src/app/(site)/[locale]/layout.tsx
    - src/app/(site)/[locale]/page.tsx
    - src/app/globals.css
    - components.json
    - src/lib/utils.ts
    - scripts/check-physical-direction.mjs
    - vitest.config.ts
    - playwright.config.ts
    - tests/e2e/locale-routing.spec.ts
    - tests/e2e/rtl-arabic.spec.ts
  modified:
    - next.config.ts
    - package.json

key-decisions:
  - "localeDetection:false — English root is stable for all visitors/crawlers; locale change is explicit via switcher"
  - "Chrome messages (nav/switcher/hero/fallback/sample) live in src/i18n/messages; CMS content stays out (Plan 02+)"
  - "shadcn foundation created by hand (components.json + cn) instead of interactive init to avoid clobbering hand-authored @theme tokens"
  - "Pinned Tailwind to ~4.3.2; next/next-intl exact/caret per plan"

patterns-established:
  - "RTL: server-set dir + logical utilities + grep gate — no client-side dir toggle ever"
  - "Arabic numerals: named 'latn' format in request.ts, called explicitly per number"
  - "Route groups: (site)/[locale] holds the public locale tree; (payload) reserved for Plan 02"

requirements-completed: [FOUND-01, FOUND-03]

# Metrics
duration: ~90min (across session restarts)
completed: 2026-07-14
---

# Phase 1 Plan 01: Locale/RTL Foundation Skeleton Summary

**Next.js 16 + Tailwind v4 + TS-strict app with next-intl path-prefix routing (en/ar/fr/ru), server-set RTL, per-script IBM Plex fonts, Western Arabic numerals, and a green Vitest+Playwright harness.**

## Performance

- **Duration:** ~90 min (spanned two session restarts; scaffold + full plan)
- **Completed:** 2026-07-14
- **Tasks:** 3 (plus one auto-fix)
- **Files created/modified:** ~20 (excluding node_modules)

## Accomplishments
- All four locale URLs (`/`, `/ar`, `/fr`, `/ru`) render the placeholder hero and return 200, prerendered as static HTML.
- `/ar` is `<html dir="rtl" lang="ar">` set server-side; every other locale is `dir="ltr"`; no client-side direction toggle.
- Arabic sample count renders Western (latn) digits via an explicit `format.number(n, "latn")` call, dodging the ICU `#`-plural pitfall (Research Pitfall 2).
- IBM Plex Sans (latin) loads for en/fr/ru; IBM Plex Sans Arabic (arabic subset) loads only for `ar`.
- Design tokens (`@theme`), shadcn foundation, and the RTL physical-class grep gate are in place for Plan 03 chrome components.
- Vitest + Playwright harness installed; 14/14 e2e assertions pass across the en+ar project matrix.

## Task Commits

1. **Task 1a: Scaffold** — `26cb7b9` (chore) — create-next-app, TS-strict, .gitignore
2. **Task 1b: Tokens + shadcn + harness + RED specs** — `311518a` (feat)
3. **Task 2: Routing + middleware + request config + messages** — `a099ce0` (feat)
4. **Task 3: Locale layout + placeholder home page** — `4008019` (feat)
5. **Auto-fix: disable locale auto-detection** — `7773c70` (fix)

## Files Created/Modified
- `src/i18n/routing.ts` — locales en/ar/fr/ru, defaultLocale en, localePrefix as-needed, localeDetection off, RTL_LOCALES set
- `src/i18n/navigation.ts` — Link/usePathname/useRouter/redirect from createNavigation (Plan 03 switcher)
- `src/i18n/request.ts` — loads messages + declares `latn` number format
- `src/middleware.ts` — createMiddleware(routing); matcher excludes api/admin/_next/_vercel/dotted files
- `src/i18n/messages/{en,ar,fr,ru}.json` — chrome strings: nav, switcher.ariaLabel, hero, fallbackNotice, sample.count
- `src/app/(site)/[locale]/layout.tsx` — hasLocale→notFound, setRequestLocale, generateStaticParams, per-script fonts, server-set html lang/dir
- `src/app/(site)/[locale]/page.tsx` — hero (Display headline, Body subhead, Request-a-Quote CTA), latn sample-count, logical utilities only
- `src/app/globals.css` — Tailwind v4 @theme (UI-SPEC color ramp, spacing, 4 type sizes / 2 weights), nested --font-sans fallback
- `components.json`, `src/lib/utils.ts` — shadcn neutral-base foundation + cn()
- `scripts/check-physical-direction.mjs` — CI/lint grep gate banning physical-direction classes under src/
- `vitest.config.ts` — node env, `int` project for Plan 02 Payload tests
- `playwright.config.ts` — en+ar matrix, webServer `npm run dev`
- `tests/e2e/locale-routing.spec.ts`, `tests/e2e/rtl-arabic.spec.ts` — FOUND-01/FOUND-03 e2e
- `next.config.ts` — withNextIntl plugin
- `package.json` — pins + test/lint:rtl scripts

## Decisions Made
- **localeDetection: false** — see Deviations (root cause of the one initial e2e failure).
- Hand-authored the shadcn foundation (`components.json` + `cn`) rather than running interactive `npx shadcn init`, which would have overwritten the hand-written `@theme` token block and can't run non-interactively cleanly. Plan 03 adds Button/DropdownMenu/Sheet via `npx shadcn add`.
- Message files carry realistic-shaped placeholder ar/fr/ru copy for the skeleton. Published marketing copy must be professional human translation (project constraint) — see Known Stubs.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] next-intl locale auto-detection made the English root non-deterministic**
- **Found during:** Task 3 verification (Playwright `ar` project)
- **Issue:** With next-intl's default `localeDetection: true`, a browser sending `Accept-Language: ar` requesting `/` got 307-redirected to `/ar`, so the root wasn't stable English. This also failed the "/ is dir=ltr" e2e assertion in the `ar` project.
- **Fix:** Set `localeDetection: false` in `routing.ts`. English root now stays English for all visitors and crawlers (SEO-canonical, matches D-05 "English at root"); locale changes are explicit via the LanguageSwitcher (FOUND-04, Plan 03).
- **Files modified:** `src/i18n/routing.ts`
- **Verification:** `npx playwright test` → 14/14 pass across en+ar projects.
- **Committed in:** `7773c70`

---

**Total deviations:** 1 auto-fixed (Rule 1). No scope creep — the fix aligns behavior with the locked D-05 decision.

## Issues Encountered
- **Worktree missing planning files:** `.planning/` is gitignored (commit_docs=false) and was not present in the fresh worktree. Copied the needed phase/planning docs from the main repo (`D:/PW/.planning`) so execution context was available. SUMMARY committed with `git add -f`.
- **Next 16 middleware deprecation warning:** the build prints `The "middleware" file convention is deprecated. Please use "proxy" instead.` next-intl still ships its middleware via `middleware.ts`; left as-is (framework warning, non-blocking). Revisit if next-intl adopts the `proxy` convention.

## Known Stubs
- **ar/fr/ru message copy** (`src/i18n/messages/{ar,fr,ru}.json`): realistic-shaped placeholder translations for the skeleton. Published non-English copy requires professional human translation per project constraint (English is source of truth). Chrome fallback-notice strings match the UI-SPEC Copywriting Contract exactly. Final copy is a Phase 2 content task.
- **Hero CTA** links to `mailto:sales@staragrevolution.com` as a placeholder; the real Contact/RFQ flow ships Phase 2/4 (UI-SPEC allows build-time discretion here).
- These stubs do not block the plan goal (routing/RTL/font pipeline is proven end-to-end).

## Next Phase Readiness
- Plan 02 (Payload CMS) can graft the `(payload)` route group beside `(site)`; the middleware matcher already excludes `/admin` and `/api`. Vitest `int` project is ready for Payload Local API tests.
- Plan 03 (chrome) can `npx shadcn add button dropdown-menu sheet` against the existing `components.json`, and consume `usePathname`/`useRouter` from `src/i18n/navigation.ts` for the LanguageSwitcher.
- No blockers.

---
*Phase: 01-foundation-cms-decision*
*Completed: 2026-07-14*
