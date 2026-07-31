# PROMPT_LIBRARY — VNP Global

Copy-paste prompts for Claude Sonnet/Opus sessions running inside the development repository. Every prompt assumes the playbook folder is available to the session (copy it into the repo as `/playbook/` or attach the files).

## P-00 Session Preamble (prepend to EVERY prompt below)

```
You are implementing part of the VNP Global website transformation.
Before doing anything, read these files fully:
- playbook/PROJECT_MEMORY.md  (facts & honesty constraints — these override everything)
- playbook/DESIGN_SYSTEM.md   (tokens & rules)
- playbook/CONTENT_PLAYBOOK.md (voice, copy rules, CTA strings)
Relevant extras for this task are named in the task prompt.
Hard rules:
1. Never invent facts, numbers, customers, or certification statuses. Unknown facts use {{TOKEN}} placeholders from DECISION_LOG.md; register any new token you introduce there.
2. Use only DESIGN_SYSTEM tokens for styling.
3. Match the existing repo's framework, file conventions, and component patterns — inspect the codebase first.
4. When done, run the relevant sections of playbook/QA_CHECKLIST.md and report results honestly.
5. Log any judgment call you made in playbook/DECISION_LOG.md §Session Additions.
```

## P-01 Design Tokens & Global Styles — *Sonnet, Small*
```
Task: Implement the DESIGN_SYSTEM.md tokens as the project's styling foundation.
- Create/replace the token layer (CSS custom properties or the repo's tailwind config equivalent): all colors (§2), type scale + font loading for Fraunces & Archivo variable fonts (§3, self-host or next/font, font-display swap), spacing/radius/shadow (§4), motion durations (§6).
- Wire base styles: page bg --cream-50, text --neutral-950, focus outline spec (§7), reduced-motion media query (§6), CSS logical properties convention (§8).
- Delete/deprecate any old ad-hoc color constants; migrate usages.
Acceptance: QA_CHECKLIST §B passes on a sample page; no hardcoded hex outside the token file.
```

## P-02 Header, Footer, Navigation — *Sonnet, Medium*
```
Task: Build C-01 Header, C-02 Products mega-menu, C-03 Footer per COMPONENT_LIBRARY.md.
- Sticky shrink behavior, mobile full-screen overlay w/ focus trap + Esc, keyboard-navigable mega-menu.
- REMOVE the existing empty language dropdown (decision D-08).
- Footer: 4 columns + legal identity strip with {{CIN}}/{{CERT_NUMBER_GST}}/{{CERT_NUMBER_IEC}}/{{CERT_NUMBER_FSSAI}} tokens.
Acceptance: QA §B, §C (keyboard walkthrough), §F. Nav reachable ≤2 clicks to any product.
```

## P-03 Homepage — *Opus, Large*
```
Task: Rebuild the homepage per CONTENT_PLAYBOOK.md §4 Home (section order 1–9) using COMPONENT_LIBRARY components C-04..C-10, C-17.
- Copy: use the approved hero options and section directions verbatim where given; write connective copy per voice rules §1–3.
- CRITICAL: remove "Trusted by 60+ international buyers" and every fabricated stat (QA §A greps must pass).
- Proof strip uses registrations + facility facts only. Certification board uses status badges + tokens.
- SEO: home title/meta/OG + Organization & WebSite JSON-LD per SEO_PLAYBOOK §3–4.
Acceptance: QA §A–§F full pass; Lighthouse mobile ≥90.
```

## P-04 Product Detail Template + 8 Product Pages — *Opus, Large*
```
Task: Build the product detail template (C-12) and instantiate all 8 products with CMS-backed structured content.
- Content model: create/extend the CMS collection per MASTER_PLAN §7.3 (specs as structured fields, packaging rows, container-loading, FAQ, downloads) — NOT rich-text blobs.
- Components: C-11 cards on /products, C-13 4-block spec table (mobile card collapse), C-14 packaging, C-15 container card, C-16 downloads, C-17 CTA band, sticky mobile bar.
- Spec values: use real data only where PROJECT_MEMORY/owner supplies; otherwise render the documented placeholder treatment. NEVER invent Brix/micro values.
- Per-page SEO: metadata templates, Product+BreadcrumbList+FAQPage JSON-LD (no ratings/offers).
Acceptance: QA §A–§G on one frozen-veg page and one pulp page; URL structure matches SEO_PLAYBOOK §2 exactly.
```

## P-05 Certifications Page + Status Board — *Sonnet, Medium*
```
Task: Build /certifications with C-07 Certification Status Board and per-shipment documentation section per CONTENT_PLAYBOOK §4.
- Certs: APEDA, FSSAI, IEC, GST, ISO {{ISO_STANDARD}}, HALAL, KOSHER — all "In certification"/"Registered" per current DECISION_LOG state, numbers as tokens.
- Include sample-COA download slot (placeholder file OK, labeled clearly) and audit-openness statement.
Acceptance: QA §A (no cert rendered as held w/o number), §B–§D.
```

## P-06 Facility & Quality Page — *Sonnet, Medium*
```
Task: Build /facility per CONTENT_PLAYBOOK §4: plant overview (capacity tokens), capabilities (aseptic; IQF wording EXACTLY per D-14), QA/lab, traceability diagram (C-08 variant), audit openness, virtual tour CTA (reuses C-18 form with intent=tour).
Acceptance: QA §A (D-14 wording), §B–§F.
```

## P-07 RFQ Form & Conversion Flow — *Opus, Medium*
```
Task: Implement C-18 RFQ form (exact field schema — do not alter), C-17 CTA bands, C-19 WhatsApp float, /contact page.
- Submit pipeline: validate → email to info@vnpglobal.in with structured subject → success state w/ SLA + WhatsApp fallback. Honeypot + time-trap. Product/intent pre-selection via query params from all CTA bands.
- Analytics events per SEO_PLAYBOOK §9.
Acceptance: QA §G end-to-end incl. real email receipt test; §C form a11y.
```

## P-08 About + Global Markets Pages — *Sonnet, Medium*
```
Task: Build /about and /markets/* per CONTENT_PLAYBOOK §4.
- About: honest new-company framing (verbatim direction given), founder block with {{FOUNDER_NAME}} tokens, group/facility relationship wording per PROJECT_MEMORY §1.
- Markets: Gulf-first page with logistics/Halal/Arabic-labeling capability content; SEA second; no fake coverage maps.
Acceptance: QA §A–§D.
```

## P-09 Resources Hub + PDF Pipeline — *Sonnet, Medium*
```
Task: Build /resources (C-16) and the spec-sheet PDF generation approach.
- Prefer generating branded PDF spec sheets from the same CMS product data (single source of truth); if repo lacks PDF tooling, create print-styled pages + document the manual export step.
- All downloads ungated; spec_download analytics event.
Acceptance: QA §D; every product has a working download slot (placeholder-labeled if data pending).
```

## P-10 SEO Technical Pass — *Sonnet, Medium*
```
Task: Site-wide technical SEO per SEO_PLAYBOOK §3–5,7.
- Metadata templates wired to CMS; canonicals; sitemap.xml + robots.txt; 301 map from old URLs (list in TASK_BACKLOG T-303); JSON-LD components; image filename/alt audit; internal-linking rules.
Acceptance: QA §D full; Rich Results test passes on home + 2 product pages.
```

## P-11 Accessibility Audit & Fix — *Sonnet, Medium*
```
Task: Run a full a11y pass: axe scan on all templates, keyboard walkthrough, contrast verification, reduced-motion, zoom/320px. Fix everything found; document any exceptions.
Acceptance: QA §C zero critical/serious; walkthrough notes attached.
```

## P-12 Performance Pass — *Sonnet, Medium*
```
Task: Hit the CWV budget (SEO_PLAYBOOK §5): image pipeline (AVIF/WebP, srcset, preload hero), font subsetting/fallback tuning, JS audit (remove unused deps), cache headers.
Acceptance: QA §E — Lighthouse mobile ≥90 on home + product template, screenshots of reports.
```

## P-13 Animation & Polish — *Sonnet, Small*
```
Task: Implement DESIGN_SYSTEM §6 motion: section entry fade-rise (once, ≤300ms), hover micro-transitions, reduced-motion fallbacks. Remove any legacy carousels/parallax.
Acceptance: QA §B motion rules; §C reduced-motion.
```

## P-14 Copywriting Review — *Opus, Medium*
```
Task: Editorial pass over ALL site copy against CONTENT_PLAYBOOK (voice, banned words, headline formulas, CTA strings, honesty rules) and PROJECT_MEMORY §7.
- Output: per-page diff proposals, then apply approved changes. Grep-verify banned words and fabricated-claim patterns.
Acceptance: QA §A full pass site-wide.
```

## P-15 Code Review — *Opus, Medium*
```
Task: Review the diff/branch for: honesty violations in rendered output, token bypasses (hardcoded styles), a11y regressions, form schema drift (E-05), URL changes (E-01), performance regressions (new deps, unoptimized images).
Report every finding with file:line, severity, and fix. Do not filter low-severity out.
```

## P-16 QA / Pre-Launch Review — *Opus, Large*
```
Task: Execute playbook/QA_CHECKLIST.md section I (Pre-Launch Gate) plus a full pass of §A–§H on every page. Produce a launch-blocker list vs nice-to-fix list. Verify every Open Placeholder in DECISION_LOG is resolved or its section hidden.
```

## P-17 AI Interim Imagery Specs — *Sonnet, Small*
```
Task: Generate image-generation prompts (for the owner's image tool) per DESIGN_SYSTEM §5 interim rules — produce macro shots (frost-dusted green peas; poured mango pulp; sweet corn kernels), texture bands, and abstract farm-landscape hero — warm daylight grade, cream/gold cast, editorial-industrial feel. FORBIDDEN subjects: facility exteriors presented as the real plant, people as staff, certificates/documents.
Output: one prompt per required slot with target dimensions and filename per SEO image conventions.
```

## P-18 Arabic/RTL Enablement (future) — *Opus, Large*
```
Task: Implement /ar locale: i18n routing (E-02), RTL layout via logical properties, IBM Plex Sans Arabic font addition, translated content ingestion from CMS, hreflang per SEO_PLAYBOOK §5, language switcher (finally re-adding it — D-08).
Acceptance: QA §H upgraded to full RTL pass; hreflang validates.
```

## P-19 Phase-0 Hotfixes (current codebase, NO redesign) — *Sonnet, Medium*
```
Task: Execute TASK_BACKLOG Phase 0 cards T-001..T-008 on the EXISTING codebase. Do not restyle or restructure anything — surgical fixes only.
- T-001: remove fabricated claims (hero "Trusted by 60+…" CMS block, "16+" markets stat, "trusted" meta wording).
- T-002: replace all wa.me/910000000000 links via a single contactChannels source consumed by CTA bands (root cause, not per-page patches).
- T-003: point ALL SEO identity (canonical, sitemap, robots, Organization JSON-LD url, og:image) at https://vnpglobal.in; noindex/protect the star-agrevolution.vercel.app staging deployment.
- T-004: verify/harden /admin access (auth, rate limit, IP restriction or middleware gate) — defensive hardening of owner's own site.
- T-005: de-list /ar /fr /ru (sitemap removal, 410 or 301, remove switcher UI; keep i18n plumbing).
- T-006: correct the 4 mismatched product images (wheat≠peas, apple≠corn, spices≠baby corn, corn field≠paste) with properly matched images + fixed filenames/alt.
- T-007: drop /insights footer link; 301 /global-markets → /export.
- T-008: soften unverifiable claims per TASK_BACKLOG card wording.
Acceptance: each card's acceptance line + QA_CHECKLIST §A passes on the live build; greps for "60+", "Trusted by", "910000000000", "star-agrevolution" over rendered output return zero.
```

## Model/Sizing Guide

| Prompt | Model | Context size | Why |
|---|---|---|---|
| P-01, P-13, P-17 | Sonnet | Small | Mechanical, well-specified |
| P-02, P-05, P-06, P-08, P-09, P-10, P-11, P-12 | Sonnet | Medium | Bounded scope, clear acceptance |
| P-03, P-04, P-07, P-14, P-15, P-16, P-18 | Opus | Medium–Large | Cross-cutting judgment, copy quality, review depth |
