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

// FeatureGrid/CertStrip/StatsBand/ExportMap are inserted by later Phase 2
// plans (this plan ships only the Hero/RichText/CTABand slice) — do not
// pre-scaffold their seed shape now (YAGNI).
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

export const PAGES_EN_SEED = [
  { slug: "home", title: "Home", layout: [homeHero, ctaBand("Ready to Source With Confidence?")] },
  {
    slug: "about",
    title: "About",
    layout: [
      compactHero(
        "Three Generations of Agricultural Expertise",
        "Star Agrevolution began as a family farming operation and grew into a full-spectrum export house serving institutional and retail buyers worldwide.",
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
      ctaBand("Have a Compliance Question?"),
    ],
  },
  {
    slug: "manufacturing",
    title: "Manufacturing",
    layout: [
      compactHero(
        "Inside Our Processing Facilities",
        "From intake to cold-chain dispatch, every stage is documented and quality-controlled.",
      ),
      ctaBand("Want a Facility Walkthrough?"),
    ],
  },
  {
    slug: "export",
    title: "Export Track Record",
    layout: [
      compactHero(
        "A Track Record Buyers Can Verify",
        "Real countries, real shipment volumes, real incoterms — not a vague export claim.",
      ),
      ctaBand("Ready to Discuss Your Order Volume?"),
    ],
  },
  {
    slug: "company",
    title: "Company & Compliance",
    layout: [
      compactHero(
        "The Compliance Behind the Claims",
        "IEC registration, export documentation support, and leadership with decades of trade experience.",
      ),
      ctaBand("Need Our Company Profile?"),
    ],
  },
  {
    slug: "contact",
    title: "Contact",
    // No CTABand per UI-SPEC — this page is the destination. ContactBlock
    // (the real form) lands in Plan 06; this thin stub guarantees the slug
    // has a doc to prerender in the meantime.
    layout: [
      compactHero(
        "Let's Start a Conversation",
        "Our export team responds to every inquiry within one business day.",
      ),
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
