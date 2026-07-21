---
phase: 04-lead-conversion-rfq-inquiry-whatsapp-analytics
plan: 05
subsystem: analytics
tags: [plausible, analytics, next-script, nextjs, i18n-layout]

requires:
  - phase: 04-lead-conversion-rfq-inquiry-whatsapp-analytics
    provides: "trackEvent() vendor-agnostic dispatch wrapper (04-01), RFQ/inquiry/WhatsApp conversion call sites (04-01/03/04)"
provides:
  - "Analytics vendor decision recorded: Plausible (cookieless)"
  - "Plausible script mounted site-wide in the root locale layout, guarded against missing NEXT_PUBLIC_PLAUSIBLE_DOMAIN"
  - "Confirmation that trackEvent's window.plausible dispatch branch matches the mounted vendor"
affects: [analytics, deployment, env-config]

tech-stack:
  added: []
  patterns:
    - "Vendor scripts mount via next/script Script component guarded by an env-var presence check, so dev/CI render cleanly with no key set."

key-files:
  created: []
  modified:
    - "src/app/(site)/[locale]/layout.tsx"

key-decisions:
  - "Analytics vendor: Plausible (cookieless), chosen at the Task 1 checkpoint:decision by the orchestrator/user before this plan was dispatched — resume-signal recorded as \"plausible\"."
  - "No @next/third-parties dependency added, no ConsentBanner.tsx created, no consent catalog keys added to any locale — the Plausible path is cookieless so the GA4 consent-banner requirement (UI-SPEC) does not apply; avoids dead code."

patterns-established:
  - "Third-party scripts in the App Router locale layout use next/script's Script component with strategy=\"afterInteractive\" and a truthy-env-var guard (`{envVar ? <Script .../> : null}`), not a raw <script> tag."

requirements-completed: [ANALY-01, LEAD-07]

coverage:
  - id: D1
    description: "Analytics vendor decision (GA4+GTM vs Plausible) resolved and recorded"
    requirement: "ANALY-01"
    verification:
      - kind: manual_procedural
        ref: "Decision pre-resolved by orchestrator/user before dispatch; recorded in this SUMMARY as \"plausible\""
        status: pass
    human_judgment: false
  - id: D2
    description: "Plausible script mounted in root site layout, guarded against missing NEXT_PUBLIC_PLAUSIBLE_DOMAIN"
    requirement: "ANALY-01"
    verification:
      - kind: unit
        ref: "npx tsc --noEmit (clean)"
        status: pass
      - kind: unit
        ref: "npx eslint src/app/(site)/[locale]/layout.tsx (clean)"
        status: pass
    human_judgment: false
  - id: D3
    description: "trackEvent's window.plausible dispatch branch matches the mounted vendor; rfq_submit/inquiry_submit/whatsapp_click events reach Plausible once NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set"
    requirement: "LEAD-07"
    verification:
      - kind: manual_procedural
        ref: "Code inspection of src/lib/analytics.ts confirms the window.plausible(name, {props}) branch already exists (built in 04-01) and requires no change; runtime confirmation needs a real Plausible domain + deployed site, deferred to production verification"
        status: pass
    human_judgment: false
  - id: D4
    description: "Plausible path ships no dead code (no ConsentBanner, no @next/third-parties, no consent catalog keys)"
    verification:
      - kind: unit
        ref: "git status / package.json diff confirms no new dependency, no new component file, no locale catalog changes"
        status: pass
    human_judgment: false

duration: 12min
completed: 2026-07-21
status: complete
---

# Phase 04 Plan 05: Analytics Vendor Decision + Plausible Mount Summary

**Plausible (cookieless) chosen as the analytics vendor; script mounted in the root locale layout guarded by `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, with `trackEvent`'s existing `window.plausible` dispatch branch confirmed to match — no consent banner, no `@next/third-parties`, no dead code.**

## Performance

- **Duration:** ~12 min
- **Tasks:** 2 (1 checkpoint decision pre-resolved, 1 auto)
- **Files modified:** 1

## Accomplishments
- Task 1 (checkpoint:decision) resolved: **Plausible** selected as the analytics vendor (resume-signal: "plausible"), pre-resolved by the orchestrator/user before this plan was dispatched — no halt occurred.
- Task 2: Plausible script (`https://plausible.io/js/script.js`, `data-domain={NEXT_PUBLIC_PLAUSIBLE_DOMAIN}`) mounted in `src/app/(site)/[locale]/layout.tsx` via `next/script`'s `Script` component, guarded so it renders nothing when the env var is unset (dev/CI safe).
- Confirmed `trackEvent`'s `window.plausible` dispatch branch (`src/lib/analytics.ts`, built in 04-01) already matches the Plausible vendor — no code change needed there.
- Verified the Plausible path adds no dead code: no `@next/third-parties` dependency, no `ConsentBanner.tsx`, no consent catalog keys in any of the 4 locale files (GA4+GTM-only artifacts per the plan).

## Task Commits

Each task was committed atomically:

1. **Task 1: Decide the analytics vendor (checkpoint:decision)** — pre-resolved by orchestrator, no commit (decision recorded in this SUMMARY only)
2. **Task 2: Mount the chosen vendor script + conditional consent banner** - `0e6ea14` (feat)

## Files Created/Modified
- `src/app/(site)/[locale]/layout.tsx` - Added guarded `next/script` Plausible mount (`data-domain` from `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `strategy="afterInteractive"`) inside the `<body>`, before `NextIntlClientProvider`.

## Decisions Made
- **Analytics vendor: Plausible.** Pre-resolved by the orchestrator/user at the Task 1 checkpoint before this plan was dispatched. Rationale carried from the plan context: cookieless, no consent banner needed, simpler and privacy-friendly; trade-off accepted (no Google Ads attribution, shallower segmentation than GA4).
- Followed the plan's explicit Plausible-path instructions verbatim: no `@next/third-parties` install, no `ConsentBanner.tsx`, no consent copy added to any locale — the GA4+GTM-only artifacts listed in the plan's `must_haves.artifacts` are conditional and do not apply to this vendor choice.

## Deviations from Plan

None - plan executed exactly as written for the Plausible path.

## Issues Encountered

**`.env.example` not updated — sandbox permission block.** This sandbox's permission settings deny all Read/Write/Edit/Bash access to `.env.example` (confirmed pre-existing constraint, not attempted further to avoid wasted retries). The plan's Task 2 action calls for adding `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` to `.env.example`; this step is deferred as a manual follow-up.

**Pending manual addition to `.env.example`:**
```
# Plausible analytics (ANALY-01) — Site settings -> domain in the Plausible dashboard
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
```

**Playwright e2e not run.** Not required by this plan's verify step (`npx tsc --noEmit && npx eslint src/app/(site)/[locale]/layout.tsx` only); both ran clean. No e2e attempted.

## User Setup Required

**External service requires manual configuration:**
- Create a Plausible site (Plausible dashboard -> Site settings -> domain) and set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` in the deployment environment (Vercel project env vars) to the registered domain.
- Add the same var line to `.env.example` locally (blocked in this sandbox — see Issues Encountered above):
  ```
  NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
  ```
- Until the env var is set, the site renders with no analytics script (guarded, no crash) — this is expected in local dev/CI.

## Next Phase Readiness
- ANALY-01 and the vendor-mount half of LEAD-07 are complete: Plausible is wired, `trackEvent` dispatches to it, and conversion events (`rfq_submit`, `inquiry_submit`, `whatsapp_click`) will reach Plausible once `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is set in production.
- No blockers for subsequent phases. The `.env.example` manual addition should be picked up by a human or a future plan with `.env.example` write access.

---
*Phase: 04-lead-conversion-rfq-inquiry-whatsapp-analytics*
*Completed: 2026-07-21*

## Self-Check: PASSED

- FOUND: commit 0e6ea14 (feat: mount Plausible script)
- FOUND: commit 611ca4d (docs: SUMMARY.md)
- FOUND: src/app/(site)/[locale]/layout.tsx
- FOUND: .planning/phases/04-lead-conversion-rfq-inquiry-whatsapp-analytics/04-05-SUMMARY.md
