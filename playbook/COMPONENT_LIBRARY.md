# COMPONENT_LIBRARY — VNP Global

Component specs. All tokens reference DESIGN_SYSTEM.md. Implementation sessions: build these as reusable components; do not invent variants.

## Layout Components

### C-01 Header
- Sticky, `--cream-50` bg, 1px bottom border `--neutral-300`; shrinks 72→60px after 80px scroll.
- Left: logo (link home). Center/left nav: Products (mega-menu), Facility & Quality, Certifications, Resources, About. Right: secondary link "Download Catalog" (icon+text) + primary button "Request a Quote".
- Mobile (≤1024): logo + "Quote" button + hamburger → full-screen overlay (focus-trapped, Esc closes) with full product tree, contact block (phone/WhatsApp/email) at bottom.
- Remove the current empty language dropdown (D-08). Reserve a slot for future EN/AR switch.

### C-02 Mega-menu (Products)
- Two columns by processing method: "IQF Frozen Vegetables" (Green Peas, Sweet Corn, Mixed Vegetables, Baby Corn) · "Aseptic Fruit Pulps" (Mango, Guava, Strawberry) · "Value-Added" (Ginger-Garlic Paste). Third column: buyer-type links ("For Importers & Distributors", "For Food Processors") + "Download Product Catalog (PDF)".
- Keyboard: arrow-key navigation, closes on Esc/blur.

### C-03 Footer
- `--green-950` bg, `--cream-50` text. Four columns: (1) logo + one-line positioning + social; (2) Products links; (3) Company (About, Facility, Certifications, Resources, Contact); (4) Contact block — registered office, factory address, phone, WhatsApp, email.
- **Legal identity strip** (trust pattern #9): CIN `{{CIN}}`, GST `{{CERT_NUMBER_GST}}`, IEC `{{CERT_NUMBER_IEC}}`, FSSAI `{{CERT_NUMBER_FSSAI}}` — small text, one line. Copyright + privacy link.

## Hero & Section Components

### C-04 Homepage Hero
- Full-width, min-h 80vh desktop; background: real/interim facility-produce photograph with `--green-950` gradient scrim left→transparent; text left-aligned on scrim.
- H1 (Fraunces, --text-5xl) + subhead (--text-lg, max 60ch) + CTA pair (primary gold "Request a Quote", secondary outline "View Products"). No carousel, no autoplay.

### C-05 Proof Strip (under hero)
- Horizontal band, white bg, 4 stat/badge cells: e.g. "APEDA & FSSAI registered*", "IQF & aseptic processing", "In-house cold storage {{COLD_STORAGE_CAPACITY}}", "Manufactured at Tasawade MIDC, Karad". Asterisk → cert status note. **Never customer counts/logos until real (D-01/D-03).**

### C-06 Section Shell
- Standard rhythm: eyebrow label (Archivo 600, --text-sm, `--green-700`, uppercase tracking 0.08em) → H2 (Fraunces) → lead paragraph (max 68ch) → content. Alternate `--cream-50` / white / one `--green-950` dark band per page max.

### C-07 Certification Status Board
- Grid of cert cards: cert logo/wordmark, name, issuing body, status badge (`Registered` solid `--green-100`/`--green-700` · `In certification` outline gold · target date), cert number `{{CERT_NUMBER_*}}` when available, "View certificate (PDF)" link once real.
- This is THE differentiator component — honest status board (COMPETITOR_INSIGHTS §4.1). Never render "Certified" state without a number.

### C-08 Process Timeline ("Farm to Port")
- Horizontal (vertical mobile) 6-step schematic: Sourcing → Intake & grading → Processing (IQF*/aseptic) → QC & lab → Cold chain −18°C → Export documentation & port. Thin-line icons, `--green-700` on `--green-50`. Footnote *: IQF via qualified partner lines (D-14).

### C-09 Facility Section
- Split layout: media (photo grid or muted video) + fact list (location, cold storage `{{COLD_STORAGE_CAPACITY}}`, capacity `{{PLANT_CAPACITY_MT_YEAR}}`, QA lab, audit-openness statement). CTA: "Book a virtual plant tour".

### C-10 Market Coverage
- Restrained world-region list (Gulf & Middle East first, Southeast Asia second, then others) — text-first with small map graphic. NO fake "countries served" counters; phrase as "Markets we serve / are building into".

## Product Components

### C-11 Product Card
- White card, `--radius-md`, product photo (consistent style, correct product!), category tag, name (Archivo 600), one-line application ("for beverage & dairy processing"), text link "View specifications →".

### C-12 Product Detail Page (template)
Order: breadcrumb → H1 + category → gallery (pack + macro) → summary paragraph → **Spec Table (C-13)** → **Packaging Table (C-14)** → **Container Loading (C-15)** → shelf life + storage → MOQ range `{{MOQ_PER_PRODUCT}}` → downloads (spec sheet PDF, ungated) → applications (chips) → **Inquiry CTA band (C-17)**. Sticky mobile bottom bar: WhatsApp | Request Quote.

### C-13 Spec Table (4-block, the A-1 pattern in premium clothes)
- Blocks: Physico-chemical (Brix, pH, acidity…) · Organoleptic (color, flavor, texture) · Microbiological (TPC, yeast/mold, coliform, salmonella) · Contaminants (heavy metals, pesticide residues statement).
- Desktop: 2-col label/value tables per block, tabular-nums, zebra `--neutral-100`. Mobile: stacked key-value cards. Values from CMS structured fields — **placeholder rows render as "{{value}} — under QA documentation" until real; never invent numbers.**

### C-14 Packaging Options Table
- Rows per pack format: format (e.g. aseptic bag-in-drum 215 kg / A10 tins / 10 kg bulk carton), net weight, units per carton, cartons per pallet. All values `{{PACKAGING_SPECS}}` until Kavita confirms.

### C-15 Container Loading Card
- "One 20 ft FCL ≈ N units ≈ X MT net" + pallet note. Gulf buyers screenshot this — make it visually shareable (bordered card with logo watermark).

### C-16 Downloads / Resources List
- Row per document: icon, title, type+size, ungated download. Documents: per-product spec sheet, company profile, sample COA, export documentation checklist, certificate PDFs (as they land).

## Conversion Components

### C-17 Inquiry CTA Band
- `--green-950` band: H3 "Get a quote within 24 hours", subline (spec sheet + indicative FOB within 48h — the SLA), primary gold button → /contact form (product pre-selected via query param), secondary WhatsApp deep link `https://wa.me/<SiteSettings.contact.whatsapp>?text=...` (never hardcode the number, see D-60) (pre-filled product name).

### C-18 RFQ Form (the ONE form, site-wide)
Fields (CRM-ready payload schema — LOCKED per E-05):
```
name*            text
company*         text
email*           email
phone_whatsapp*  tel (intl format hint)
country*         select (Gulf countries first, then A–Z)
buyer_type       select: Importer/Distributor | Food Processor | Retail | Other
products*        multi-select (8 SKUs + "Other")
quantity         text ("e.g. 1×20ft FCL / 5 MT")
incoterm         select: FOB | CIF | CFR | EXW | Not sure
timeline         select: Immediate | 1–3 months | Exploring
message          textarea
```
- Validation inline, labels visible, errors text+icon (a11y §8). Submit → email to info@vnpglobal.in (structured subject: `[RFQ] {products} — {company}, {country}`) + success state with WhatsApp fallback + promised SLA restated. Honeypot + time-trap antispam (no CAPTCHA friction).
- Variants: "Request sample" and "Book virtual plant tour" reuse same form with `intent` field — never build separate forms (anti-pattern #2).

### C-19 WhatsApp Float
- 56px, bottom-right, `--green-700`, aria-label "Chat on WhatsApp"; hidden when C-18 in viewport; deep link with page-context prefill.

### C-20 Founder / People Block
- Photo + name `{{FOUNDER_NAME}}` + role + 3-sentence bio + LinkedIn. Real photos only — AI faces forbidden (PROJECT_MEMORY §9).

## States & Misc

- **Empty/placeholder state:** any component with unresolved `{{TOKEN}}` renders a subtle "documentation in progress" treatment internally — build flag `SHOW_PLACEHOLDERS` to audit before launch.
- 404: search + product links + contact. Loading: skeleton cards (no spinners on content).
- Badges/status: solid tint = confirmed fact; outline = in progress. Applies to certs, capabilities.
