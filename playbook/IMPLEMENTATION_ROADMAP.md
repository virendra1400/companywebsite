# IMPLEMENTATION_ROADMAP — VNP Global

Four phases. Phase 0 is an emergency hotfix sprint — do it before anything else, ideally same-day. Task details (acceptance criteria, model, prompts) in TASK_BACKLOG.md; IDs cross-reference.

## Phase 0 — Stop the Bleeding (hours, not days)

Goal: no fabricated claims, no broken conversion paths, no SEO self-sabotage — WITHOUT redesigning anything.

| Task | ID | Depends on |
|---|---|---|
| Remove "Trusted by 60+ buyers" badge + "16+ markets" stat + "trusted" meta wording | T-001 | — |
| Fix 10 dead WhatsApp links (CMS: point CTA bands at contactChannels global) | T-002 | — |
| Domain/SEO identity fix: canonicals, sitemap, robots, JSON-LD url, og:image → vnpglobal.in; protect + noindex staging domain | T-003 | — |
| Lock down /admin (auth verified, rate-limit, consider IP allowlist/path change) | T-004 | — |
| De-list fake locales: remove /ar /fr /ru from sitemap, 410 or 301, remove switcher | T-005 | — |
| Fix 4 mismatched product photos with correctly-matched interim images | T-006 | — |
| Remove empty /insights from footer; fix /global-markets 404 → redirect | T-007 | — |
| Soften unverifiable claims (IEC/APEDA wording until numbers, "responds within one business day" → commitment phrasing) | T-008 | T-001 |

Exit gate: QA_CHECKLIST §A passes on live site; Search Console shows vnpglobal.in sitemap.

## Phase 1 — Trust Core Rebuild (the relaunch)

Goal: win the buyer's 3-minute diligence scan. Foundation + the five pages that decide credibility + conversion flow.

| Task | ID | Depends on |
|---|---|---|
| Design tokens & global styles (P-01) | T-101 | Phase 0 |
| Header / mega-menu / footer + legal strip (P-02) | T-102 | T-101 |
| CMS content model migration (7.3 schema: products/specs/certs/globals) | T-103 | Phase 0 |
| Homepage rebuild (P-03) | T-104 | T-101, T-102, T-103 |
| Product template + 8 pages, new URL structure + 301 map (P-04) | T-105 | T-103, T-101 |
| Certifications page + status board (P-05) | T-106 | T-103 |
| Facility & Quality page (P-06) | T-107 | T-103 |
| About + honest company framing + founder block (P-08 part) | T-108 | T-103 |
| RFQ form + CTA bands + WhatsApp float + contact page (P-07) | T-109 | T-101 |
| Owner inputs: capacity, packaging specs, MOQs, founder bio/photo, cert numbers as available | T-110 | — (parallel, blocks placeholders) |

Exit gate: QA §A–§G on all rebuilt pages; RFQ email received end-to-end; Lighthouse ≥90 home + one product page.

## Phase 2 — Depth & Polish

| Task | ID | Depends on |
|---|---|---|
| Markets pages (Gulf-first, SEA) + /export redirect (P-08 part) | T-201 | T-102 |
| Resources hub + spec-sheet PDF pipeline (P-09) | T-202 | T-105 |
| Product FAQ blocks + FAQPage schema | T-203 | T-105 |
| Full technical SEO pass (P-10) | T-204 | T-105, T-201 |
| Accessibility audit & fix (P-11) | T-205 | Phase 1 |
| Performance pass (P-12) | T-206 | Phase 1 |
| Animation & polish (P-13) | T-207 | T-101 |
| Copy editorial pass site-wide (P-14) | T-208 | Phase 1 |

Exit gate: QA §B–§F site-wide; Rich Results valid; CWV green.

## Phase 3 — Evidence Upgrade (owner-dependent)

| Task | ID | Depends on |
|---|---|---|
| Facility photo/video shoot executed (MASTER_PLAN §8.2 shot list) | T-301 | Owner scheduling |
| Replace all interim/AI imagery with shoot assets | T-302 | T-301 |
| Certification numbers + PDFs published as each cert lands; status board updates | T-303 | Owner/cert bodies |
| Sample COA + documentation checklist PDFs real | T-304 | Kavita QA |
| Product photography set | T-305 | T-301 or separate shoot |
| Pre-launch gate for buyer outreach (QA §I full) | T-306 | T-302..T-305 |

Exit gate: QA §I — site may now be shared with buyers.

## Phase 4 — Growth

| Task | ID | Depends on |
|---|---|---|
| Insights: first 3 cluster posts (SEO_PLAYBOOK §6), unhide section | T-401 | T-306 |
| Arabic locale: real translation + RTL + hreflang (P-18) | T-402 | T-306 |
| Case study / testimonial slots activated when FIRST REAL customer agrees | T-403 | Real customers |
| Country/distributor page expansion per sales traction | T-404 | Sales data |
| Quarterly SEO/CWV review cadence | T-405 | ongoing |

## Sequencing Notes

- Phase 0 is independent of the redesign — ship it on the current codebase immediately.
- T-110 (owner inputs) is the long pole for de-placeholdering; start collection day 1, don't block builds on it.
- Phases 1–2 can be executed by Claude sessions largely in parallel per task-dependency table; Phase 3 is calendar-bound (shoot, cert bodies).
- **Never share the site in outreach before T-306/QA §I.** Pre-launch integrity gate is the whole point.
