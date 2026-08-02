// Single source of truth for the local-dev + prod-bootstrap English Pages
// seed content, shared by scripts/seed-pages.ts and the e2e fallback-notice
// assertion so the two never drift out of sync. Realistic-shaped placeholder
// copy per D-03 — no lorem ipsum, no fabricated certificate/registration
// numbers or named clients (Pitfall 5). The `wa.me` numbers below are an
// obvious all-zeros placeholder pending the real business WhatsApp number.
const WHATSAPP_PLACEHOLDER_LINK = "https://wa.me/910000000000";
const REQUEST_QUOTE_CTA = { label: "Request a Quote", href: "/contact" };
const WHATSAPP_CTA = { label: "Chat on WhatsApp", href: WHATSAPP_PLACEHOLDER_LINK };

const homeHero = {
  blockType: "hero" as const,
  variant: "full" as const,
  // T-208/CONTENT_PLAYBOOK §1: "premium" is a banned bare adjective — was
  // "Premium Agricultural Exports...". Pulls the honest quality-positioning
  // language already in the subhead ("export-ready processing") instead.
  headline: "Export-Ready Agricultural Products, Direct From India",
  subhead:
    "Direct sourcing from Indian growers, careful quality control, and export-ready processing, built to serve importers across the Gulf, Europe, and beyond.",
  primaryCta: REQUEST_QUOTE_CTA,
  secondaryCta: WHATSAPP_CTA,
};

function compactHero(headline: string, subhead: string) {
  return { blockType: "hero" as const, variant: "compact" as const, headline, subhead };
}

function ctaBand(heading: string) {
  return {
    blockType: "ctaBand" as const,
    heading,
    primaryCta: REQUEST_QUOTE_CTA,
    secondaryCta: WHATSAPP_CTA,
  };
}

// TRUST-01/02: no cert data lives on the block — it queries the
// Certifications collection at render time (see CertStripBlock.tsx).
function certStrip(variant: "strip" | "grid", sectionTitle?: string, intro?: string) {
  return { blockType: "certStrip" as const, variant, sectionTitle, intro };
}

type FeatureGridItem = { icon?: string; title: string; body: string };

// UI-SPEC §3 — one block, `variant` flag drives icon (value props) vs.
// photo (leadership bios). Photo items get their `photo` Media relation
// attached later by scripts/seed-pages.ts (leadership avatars don't exist
// as Media docs until the seed script uploads them).
function featureGrid(variant: "icon" | "photo", items: FeatureGridItem[], sectionTitle?: string) {
  return { blockType: "featureGrid" as const, variant, sectionTitle, items };
}

function statsBand(stats: { value: string; label: string }[], sectionTitle?: string) {
  return { blockType: "statsBand" as const, sectionTitle, stats };
}

// UI-SPEC §2a — generic editor-authored logo/label row, no Certifications-
// collection binding (that's CertStrip's job, not this block's — see
// CONTEXT.md D-03). Seed items below are logo-less region/segment
// descriptors, never fabricated named clients (Pitfall 5).
function trustBar(sectionTitle: string, items: { name: string }[]) {
  return { blockType: "trustBar" as const, sectionTitle, items };
}

// UI-SPEC §2b — ordered inquiry-to-delivery steps, rendered as a semantic
// <ol> with literal "01"-"05" badge strings (never Intl.NumberFormat).
function exportProcess(sectionTitle: string, steps: { title: string; body: string }[]) {
  return { blockType: "exportProcess" as const, sectionTitle, steps };
}

// UI-SPEC §2c — placeholder testimonials pending real client quotes. Per
// Pitfall 5: role + generic buyer-category + real served country, never a
// fabricated-but-real-sounding named-client endorsement.
function testimonials(
  sectionTitle: string,
  items: { quote: string; name: string; company?: string; country?: string }[],
) {
  return { blockType: "testimonials" as const, sectionTitle, items };
}

// 08-UI-SPEC Contract §6 — seeded answers restate only process facts already
// published elsewhere on the site (response time, documentation, samples);
// no certifications, volumes, prices, lead times or client names invented
// (Pitfall 5).
function faq(sectionTitle: string, items: { question: string; answer: string }[]) {
  return { blockType: "faq" as const, sectionTitle, items };
}

// TRUST-04 — realistic served-country set (GCC + Europe + a few others),
// every code present in src/lib/country-names.ts and drawn as a tile in
// src/lib/world-map-svg.ts. D-06: static SVG, no map library.
const SERVED_COUNTRY_CODES = [
  "AE",
  "SA",
  "QA",
  "KW",
  "BH",
  "OM",
  "DE",
  "FR",
  "GB",
  "NL",
  "IT",
  "ES",
  "US",
  "EG",
  "ZA",
  "SG",
];

function exportMap(
  variant: "compact" | "full",
  stats: { value: string; label: string }[],
  sectionTitle?: string,
) {
  return {
    blockType: "exportMap" as const,
    sectionTitle,
    variant,
    highlightedCountryCodes: SERVED_COUNTRY_CODES,
    stats,
  };
}

type MediaGalleryItem = { caption: string };

// UI-SPEC §6 MediaGallery's `image` field is `required: true` (an editor
// can't save a gallery item with no photo) — so unlike FeatureGrid's
// optional `photo`, the seed array's items need a concrete `image` id at the
// TYPE level too. `0` is a placeholder id (never a real Media id, which
// Payload always assigns >= 1) that scripts/seed-pages.ts's
// injectFacilityPhotos() ALWAYS overwrites with a real uploaded Media id,
// keyed by `caption`, before any `payload.create()` call runs.
function mediaGallery(items: MediaGalleryItem[], sectionTitle?: string) {
  return {
    blockType: "mediaGallery" as const,
    sectionTitle,
    items: items.map((item) => ({ ...item, image: 0 })),
  };
}

// UI-SPEC Company/Compliance — company-profile document card. `file` is
// intentionally left unset: no real profile PDF exists yet, so CertCard (via
// DocumentCardBlock) renders its honest PDF-absent "available on request"
// state (T-02-08).
function documentCard(title: string, description?: string) {
  return { blockType: "documentCard" as const, title, description };
}

// UI-SPEC §9 — realistic placeholder contact details. WhatsApp reuses the
// existing all-zeros placeholder number (matches WHATSAPP_CTA's wa.me link
// above — same pending-real-number caveat, not a new placeholder pattern).
// Address is a clearly placeholder company address (Pitfall 5/9: no
// fabricated registration/IEC numbers anywhere in this block).
function contactBlock() {
  // email/phone/WhatsApp now come from the SiteSettings global (single source);
  // this block only carries intro + address.
  return {
    blockType: "contactBlock" as const,
    intro:
      "Reach out directly, or send an inquiry below. Our export team responds to every message within one business day.",
    address: "Plot 14, MIDC Industrial Area, Nashik, Maharashtra 422010, India",
  };
}

// Minimal hand-authored Lexical editor-state JSON (root > paragraph > text) —
// the exact shape @payloadcms/richtext-lexical's JSX converter renders
// (ParagraphJSXConverter/TextJSXConverter). One paragraph node per string
// argument. No hand-rolled HTML, no markdown-to-lexical conversion package —
// this is the documented serialized-state shape, plain data.
function richText(...paragraphs: string[]) {
  return {
    blockType: "richText" as const,
    content: {
      root: {
        type: "root",
        format: "" as const,
        indent: 0,
        version: 1,
        direction: "ltr" as const,
        children: paragraphs.map((text) => ({
          type: "paragraph",
          format: "" as const,
          indent: 0,
          version: 1,
          direction: "ltr" as const,
          textFormat: 0,
          children: [
            { type: "text", detail: 0, format: 0, mode: "normal", style: "", text, version: 1 },
          ],
        })),
      },
    },
  };
}

export const PAGES_EN_SEED = [
  {
    slug: "home",
    title: "Home",
    // Phase 7 UI-SPEC Part 3 — full 11-block trust narrative: Hero(full) ->
    // TrustBar -> FeatureGrid(icon, "Why Choose Us") -> MediaGallery
    // (condensed "Manufacturing Excellence" teaser, reusing the /manufacturing
    // captions+figures verbatim) -> StatsBand(capacity/QC/cold-chain) ->
    // CertStrip -> StatsBand(15+/40+/500+) -> ExportProcess -> ExportMap
    // (compact) -> Testimonials -> CTABand. The two StatsBand instances carry
    // distinct label sets (capacity vs. years/countries/shipments) so
    // "Years Exporting" always resolves to the later (row 7) band — see
    // key_links in 07-03-PLAN.md.
    // T-104/CONTENT_PLAYBOOK §4 Home 1-9 order. Product category names below
    // are the REAL production taxonomy (Frozen Vegetables/Fruit Pulp &
    // Purees/Value-Added & Specialty) — intentionally does NOT match this
    // file's placeholder Grains/Spices/Pulses/Oilseeds catalog below; that
    // mismatch is the pre-existing, already-tracked "sync local seed to real
    // catalog" gap (D-27), not something this pass fixes. These are static
    // marketing-card strings, not a live Categories query, so nothing breaks
    // — the cards are just thematically ahead of the local placeholder data.
    layout: [
      homeHero,
      trustBar("Why Buyers Can Trust This Supply Chain", [
        { name: "Multi-Checkpoint Quality Control" },
        { name: "Temperature-Controlled Cold Storage" },
        { name: "Full Batch Traceability" },
        { name: "Manufactured in Karad, Maharashtra" },
      ]),
      featureGrid(
        "icon",
        [
          {
            icon: "snowflake",
            title: "Frozen Vegetables",
            body: "IQF frozen vegetables, processed and frozen shortly after harvest.",
          },
          {
            icon: "droplet",
            title: "Fruit Pulp & Purees",
            body: "Aseptic fruit pulp and purees for food and beverage processing.",
          },
          {
            icon: "package",
            title: "Value-Added & Specialty",
            body: "Prepared vegetable and paste products for food service and retail.",
          },
        ],
        "What We Export",
      ),
      featureGrid(
        "icon",
        [
          {
            icon: "fileCheck",
            title: "Open Specifications",
            body: "Full product specifications shared on request, before you place an order — no surprises after the container ships.",
          },
          {
            icon: "refreshCw",
            title: "Sample Program",
            body: "Pre-shipment samples available so you can verify quality before committing to a full order.",
          },
          {
            icon: "shieldCheck",
            title: "Inspection Welcome",
            body: "Third-party inspection welcome at your nomination (SGS, Bureau Veritas, Intertek) — we have nothing to hide.",
          },
          {
            icon: "clock",
            title: "24-Hour Response",
            body: "Every inquiry gets a reply within one business day, from a real person on our export team.",
          },
        ],
        "How We De-Risk Your First Order",
      ),
      // Condensed "Manufacturing Excellence" teaser — 3 of the 4 existing
      // /manufacturing MediaGallery captions (Packing & Dispatch dropped),
      // paired with the /manufacturing StatsBand figures reused verbatim.
      // Captions MUST match FACILITY_PHOTOS keys in scripts/seed-pages.ts.
      mediaGallery(
        [
          { caption: "Processing Floor" },
          { caption: "Quality Control Lab" },
          { caption: "Cold Storage" },
        ],
        "Manufacturing Excellence",
      ),
      certStrip(
        "strip",
        "Product Accreditation & Certification",
        "Our products are processed and packed under the quality and safety certifications shown below.",
      ),
      exportProcess("How an Order Moves From Inquiry to Delivery", [
        {
          title: "Inquiry",
          body: "Share your product, target quantity, and destination port. Our export team responds within one business day.",
        },
        {
          title: "Quote",
          body: "Receive a detailed quote covering pricing, incoterms, and lead time, scoped to your order volume.",
        },
        {
          title: "Production & QC",
          body: "Your order enters production under documented SOPs, with quality checkpoints at intake, mid-process, and pre-dispatch.",
        },
        {
          title: "Export Documentation",
          body: "Phytosanitary certificates, packing lists, and certificates of origin are prepared ahead of dispatch, so customs clearance stays on schedule.",
        },
        {
          title: "Delivery",
          body: "Your shipment is tracked in transit to your port, with cold-chain and handling standards maintained until arrival.",
        },
      ]),
      // T-104/D-31: Gulf-first only, zero stats — capability framing, not a
      // shipped-to claim (D-01: new company, no export history yet). See
      // exportMap()'s own doc comment above for the general shape; this call
      // intentionally overrides the broader SERVED_COUNTRY_CODES default.
      {
        ...exportMap("full", [], "Markets We're Built to Serve"),
        highlightedCountryCodes: ["AE", "SA", "QA", "KW", "BH", "OM"],
        intro:
          "Gulf and Middle East buyers first: reefer-ready logistics to ports including Jebel Ali and Dammam, Halal-compliant processing, and Arabic labeling capability. Southeast Asia and other markets available on request.",
      },
      ctaBand("Source With Confidence"),
    ],
  },
  {
    slug: "about",
    title: "About",
    // T-108/CONTENT_PLAYBOOK §4 About. Founder section ((1) "why VNP
    // exists" first-person, (3) founder photo/bio block) intentionally
    // OMITTED — {{FOUNDER_NAME}} and the founder's own words are real
    // business facts no one has supplied yet (T-110), and putting invented
    // words in a real person's mouth is a materially worse fabrication than
    // an invented stat. Omit rather than fake, same CAT-04 discipline used
    // for certifications/product photos all through this playbook. Sections
    // (2) group & facility and (4) de-risk promises ARE real and included.
    layout: [
      compactHero(
        "Rooted in Indian Agriculture, Built for Global Trade",
        "VNP Global sources and exports agricultural products, built from the ground up to meet the standards international buyers expect.",
      ),
      richText(
        "VNP Global sources, grades, and manages export for agricultural products, built from day one around the standards international buyers expect: quality control, documentation, and reliable communication.",
        "Our mission is simple: get consistently graded, safely processed agricultural products to international buyers who can't afford supply-chain surprises. Leadership bios and compliance details live on our Company & Compliance page.",
      ),
      // (2) Group & facility — CONTENT_PLAYBOOK §4's exact honesty framing.
      richText(
        "VNP Global is a new export company. Our products are manufactured at the Kavita Facility Management (Agro Division) plant in Tasawade MIDC, Karad — an operating processor also behind the Piyush Farms brand.",
      ),
      // (4) What we promise buyers — the same de-risk tiles as the homepage
      // (T-104), reused verbatim rather than invented a second time.
      featureGrid(
        "icon",
        [
          {
            icon: "fileCheck",
            title: "Open Specifications",
            body: "Full product specifications shared on request, before you place an order — no surprises after the container ships.",
          },
          {
            icon: "refreshCw",
            title: "Sample Program",
            body: "Pre-shipment samples available so you can verify quality before committing to a full order.",
          },
          {
            icon: "shieldCheck",
            title: "Inspection Welcome",
            body: "Third-party inspection welcome at your nomination (SGS, Bureau Veritas, Intertek) — we have nothing to hide.",
          },
          {
            icon: "clock",
            title: "24-Hour Response",
            body: "Every inquiry gets a reply within one business day, from a real person on our export team.",
          },
        ],
        "What We Promise Buyers",
      ),
      ctaBand("Learn More About Our Story"),
    ],
  },
  {
    slug: "certifications",
    title: "Certifications",
    // T-106/PROMPT_LIBRARY P-05: status board (certStrip grid) + per-shipment
    // documentation list (what buyers actually receive, not a claim about
    // certs held) + audit-openness statement + a sample-COA download slot
    // (documentCard — no file uploaded yet, renders its existing honest
    // "available on request" state, same pattern as the Company Profile
    // card).
    layout: [
      compactHero(
        "Committed to Certified Quality Standards",
        "We're working toward the certifications international buyers expect. Check back as they're confirmed, or ask us directly.",
      ),
      certStrip("grid", "Our Certifications"),
      richText(
        "We welcome third-party inspection and documentation review at any stage, before or after certification is complete — including buyer-nominated inspectors (SGS, Bureau Veritas, Intertek) and unannounced facility visits.",
        "Every shipment travels with a Certificate of Analysis (COA), health certificate, phytosanitary certificate, and certificate of origin (COO). A Halal certificate is included where applicable to the product.",
      ),
      documentCard(
        "Sample Certificate of Analysis (COA)",
        "A redacted example COA showing the format and parameters we report on, available on request.",
      ),
      ctaBand("Get Your Compliance Questions Answered"),
    ],
  },
  {
    slug: "manufacturing",
    title: "Manufacturing",
    // UI-SPEC Page Composition "Manufacturing/process" row. Intro paragraph
    // matches the honest partnership framing already live on production
    // (D-27 — direct API edit, this seed file had drifted stale with an
    // earlier "our own processing floor" draft that predates the honesty
    // rewrite; corrected here so fresh local installs match reality).
    // T-107 adds: D-14 exact IQF wording (never claim in-house IQF line),
    // traceability detail, audit-openness statement — inserted before the
    // MediaGallery. Gallery item captions match FACILITY_PHOTOS keys in
    // scripts/seed-pages.ts, which attaches placeholder photos post-seed.
    layout: [
      compactHero(
        "Inside Our Processing Facilities",
        "From intake to cold-chain dispatch, every stage is documented and quality-controlled.",
      ),
      richText(
        "VNP Global's frozen vegetable and fruit pulp range is manufactured at the Piyush Farms facility (piyushfarms.com), operated by Kavita Facility Management Pvt Ltd, Agro Division, in Karad, Maharashtra, a processing plant built for rapid farm-to-factory handling of fresh produce.",
        "Quality control runs at multiple checkpoints across intake, mid-process, and pre-dispatch, so defects are caught before a batch ever reaches packing, not after a buyer receives it.",
        "Temperature-controlled cold storage protects perishable batches between processing and dispatch, with every batch documented and traceable back to intake for full chain-of-custody visibility.",
        "VNP Global manages the export side of this partnership: international logistics, documentation, and compliance, so the facility's output reaches buyers reliably, wherever they are.",
      ),
      // T-107/DECISION_LOG D-14 (LOCKED wording) — describes the PRODUCT as
      // IQF-processed (true) without claiming an in-house IQF line.
      richText(
        "Our frozen products are IQF-processed. IQF freezing runs through qualified partner lines; cold storage is in-house at the facility, keeping every batch temperature-controlled from freezing through dispatch.",
        "Every pallet carries a lot code assigned at intake, tracked through processing, packing, and cold storage — the same code links a finished carton back to its intake batch and processing date for full traceability.",
      ),
      richText(
        "We welcome third-party inspection and documentation review at any stage — including buyer-nominated inspectors (SGS, Bureau Veritas, Intertek) and facility visits, in person or over video call.",
      ),
      mediaGallery(
        [
          { caption: "Processing Floor" },
          { caption: "Quality Control Lab" },
          { caption: "Cold Storage" },
          { caption: "Packing & Dispatch" },
        ],
        "Inside Our Facilities",
      ),
      ctaBand("Request a Facility Walkthrough"),
    ],
  },
  {
    slug: "export",
    title: "Global Markets",
    // T-201/CONTENT_PLAYBOOK §4 Global Markets: Gulf/Middle East section
    // FIRST (reefer logistics, Halal, Arabic labeling, GSO awareness), then
    // Southeast Asia, then "other markets on request" — explicitly NOT a
    // broad highlighted-country map with a market-count stat tile (that was
    // this page's previous shape: 16 countries + "16+ Target Export
    // Markets", the exact over-claiming pattern D-31 already fixed on the
    // homepage — a new exporter with zero shipment history showing a wide
    // "countries we're in" map reads as a track-record claim it doesn't
    // have). Two narrow, honestly-scoped ExportMap instances instead of one
    // broad one, zero stat tiles.
    layout: [
      compactHero(
        "Markets We're Built to Serve",
        "We're positioned to export to the Gulf, Southeast Asia, and other international markets. Reach out to discuss your destination and requirements.",
      ),
      statsBand([{ value: "FOB / CIF / CFR", label: "Incoterms We Work With" }]),
      {
        ...exportMap("full", [], "Gulf & Middle East — Our Primary Focus"),
        highlightedCountryCodes: ["AE", "SA", "QA", "KW", "BH", "OM"],
        intro:
          "Reefer-ready logistics to ports including Jebel Ali and Dammam, Halal-compliant processing, Arabic labeling capability, and GSO-standard awareness — built for Gulf buyers from day one.",
      },
      {
        ...exportMap("compact", [], "Southeast Asia"),
        highlightedCountryCodes: ["SG"],
        intro:
          "Singapore-anchored logistics as our entry point into Southeast Asia, with capacity to extend into Malaysia, Indonesia, and Vietnam as demand grows.",
      },
      richText(
        "Interested in a market outside the Gulf or Southeast Asia? We take on new destinations on request — reach out to discuss logistics, documentation, and lead time for your specific country.",
      ),
      ctaBand("Discuss Your Order Volume"),
    ],
  },
  {
    slug: "company",
    title: "Company & Compliance",
    // UI-SPEC Page Composition "Company/Compliance" row: Hero(compact) ->
    // FeatureGrid(photo, leadership) -> RichText(IEC/registration) ->
    // RichText(logistics/documentation) -> documentCard(Company Profile) ->
    // CTABand. Leadership bios live HERE, not on About (UI-SPEC note — do
    // not duplicate). Item titles below match LEADERSHIP_AVATARS keys in
    // scripts/seed-pages.ts, which attaches placeholder photos post-seed.
    layout: [
      compactHero(
        "The Compliance Behind the Claims",
        "IEC and APEDA registration in progress, with full export documentation support on every order.",
      ),
      featureGrid("photo", [
        {
          title: "Managing Director",
          body: "Oversees company strategy, buyer relationships, and long-term export planning across all product lines.",
        },
        {
          title: "Head of Quality & Compliance",
          body: "Leads certification management, quality assurance protocols, and regulatory compliance across every shipment.",
        },
        {
          title: "Export Operations Manager",
          body: "Coordinates logistics, documentation, and on-time delivery for international buyers.",
        },
      ]),
      // T-008: registrations reworded from settled fact to in-progress —
      // neither is confirmed live yet (playbook DECISION_LOG Open
      // Placeholders). No fabricated IEC/FSSAI/registration NUMBER anywhere
      // below — generic compliance prose only (T-02-08, Pitfall 5/9).
      richText(
        "VNP Global's IEC and APEDA registrations are in progress as part of our export compliance setup. Registration numbers will be published here once issued.",
        "Our documentation team ensures every shipment carries the certificates, phytosanitary clearances, and customs paperwork your import authority requires, verifiable on request, not just claimed.",
      ),
      richText(
        "From letter-of-credit documentation to phytosanitary certificates, packing lists, and certificates of origin, our logistics team prepares every export document your customs broker and import authority require.",
        "That reduces delays at the port and gives your compliance team a paper trail they can trust, order after order.",
      ),
      documentCard(
        "Company Profile",
        "A concise overview of our facilities, certifications, and export capabilities.",
      ),
      ctaBand("Request Our Company Profile"),
    ],
  },
  {
    slug: "contact",
    title: "Contact",
    // No CTABand per UI-SPEC — this page is the destination.
    layout: [
      compactHero(
        "Let's Start a Conversation",
        "Our export team responds to every inquiry within one business day.",
      ),
      contactBlock(),
      faq("Frequently Asked Questions", [
        {
          question: "What should I include in my first inquiry?",
          answer:
            "Tell us the product, your destination country, the volume you need, and your preferred incoterm. That is enough for our export team to come back with an indicative quotation.",
        },
        {
          question: "How quickly will I hear back?",
          answer: "Our export team responds to every inquiry within one business day.",
        },
        {
          question: "Can you provide export documentation for customs clearance?",
          answer:
            "Yes. Every shipment travels with the documentation set agreed at order confirmation, prepared for your destination market's requirements.",
        },
        {
          question: "Do you send samples before a first order?",
          answer:
            "Yes, samples can be arranged for qualified buyers. Mention it in your inquiry and include the delivery address.",
        },
      ]),
    ],
  },
];

// Backward-compat for the existing Phase 1 e2e fallback-notice assertion,
// which reads the homepage hero copy directly. Derived from the single
// source of truth above so the two never drift out of sync.
export const HOME_EN_SEED = {
  heroHeadline: homeHero.headline,
  heroSubhead: homeHero.subhead,
};
