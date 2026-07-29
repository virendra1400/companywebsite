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
  eyebrow: "ISO / HACCP / APEDA CERTIFIED",
  headline: "Trusted Agricultural Exports, From Farm to Global Table",
  subhead:
    "ISO- and HACCP-aligned processing, Halal-certified supply lines, and 15+ years serving importers across the Gulf, Europe, and beyond.",
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
function certStrip(variant: "strip" | "grid", sectionTitle?: string) {
  return { blockType: "certStrip" as const, variant, sectionTitle };
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
      "Reach out directly, or send an inquiry below — our export team responds to every message within one business day.",
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
    layout: [
      homeHero,
      trustBar("Trusted by Importers Across the Globe", [
        { name: "Gulf & Middle East Importers" },
        { name: "European Distributors" },
        { name: "North American Buyers" },
        { name: "African Trade Partners" },
        { name: "Southeast Asian Wholesalers" },
      ]),
      featureGrid("icon", [
        {
          icon: "shieldCheck",
          title: "Quality",
          body: "Every batch is inspected against strict quality parameters before it leaves our processing facilities, so what you receive matches what you were quoted.",
        },
        {
          icon: "refreshCw",
          title: "Reliability",
          body: "Consistent grading, on-time dispatch, and dependable lead times — the same standards whether it's your first order or your fiftieth.",
        },
        {
          icon: "fileCheck",
          title: "Compliance",
          body: "ISO- and HACCP-aligned processing with full export documentation support, so your import authority sees exactly what it needs to see.",
        },
        {
          icon: "globe",
          title: "Global Reach",
          body: "Established supply lines across the Gulf, Europe, and beyond — built for buyers who need a partner that already understands cross-border logistics.",
        },
      ]),
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
      statsBand([
        { value: "500+", label: "Metric Tons Monthly Capacity" },
        { value: "3", label: "In-House QC Checkpoints" },
        { value: "24/7", label: "Cold-Chain Monitoring" },
      ]),
      certStrip("strip"),
      statsBand([
        { value: "15+", label: "Years Exporting" },
        { value: "40+", label: "Countries Served" },
        { value: "500+", label: "Container Shipments" },
      ]),
      exportProcess("How an Order Moves From Inquiry to Delivery", [
        {
          title: "Inquiry",
          body: "Share your product, target quantity, and destination port — our export team responds within one business day.",
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
      exportMap("compact", [
        { value: `${SERVED_COUNTRY_CODES.length}+`, label: "Countries We Currently Export To" },
      ]),
      // Placeholder testimonials — see the `testimonials()` helper comment
      // above (Pitfall 5: role + buyer-category + real served country, not a
      // fabricated named-client endorsement) — pending real client quotes.
      testimonials("What Our Buyers Say", [
        {
          quote:
            "Consistent grading and on-time dispatch, shipment after shipment — exactly what we need from an overseas supplier.",
          name: "Procurement Lead",
          company: "GCC-Based Food Importer",
          country: "United Arab Emirates",
        },
        {
          quote:
            "Their documentation is always complete before the container leaves port, which has cut our customs clearance time significantly.",
          name: "Import Operations Manager",
          company: "European Distribution Partner",
          country: "Germany",
        },
        {
          quote: "We've scaled our order volume three times over and quality has never dipped.",
          name: "Category Buyer",
          company: "Wholesale Import Group",
          country: "Singapore",
        },
      ]),
      ctaBand("Ready to Source With Confidence?"),
    ],
  },
  {
    slug: "about",
    title: "About",
    layout: [
      compactHero(
        "Three Generations of Agricultural Expertise",
        "VNP Global began as a family farming operation and grew into a full-spectrum export house serving institutional and retail buyers worldwide.",
      ),
      richText(
        "What began three generations ago as a family farming operation has grown into a vertically integrated export house — from our own fields and sourcing network through processing, quality control, and global logistics.",
        "Our mission is simple: deliver consistently graded, safely processed agricultural products to international buyers who can't afford supply-chain surprises. Leadership bios and compliance details live on our Company & Compliance page.",
      ),
      ctaBand("Want to Know More About Our Story?"),
    ],
  },
  {
    slug: "certifications",
    title: "Certifications",
    layout: [
      compactHero(
        "Certified for Global Trust",
        "Every certification we hold is backed by a downloadable document — verify our compliance before you commit.",
      ),
      certStrip("grid", "Our Certifications"),
      ctaBand("Have a Compliance Question?"),
    ],
  },
  {
    slug: "manufacturing",
    title: "Manufacturing",
    // UI-SPEC Page Composition "Manufacturing/process" row: Hero(compact) ->
    // RichText(process overview) -> MediaGallery(facility photos) ->
    // StatsBand(capacity/QC/cold-chain) -> CTABand. MediaGallery item
    // captions below match FACILITY_PHOTOS keys in scripts/seed-pages.ts,
    // which attaches placeholder photos post-seed (same pattern as
    // attachLeadershipPhotos).
    layout: [
      compactHero(
        "Inside Our Processing Facilities",
        "From intake to cold-chain dispatch, every stage is documented and quality-controlled.",
      ),
      richText(
        "Every shipment begins on our own processing floor, where incoming produce is graded, cleaned, and sorted before moving into product-specific processing lines under documented standard operating procedures.",
        "Our quality control lab tests samples at multiple checkpoints — intake, mid-process, and pre-dispatch — so defects are caught before a batch ever reaches packing, not after a buyer receives it.",
        "Temperature-controlled cold storage protects perishable batches between processing and dispatch, and every pallet is documented and traceable back to its intake batch for full chain-of-custody visibility.",
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
      // T-02-12 mitigation: realistic-SHAPED capacity/QC/cold-chain figures,
      // not presented as audited — same non-fabricated-figure precedent as
      // the homepage StatsBand.
      statsBand([
        { value: "500+", label: "Metric Tons Monthly Capacity" },
        { value: "3", label: "In-House QC Checkpoints" },
        { value: "24/7", label: "Cold-Chain Monitoring" },
      ]),
      ctaBand("Want a Facility Walkthrough?"),
    ],
  },
  {
    slug: "export",
    title: "Export Track Record",
    // UI-SPEC Page Composition "Export Track Record" row: Hero(compact) ->
    // StatsBand(years/volume/incoterms) -> ExportMap(full, own stats + chip
    // list) -> CTABand. T-02-15: realistic-SHAPED figures, never presented
    // as an audited fact.
    layout: [
      compactHero(
        "A Track Record Buyers Can Verify",
        "Real countries, real shipment volumes, real incoterms — not a vague export claim.",
      ),
      statsBand([
        { value: "15+", label: "Years Exporting" },
        { value: "500+", label: "Container Shipments" },
        { value: "FOB / CIF / CFR", label: "Incoterms Handled" },
      ]),
      exportMap(
        "full",
        [{ value: `${SERVED_COUNTRY_CODES.length}+`, label: "Countries Served" }],
        "Where We Export",
      ),
      ctaBand("Ready to Discuss Your Order Volume?"),
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
        "IEC registration, export documentation support, and leadership with decades of trade experience.",
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
      // No fabricated IEC/FSSAI/registration NUMBER anywhere below —
      // generic compliance prose only (T-02-08, Pitfall 5/9).
      richText(
        "VNP Global operates under a valid Importer-Exporter Code (IEC) registration and maintains compliance with India's export-import regulatory framework, including APEDA registration for agricultural exports.",
        "Our documentation team ensures every shipment carries the certificates, phytosanitary clearances, and customs paperwork your import authority requires — verifiable on request, not just claimed.",
      ),
      richText(
        "From letter-of-credit documentation to phytosanitary certificates, packing lists, and certificates of origin, our logistics team prepares every export document your customs broker and import authority require.",
        "That reduces delays at the port and gives your compliance team a paper trail they can trust, order after order.",
      ),
      documentCard(
        "Company Profile",
        "A concise overview of our facilities, certifications, and export capabilities.",
      ),
      ctaBand("Need Our Company Profile?"),
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
