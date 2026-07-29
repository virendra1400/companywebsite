# Deferred Items — Phase 08

Out-of-scope discoveries logged during execution, not fixed per the executor scope boundary rule (only auto-fix issues directly caused by the current task's changes).

| Plan | Discovered during | File | Issue | Status |
|------|-------------------|------|-------|--------|
| 08-01 | Task 2 verify (`npm run lint`) | `src/app/(site)/[locale]/insights/not-found.tsx` | 4x `@next/next/no-html-link-for-pages` errors (`<a>` instead of `next/link`) — pre-existing, confirmed present on baseline commit before this plan's edits (`git stash` diff check) | Not fixed — out of scope for 08-01, which only touches FeatureGridBlock/SpecTable/StatsBandBlock/ExportMapBlock |
| 08-01 | Task 2 verify (`npm run lint`) | `src/components/blocks/RenderBlocks.tsx` | 1x `@typescript-eslint/no-explicit-any` error — pre-existing, confirmed present on baseline commit before this plan's edits | Not fixed — out of scope for 08-01 |
