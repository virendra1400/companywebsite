---
phase: 01-foundation-cms-decision
plan: 04
subsystem: deploy
tags: [vercel, payload, eu-region, rtl, retroactive]

# Dependency graph
requires:
  - phase: 01-foundation-cms-decision (Plan 02)
    provides: Payload CMS backend, EU Postgres + S3/Blob media, env var contract
  - phase: 01-foundation-cms-decision (Plan 03)
    provides: Chrome + Home page wired to CMS content
provides:
  - Live Vercel production deployment (star-agrevolution.vercel.app), region fra1 (vercel.json)
  - Confirmed reachable: /, /ar, /admin (curl 200 on all three, 2026-07-20)
  - D-02 Arabic admin glyph-rendering go/no-go: risk-accepted, not live-verified
affects: [Phase 2, Phase 3 — both built and shipped on top of this deploy]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Deploy executed manually (`vercel deploy --prod`) outside this plan's automated Task 1/Task 2 flow — plan artifacts (.deploy-url, .media-url, README D-02 heading) were never populated even though the underlying deploy happened"
---

<summary>
Retroactive closure. This plan's Task 1 (Vercel EU preview deploy) and Task 2 (human-verify checkpoint: publish loop, media upload, D-02 Arabic glyph spike) were never executed through the GSD plan flow — no SUMMARY existed, no `.deploy-url`/`.media-url` files, no README "D-02 Spike" section. In the six months since, the site was deployed straight to Vercel production (`vercel.json` pins `regions: ["fra1"]` per D-04) and Phases 2–3 were built and shipped entirely on top of that live deploy, with real production bugs found and fixed in exactly the paths this plan meant to verify (Media public-read 403, next/image SVG rendering, importMap blob-component registration, upload MIME sniffing). That is stronger evidence than a one-time checkpoint would have produced.

**Verified now (2026-07-20):** `curl` against `https://star-agrevolution.vercel.app/` → 200, `/ar` → 200, `/admin` → 200. Deploy leg of ROADMAP success criterion 5 is satisfied.

**Not independently re-verified:** the publish-loop (edit in `/admin` → visible on site) and media-upload-to-bucket truths were not re-run as a discrete checkpoint — they're accepted as proven by the volume of subsequent CMS-driven work (SiteSettings brand/logo editing, Products/Certifications/Pages all CMS-authored and live).

**D-02 Arabic admin glyph-rendering spike — risk-accepted, not live-verified.** Per `01-RESEARCH.md`: the three previously-cited Payload RTL admin-chrome layout bugs (#9482, #10344, #11162) are closed and fixed upstream in 3.86.0. The one open risk (#14893, "Font Rendering Issues in Payload Admin Panel") is confirmed for Vietnamese, not confirmed for Arabic. User elected to accept this as low-risk rather than spend a live-check cycle, given the same font-rendering machinery already works correctly for the public-facing site's Arabic strings (locale routing, chrome, fallback notice — Plan 01/03). Decision: **Payload confirmed (D-01 stands), no Sanity fallback triggered.** Revisit if a staff editor reports actual glyph/ligature problems entering Arabic content in `/admin`.
</summary>

<deviations>
- Plan specified an automated deploy + scripted curl verification + a blocking human-verify checkpoint, executed through the GSD plan/executor flow. Actual execution: deploy was done manually by the user outside any GSD plan run, and this SUMMARY was written retroactively during a `/gsd-resume-work` session to close the tracking gap — not by running Task 1/Task 2 as authored.
- D-02 spike was not performed as a live "type Arabic text in the browser and inspect glyphs" check. Recorded as risk-accepted per user decision, not as a pass/fail from direct observation.
</deviations>

<for-future-plans>
- Any future plan touching `/admin` locale switching or Lexical rich-text with non-Latin scripts should treat D-02 as reopened, not settled — this closure is a risk acceptance, not a verified pass.
- `vercel.json` already pins `fra1`; no further EU-region config needed for future deploy work.
</for-future-plans>
