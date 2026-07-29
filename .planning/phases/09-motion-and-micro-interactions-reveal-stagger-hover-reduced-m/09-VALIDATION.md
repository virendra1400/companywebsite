---
phase: 09
slug: motion-and-micro-interactions-reveal-stagger-hover-reduced-m
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-29
---

# Phase 09 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest `^4.1.10` (unit/integration, `tests/unit/`, `tests/int/`) + Playwright `^1.61.1` (e2e, `tests/e2e/`, `en`/`ar` locale projects configured) |
| **Config file** | `vitest.config.ts`, `playwright.config.ts` |
| **Quick run command** | `npm run test -- <pattern>` (vitest) / `npm run test:e2e -- <file>` (playwright, single spec) |
| **Full suite command** | `npm run test && npm run test:e2e && npm run lint:rtl && npm run typecheck` |
| **Estimated runtime** | ~10-20s quick (single vitest/playwright file) / ~4-6 min full suite |

---

## Sampling Rate

- **After every task commit:** Run `npm run typecheck && npm run lint:rtl` (fast, catches broken imports/RTL regressions immediately)
- **After every plan wave:** Run `npm run test && npm run test:e2e`
- **Before `/gsd-verify-work`:** Full suite must be green, plus a manual Lighthouse/CLS spot-check on the homepage (most blocks, per Phase 7's 11-block composition) given D-03's explicit CLS-protection intent
- **Max feedback latency:** ~30s (typecheck + lint:rtl per-task)

---

## Per-Task Verification Map

Task IDs are assigned by the planner (not yet run at validation-strategy time). Rows below map research's Phase Requirement → Test Map areas to test type/command; the planner should attach the matching Task ID/Plan/Wave when it creates each task's `<acceptance_criteria>`.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | D-13 / Accordion open+close animates via `grid-template-rows`, both directions play (Pitfall 4) | — | N/A | e2e | new/extended spec targeting Contact-page FAQ block | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | D-12 / `prefers-reduced-motion: reduce` → content visible immediately, no stuck `opacity-0` | — | N/A | e2e (`page.emulateMedia`) | `tests/e2e/reduced-motion.spec.ts` (new) | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | D-10 / Directional slide mirrors correctly under `ar` locale (Pitfall 6) | — | N/A | e2e (`--project=ar`) | extend `tests/e2e/rtl-arabic.spec.ts` or new spec | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | RTL / No physical-direction Tailwind classes introduced | — | N/A | static lint | `npm run lint:rtl` | ✅ existing | ⬜ pending |
| TBD | TBD | TBD | D-11+D-12 / `active:scale-[0.98]` applies visually, transition duration 0 under reduced motion | — | N/A | e2e or manual | new assertion in chrome/interaction spec | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/e2e/reduced-motion.spec.ts` — covers D-12 (reveal disabled, hover/active present-but-instant under `prefers-reduced-motion: reduce`)
- [ ] Extend an existing FAQ/Contact-page e2e spec (or add one) — covers D-13's accordion fix, verifying open AND close both animate (Pitfall 4)
- [ ] Extend `tests/e2e/rtl-arabic.spec.ts` or add a targeted spec — covers D-10's directional-slide RTL mirroring (Pitfall 6)
- [ ] No new test framework install needed — Vitest + Playwright already fully configured with `en`/`ar` locale projects

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| CLS/LCP spot-check on the most block-dense page | PERF-01 (cross-cutting) | Lighthouse/CWV scoring isn't part of this phase's automated suite (full CWV pass is Phase 10) | Run Lighthouse (or `npx unlighthouse`/Chrome DevTools) against the homepage after all blocks are wrapped in `<Reveal>`; confirm CLS stays ~0 and LCP (Hero) is unaffected by the reveal wrapper |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
