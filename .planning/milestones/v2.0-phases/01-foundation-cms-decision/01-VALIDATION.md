---
phase: 1
slug: foundation-cms-decision
status: approved
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-14
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Greenfield project — Wave 0 installs the test toolchain.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (unit/component) + Playwright (e2e, incl. RTL/locale routing) — none installed yet; Wave 0 installs |
| **Config file** | none — Wave 0 creates `vitest.config.ts` + `playwright.config.ts` |
| **Quick run command** | `npx vitest run` |
| **Full suite command** | `npx vitest run && npx playwright test` |
| **Estimated runtime** | ~30–90 seconds (grows with e2e locale matrix) |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run full suite `npx vitest run && npx playwright test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

> Populated/refined by the planner. Every Phase 1 success criterion maps to at least one automated or documented-manual check below.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | infra (Wave 0) | — | N/A | setup | `npx vitest run` / `npx playwright test` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | FOUND-01 | — | locale-prefixed URLs resolve (en root, /ar//fr//ru/) | e2e | `npx playwright test tests/e2e/locale-routing.spec.ts` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 | 1 | FOUND-03 | T-01-01 | `ar` page has `dir="rtl"` + Latin (latn) numerals | e2e | `npx playwright test tests/e2e/rtl-arabic.spec.ts` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 2 | FOUND-02 | — | EN fallback content renders for untranslated locales | integration | `npx vitest run tests/int/payload-fallback.spec.ts` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 3 | FOUND-04 | T-01-12 | switcher preserves path across locales | e2e | `npx playwright test tests/e2e/language-switcher.spec.ts` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 | 3 | FOUND-05 | — | header/footer/hero render sm/md/lg/xl in ltr+rtl | e2e | `npx playwright test tests/e2e/responsive-rtl.spec.ts` | ❌ W0 | ⬜ pending |
| 01-02-03 / 01-03-03 | 02, 03 | 2, 3 | FOUND-06 | T-01-10 | untranslated page shows EN + visible notice (logic + banner) | integration + e2e | `npx vitest run tests/int/payload-fallback.spec.ts` + `npx playwright test tests/e2e/fallback-notice.spec.ts` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 2 | CMS-02 | T-01-08 | Home has a `localized:true` field; `fallbackLocale:false` returns null when untranslated | integration | `npx vitest run tests/int/payload-localization.spec.ts` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 2 | CMS-03 | — | publish fires `revalidatePath`, no rebuild | integration | `npx vitest run tests/int/payload-revalidate-hook.spec.ts` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 2 | CMS-04 | T-01-06 | media (image + PDF) upload stored + servable | integration | `npx vitest run tests/int/payload-media-upload.spec.ts` | ❌ W0 | ⬜ pending |
| 01-04-02 | 04 | 4 | CMS-01, CMS-04 | T-01-14, T-01-15 | deployed admin full create→publish→visible loop + media servable from EU bucket | manual (checkpoint) + curl | `[ "$(curl -s -o /dev/null -w '%{http_code}' "$(cat .media-url)")" = "200" ]` (deployed publish loop is human-verified) | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Install + configure Vitest (`vitest.config.ts`)
- [ ] Install + configure Playwright (`playwright.config.ts`) with locale project matrix (en, ar)
- [ ] Test scaffolding for FOUND-01/03/04/06 e2e specs

*Greenfield — no existing infrastructure; Wave 0 establishes all of it.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Non-technical staff complete the full create → publish → visible-on-site loop in the deployed Payload admin browser UI, no dev/redeploy | CMS-01 | Requires human interaction with the real admin UI + judgment on "non-technical usability"; all automated specs use the Local API, not the browser admin | On deployed `/admin`, edit the Home global, publish, confirm the edit appears on the live site `/` in a fresh tab (Plan 04 Task 2) |
| Media (image/PDF) upload via deployed admin is servable from the EU bucket | CMS-04 | Human upload via browser admin; automated curl on `.media-url` confirms servability | Upload an image + a PDF in deployed `/admin`, record the object URL to `.media-url`, confirm HTTP 200 (Plan 04 Task 2) |
| Adding a new item requires no code change / rebuild trigger (ISR revalidation) | CMS-03 | Live-revalidation observation on the deployed environment | Publish an edit, confirm it appears within the on-demand revalidation window with no `git push`/redeploy (Plan 04 Task 2) |
| **D-02 spike:** Payload Arabic admin glyph rendering acceptable (target issue #14893, not RTL layout which is fixed) | phase gate | Go/no-go judgment on Arabic text rendering quality in admin fields | Developer-level check sufficient: enter Arabic text in a localized field on deployed `/admin`, confirm glyphs render/shape correctly; if unacceptable, trigger Sanity fallback per D-02 (Plan 04 Task 2) |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 90s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** 2026-07-14
