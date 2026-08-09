# PROJECT_MEMORY — VNP Global Website Transformation

> **Read this file first in every session.** It is the single source of truth for business facts, constraints, and non-negotiables. If any other document conflicts with this one, this one wins. Never invent facts not listed here — ask the owner or use the placeholder convention below.

## 1. Company Facts (verified with owner, 2026-07; founders + exact address confirmed 2026-08-09, see DECISION_LOG D-61)

| Fact | Value |
|---|---|
| Legal name | VNP Global Private Limited |
| Type | **New company** — incorporated recently, **zero customers yet**, no shipment track record |
| Business | Export of processed agricultural products from India |
| Founders | Virendra Patil (strategy, buyer relationships, compliance/documentation) · Piyush Chavan (runs Piyush Farms/Kavita, production/QC/sourcing/cold storage/traceability/packaging) · Nilesh Kalbhor (farmer relationships/contract farming, harvest planning, export freight) |
| Registered office | SR. No. 45/2A, CTS No. 4224, Millenia Tower, Haveli, Chinchwad East, Pune City, Pune 411019, Maharashtra, India (per Registrar of Companies record — corrects this doc's earlier "411035," which was wrong) |
| Manufacturing | Contracted to **Kavita Facility Management Pvt Ltd (Agro Division)**, Tasawade MIDC, Karad, Dist. Satara, Maharashtra 415109 |
| Relationship | VNP Global is an **independent company** using Kavita as processor (not a trading arm of Kavita) |
| Sister brand | **Piyush Farms** (piyushfarms.com) — Kavita's consumer/manufacturing brand, founded 2024, same Karad plant |
| Contact | info@vnpglobal.in · +91 84088 07241 · WhatsApp · LinkedIn · Instagram — confirmed live in prod 2026-08-09 (was showing a fake `sales@example.com`/all-zeros placeholder in SiteSettings/Contact page until that fix, this doc had the real values all along) |

## 2. Products (current catalog — 8 SKUs, moderate expansion planned)

| Category | Products | Process |
|---|---|---|
| Frozen Vegetables | Green Peas, Sweet Corn, Mixed Vegetables | IQF (**sourced externally** — no in-house IQF line yet; cold storage IS in-house) |
| Fruit Pulp & Purees | Mango, Guava, Strawberry | Aseptic processing |
| Value-Added | Baby Corn (frozen), Ginger-Garlic Paste | Processing + shelf-stable |

- Capacity: **UNKNOWN — use placeholder** `{{PLANT_CAPACITY_MT_YEAR}}` until owner supplies.
- Piyush Farms catalog is wider (okra, sapota, custard-apple pulp, corn cobs, organic fresh) — future VNP expansion candidates.

## 3. Certifications (status as of 2026-08-09, see DECISION_LOG D-61)

APEDA, IEC, GST, and CIN are **confirmed registered** by the owner (numbers pending, `{{CERT_NUMBER_*}}` placeholders in place on the Company page + SiteSettings.legalIdentity, Certifications collection status board flipped to "Registered" for APEDA/IEC). FSSAI, ISO (22000 assumed — confirm number), HALAL, and KOSHER are still genuinely IN PROGRESS, not yet real.
Every certification block must use the pattern: name + status badge ("In certification" / "Registered") + `{{CERT_NUMBER_*}}` placeholder — swap to real numbers before launch/outreach. **Never render a certification as "held" until the owner confirms the number**; a status of "Registered" without the number is fine once the owner has confirmed the registration itself is real (as with APEDA/IEC/GST/CIN above), that's different from claiming a number that doesn't exist.

## 4. Target Market & Buyers (priority order)

1. **Gulf / Middle East** importers & distributors (#1 — 18-month focus)
2. **Southeast Asia** (#2)
3. EU / North America / Africa — listed, not prioritized
- Buyer types: **importers/distributors + B2B food processors** (pulp buyers for beverage/dairy/food processing). B2B is the priority; no B2C.
- Languages: **English now**; Arabic (RTL) planned — site has a language-selector stub with an empty dropdown; architecture must be i18n-ready.

## 5. Website Objective

- **Credibility-first + RFQ capture.** The site's main job: when a buyer receives outbound contact from VNP and checks the website, the site must make them comfortable enough to reply and request a quote.
- Lead handling: **form → email (info@vnpglobal.in) + WhatsApp deep link.** No CRM yet; form fields must be CRM-ready (structured, exportable).
- Downloadables: **yes, open (ungated)** — product spec sheet PDFs + company profile PDF.

## 6. Brand

### 6.1 Logo palette (LOCKED — from owner)

| Element | Name | Hex | Usage |
|---|---|---|---|
| Primary Green | Forest Green | `#165C2A` | Right leaf, "VNP" text |
| Secondary Green | Fresh Green | `#86B72F` | Left leaf, fields, "GLOBAL" text |
| Accent Gold | Harvest Gold | `#F4B321` | Sun |
| Light Gold | Sunrise Gold | `#FFD166` | Sun highlight/gradient |
| White | Pure White | `#FFFFFF` | Negative space |
| Charcoal (optional) | Deep Charcoal | `#2B2B2B` | Monochrome version |

Logo stays as-is. Everything else (extended palette, typography, imagery) is defined in DESIGN_SYSTEM.md.

### 6.2 Positioning (LOCKED)

**"Premium processor" lean with hard trust proof.** Not "cheap reliable Indian exporter." Quality/process/compliance story over price story. But: every premium claim must be backed by something showable (process step, facility photo, certification status, spec sheet) — no adjectives without evidence.

## 7. Honesty Constraints (CRITICAL — the #1 rule)

The current site contains **AI-generated fake claims**. Confirmed fake: **"Trusted by 60+ international buyers"** — VNP has zero customers. Rules for all future content:

1. **No fabricated numbers** — buyer counts, shipment counts, countries served, years of experience.
2. **No fake testimonials, logos, or case studies.** Ever.
3. Trust is built from what is REAL: facility (via Kavita/Piyush Farms), process transparency, certification progress, founder story, product specs, documentation samples, responsiveness promises.
4. Manufacturing legacy framing is allowed and encouraged: "Products manufactured at an export-oriented facility in Karad, Maharashtra" — the plant and its practices are real even though VNP is new.
5. Anything unverified goes in as a `{{PLACEHOLDER_NAME}}` token, tracked in DECISION_LOG.md open items.

## 8. Technology (assumptions the playbook is built on)

- Real repo lives on **another machine** — all guidance must be portable, no repo-specific references.
- Current site framework: custom/headless — media served from `/api/media/file/...` (strong Payload CMS signal). Owner confirms: **modern JS framework (Next.js-style), static-first, headless-CMS-ready; CMS-ready structure already present.**
- Assume: Next.js + Payload-style CMS, deployable static/SSR. All implementation prompts written framework-agnostic with Next.js as the reference dialect.
- i18n: design URL structure and components for future `/ar` (RTL) without implementing translation now.

## 9. Media

- Plan a **real photo/video shoot** at the Karad facility (shot list in MASTER_PLAN §Media). Interim: AI-generated imagery allowed, specified via prompts in PROMPT_LIBRARY.md — but AI images must never depict fake certifications, fake people as "our team", or fake facility exteriors presented as the real plant.
- Current product images are partly mismatched stock (peas card shows wheat, baby corn shows spices) — replace all.

## 10. File Map (this playbook)

| File | Purpose |
|---|---|
| PROJECT_MEMORY.md | THIS FILE — facts & constraints, read first |
| MASTER_PLAN.md | Strategy: positioning, personas, IA, audit summary, media plan |
| DECISION_LOG.md | Every strategic decision + open items/placeholders |
| COMPETITOR_INSIGHTS.md | Competitor teardowns + pattern library |
| DESIGN_SYSTEM.md | Tokens: color, type, spacing, motion, a11y rules |
| COMPONENT_LIBRARY.md | Component-by-component specs |
| CONTENT_PLAYBOOK.md | Voice, messaging, page-by-page copy direction |
| SEO_PLAYBOOK.md | Keywords, metadata, schema, technical SEO |
| IMPLEMENTATION_ROADMAP.md | Phases 1–4, dependencies |
| TASK_BACKLOG.md | Task cards: objective, priority, acceptance criteria, model |
| PROMPT_LIBRARY.md | Copy-paste prompts for Claude Sonnet/Opus execution |
| QA_CHECKLIST.md | Validation before any task is marked done |

## 11. Session Protocol for Future Claude Instances

1. Read PROJECT_MEMORY.md (this file) fully.
2. Read the task card in TASK_BACKLOG.md you were asked to execute.
3. Pull the matching prompt from PROMPT_LIBRARY.md + relevant sections of DESIGN_SYSTEM / CONTENT_PLAYBOOK / SEO_PLAYBOOK.
4. Execute. Validate against QA_CHECKLIST.md.
5. If you made a judgment call, append it to DECISION_LOG.md. If you introduced a placeholder, register it in DECISION_LOG §Open Placeholders.
