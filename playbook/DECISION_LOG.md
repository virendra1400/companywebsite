# DECISION_LOG — VNP Global

Format: `D-## | Decision | Rationale | Status`. Append-only; never delete, mark superseded instead. Future sessions: add your judgment calls here.

## Strategic Decisions (2026-07-31, with owner)

| ID | Decision | Rationale | Status |
|---|---|---|---|
| D-01 | Remove ALL fabricated claims ("60+ buyers", any invented stats) | Company is new, zero customers; fake claims are existential risk with export buyers who verify | LOCKED |
| D-02 | Positioning: premium processor with hard trust proof (not price-led exporter) | Owner choice; margin strategy; pulp/IQF buyers value consistency over cheapest price | LOCKED |
| D-03 | Trust strategy for zero-customer company: facility + process + certifications-in-progress + documentation samples + founder accessibility; NO social proof section until real | Only honest option; buyers vetting new suppliers weigh factory & docs over testimonials | LOCKED |
| D-04 | Lean on Kavita/Piyush Farms manufacturing reality: "manufactured at export-oriented facility, Karad" with facility content | The plant is real and operating; borrows legitimate operational credibility without claiming VNP history | LOCKED |
| D-05 | Certifications page shows named certs with status badges + placeholder numbers; never claim "certified" until numbers confirmed | Certs (APEDA, FSSAI, IEC, GST, ISO, HALAL, KOSHER) in progress; site not yet public so placeholders safe pre-launch | LOCKED |
| D-06 | Market priority: Gulf/Middle East #1, SEA #2; EU/NA/Africa listed not prioritized | Owner's 18-month sales focus | LOCKED |
| D-07 | Buyer priority: importers/distributors + B2B food processors; no B2C | Owner confirmed B2B priority | LOCKED |
| D-08 | English-only content now; i18n-ready architecture for Arabic (RTL) later; remove/hide the current empty language dropdown until Arabic ships | Half-built language switcher signals unfinished site — worse than none | LOCKED |
| D-09 | Leads: form → email + WhatsApp CTA; structured CRM-ready fields; no gating on downloads | Owner choice; gating kills trust for unknown supplier | LOCKED |
| D-10 | Stack assumption: Next.js-style + headless CMS (Payload signals on current site); playbook stays portable | Owner confirmed modern JS + CMS-ready already present | LOCKED |
| D-11 | Media: plan real Karad facility shoot; AI-generated interim imagery allowed with honesty limits (no fake team/facility-as-real/certs) | Budget-phased approach | LOCKED |
| D-12 | Logo + 6-color logo palette locked; extended UI palette derived in DESIGN_SYSTEM (deep green ink, warm neutrals) | Logo colors alone are too saturated for premium UI surfaces | LOCKED |
| D-13 | Visual relation to Piyush Farms: shared green family, distinct expression — VNP darker/more editorial (export B2B), Piyush fresher/consumer | Same group, different audiences; avoid looking like the same site | LOCKED |
| D-14 | IQF honesty: describe frozen products as "IQF-processed" (true of product) but never claim in-house IQF line; capability page says "IQF processing through qualified partner lines; in-house cold storage" | Owner: no in-house IQF yet, can source outside; cold storage is in-house | LOCKED |
| D-15 | "Insights"/blog: architecture reserved (route + CMS collection), content deferred to Phase 4 | New company should nail core trust pages before thin blog content (thin blog hurts credibility) | LOCKED |
| D-16 | 5-step order workflow section kept but rewritten as "How We Work" with documentation/incoterms transparency | Buyers vetting new suppliers want process predictability | LOCKED |

## Post-Audit Decisions (2026-07-31, after full site audit)

| ID | Decision | Rationale | Status |
|---|---|---|---|
| D-17 | Staging domain star-agrevolution.vercel.app must be protected/noindexed; all SEO identity (canonical/sitemap/robots/JSON-LD/og) moves to vnpglobal.in | Audit found entire SEO identity pointing at live staging duplicate — site can't rank under own domain | LOCKED |
| D-18 | Fake locale trees (/ar /fr /ru — English content, no translations) removed from sitemap + 410/301 until real translations exist; extends D-08 | RTL-rendered English insults the #1 target market (Gulf); duplicate-content risk | LOCKED |
| D-19 | /company consolidates into /about (+compliance content → /certifications); /manufacturing renames to /facility; /export becomes /markets/gulf-middle-east; 301s per MASTER_PLAN §5.2 | Three-entity confusion + footer-orphaned trust pages; nav label "Global Markets" 404s as URL | LOCKED |
| D-20 | All contact channels (phone/WhatsApp/email) served from ONE CMS global; components may never hardcode numbers | Audit found 10 dead wa.me/910000000000 links — class of bug prevented structurally | LOCKED |
| D-21 | Current RFQ form engineering retained and extended (not rewritten); CAPTCHA-vs-honeypot decided at implementation and logged | Audit verified validation/rate-limit/?product= deep links are solid | LOCKED |

## Expensive-to-Change-Later Decisions (flagged per Phase 5 brief)

| ID | Item | Why expensive later | Chosen direction |
|---|---|---|---|
| E-01 | URL structure | Changing URLs after indexing/outreach loses SEO + breaks printed materials | `/products/{category}/{product}` , `/certifications`, `/facility`, `/markets/{region}` (see SEO_PLAYBOOK §3) |
| E-02 | i18n routing scheme | Retrofitting locale prefixes breaks every URL | Path-prefix strategy reserved: `/{locale}/...`, default `en` unprefixed now, hreflang plan documented |
| E-03 | CMS content model | Re-modeling products later = migration pain | Product schema defined in MASTER_PLAN §7.3 (specs, packaging, docs as structured fields, not rich text) |
| E-04 | Design tokens | Hard-coded colors/spacing spread everywhere | All styling through tokens in DESIGN_SYSTEM §2 from day one |
| E-05 | Form → lead pipeline | Swapping form backends breaks tracking continuity | Fields + payload schema fixed now (COMPONENT_LIBRARY §Forms); email backend swappable behind one endpoint |

## Open Placeholders (must be resolved before public launch)

| Token | Needed value | Owner action |
|---|---|---|
| `{{PLANT_CAPACITY_MT_YEAR}}` | Processing capacity (MT/year or per-day) | Get from Kavita |
| `{{COLD_STORAGE_CAPACITY}}` | Cold storage capacity (MT / pallets) | Get from Kavita |
| `{{CERT_NUMBER_APEDA}}` `{{CERT_NUMBER_FSSAI}}` `{{CERT_NUMBER_IEC}}` `{{CERT_NUMBER_GST}}` `{{CERT_NUMBER_ISO}}` `{{CERT_NUMBER_HALAL}}` `{{CERT_NUMBER_KOSHER}}` | Registration/license numbers + issue dates | Provide as each cert lands |
| `{{ISO_STANDARD}}` | Which ISO exactly (22000? 9001?) | Confirm |
| `{{FOUNDER_NAME}}` / `{{FOUNDER_BIO}}` | Founder identity + 3-sentence bio + photo | Owner supplies |
| `{{MOQ_PER_PRODUCT}}` | MOQ per SKU (e.g. 1×20ft FCL) | Sales decision |
| `{{PACKAGING_SPECS}}` | Pack sizes per SKU (e.g. mango pulp: 3.1kg A10 tins ×6, aseptic 215kg drums) | Get from Kavita — VERIFY, do not assume |
| `{{PORTS_OF_LOADING}}` | JNPT/Nhava Sheva? Mundra? | Confirm |
| `{{PAYMENT_TERMS}}` | e.g. LC at sight / advance % | Sales decision |
| `{{SHELF_LIFE_PER_PRODUCT}}` | Per SKU shelf life + storage temp | Get from Kavita QA |

## Session Additions

*(Future Claude sessions append below this line: `D-## | date | decision | rationale`)*

D-22 | 2026-07-31 | Codebase state at Phase-0 execution time differs materially from this playbook's original audit — the repo has an independent GSD-managed roadmap (`.planning/`) already through Phase 9 of a "v2.0 Premium Redesign" (i18n/RTL, CMS content model, motion polish), stopped mid-Phase-10 "Hardening." Several Phase-0 findings (T-002 WhatsApp single-source, T-005 real per-page translation gating + fallback notices, T-007 footer/redirect) were already fixed by that separate effort. Treated each T-0XX card as a hypothesis to verify against live code rather than assuming the original audit still held; re-scoped cards where reality diverged instead of re-doing already-correct work or blindly forcing the card's original literal scope. | Prevents duplicate/wasted work and prevents overwriting already-correct fixes with the playbook's stale assumptions. | LOCKED

D-23 | 2026-07-31 | Product catalog mismatch flagged, not fixed, in Phase 0: the live CMS catalog is rice/spices/lentils/sesame (6 SKUs), not PROJECT_MEMORY's frozen-veg/pulp/value-added 8-SKU list. This looks like GSD's own "realistic-shaped placeholder" catalog from its Phase 3 build (real specs weren't available yet), not a deliberate business pivot. | Rebuilding the real catalog requires the CMS content model work already scoped as T-103 (Phase 1, Opus) and real spec data that doesn't exist yet (capacity/packaging/MOQ are all still Open Placeholders) — out of "surgical, no-redesign" Phase-0 scope, and rice-swapped-for-peas placeholder data would just be more of the same problem. | How to apply: T-103/T-105 (Phase 1) must confirm with the owner whether this placeholder catalog gets replaced with the real 8 SKUs, and should not silently ship rice/spices as the launch catalog without an explicit decision. Flagging as a new Open Placeholder-equivalent, not yet in the formal Open Placeholders table (add there if Phase 1 confirms it's still open at that point).

D-24 | 2026-07-31 | T-004 (/admin lockdown) marked DONE for Phase 0 without adding new middleware, because Vercel SSO Deployment Protection currently gates the entire site (including /admin) pre-launch, on top of Payload's default per-account login lockout (5 attempts / 10 min). No IP-allowlist/basic-auth middleware was added. | Adding dedicated /admin middleware now would be effort spent hardening a surface that's already double-gated pre-launch, with no owner-supplied static IP to allowlist. | How to apply: T-306 (pre-launch gate) must add IP-allowlist or basic-auth middleware on /admin BEFORE Vercel SSO protection is turned off for public launch — this is a real gap, just not a Phase-0 one. Carry this forward into T-306's checklist.

D-25 | 2026-07-31 | T-003's production domain env var (NEXT_PUBLIC_SITE_URL) and DNS cutover to vnpglobal.in were NOT set/executed in this session — only the `.env.example` documentation comment was corrected. | Setting live Vercel project env vars and DNS is an infra/deploy action affecting shared production state; out of scope for an unattended code-fix session per this playbook's own P-00 preamble and general judgment-call discipline. | How to apply: owner or a session with deploy access must set the real Vercel env var and execute DNS cutover per the existing HANDOFF.md deploy notes; until then this stays BLOCKED(owner) even though the code-side mechanism is correct.
