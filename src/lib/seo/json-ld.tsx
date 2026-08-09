// Structured-data (JSON-LD) builders + the one shared render component.
//
// Official Next.js guidance: there is no Metadata API field for JSON-LD —
// render a manually-escaped inline <script type="application/ld+json"> in
// the Server Component body. JSON.stringify does NOT sanitize XSS, so '<' is
// escaped to < here so a CMS-authored string (e.g. product.name)
// cannot break out of the script context (T-05-03).
// Source: https://nextjs.org/docs/app/guides/json-ld
//
// Every structured-data payload in this app MUST route through this ONE
// component — never add a second inline dangerouslySetInnerHTML for
// JSON-LD elsewhere (Pitfall 3 / prohibition in 05-03-PLAN.md).
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger -- see file-level comment: escaping applied above
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

interface OrganizationInput {
  siteName: string;
  url: string;
  logoUrl?: string | null;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  sameAs?: string[];
  // D-51 follow-up: SEO_PLAYBOOK §4 has always specified
  // "contactPoint (tel, email, availableLanguage)" — email/phone were
  // already fetched by every caller (getSiteBrand) but never passed
  // through to this builder. Optional so a blank/placeholder value doesn't
  // force a phone number that reads as a real support line.
  email?: string;
  phone?: string;
}

// The trading/brand name as it appears in the logo wordmark and page copy,
// as distinct from the registered name in SiteSettings.siteName.
const BRAND_SHORT_NAME = "VNP Global";

export function organizationJsonLd(settings: OrganizationInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
    // SEO_PLAYBOOK §11 entity consistency: `siteName` is the registered name
    // ("VNP Global Private Limited") and matches the Google Business Profile,
    // MCA record and directory listings — but the logo wordmark, page copy and
    // most inbound links say "VNP Global". Without an explicit alternateName,
    // Google has no signal that the brand and the legal entity are the same
    // thing, so brand-name searches and links don't consolidate onto the
    // entity. legalName states the registered name unambiguously; the
    // alternateName is only emitted when the two genuinely differ.
    legalName: settings.siteName,
    ...(settings.siteName !== BRAND_SHORT_NAME && { alternateName: BRAND_SHORT_NAME }),
    url: settings.url,
    ...(settings.logoUrl && { logo: settings.logoUrl }),
    ...(settings.address && {
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.address.street,
        addressLocality: settings.address.city,
        addressRegion: settings.address.state,
        postalCode: settings.address.postalCode,
        addressCountry: settings.address.country,
      },
    }),
    ...(settings.sameAs?.length && { sameAs: settings.sameAs }),
    ...((settings.email || settings.phone) && {
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "sales",
        ...(settings.phone && { telephone: settings.phone }),
        ...(settings.email && { email: settings.email }),
        availableLanguage: ["English", "Arabic", "French", "Russian"],
      },
    }),
  };
}

// D-51 follow-up: SEO_PLAYBOOK §4 also requires "WebSite on home" — never
// implemented. Rendered only on the homepage (JsonLd's file-level rule is
// "one component," not "one call site" — this is a distinct schema type
// from Organization, not a duplicate).
export function websiteJsonLd(settings: { siteName: string; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.siteName,
    url: settings.url,
  };
}

interface ProductInput {
  name: string;
  images: string[];
  description?: string;
  categoryName?: string;
  certNames: string[];
}

// D-10: no offers/price/availability/review/aggregateRating — this is a B2B
// RFQ site, not e-commerce. Do not add them here.
export function productJsonLd(product: ProductInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    ...(product.description && { description: product.description }),
    ...(product.categoryName && { category: product.categoryName }),
    ...(product.certNames.length && {
      additionalProperty: product.certNames.map((n) => ({
        "@type": "PropertyValue",
        name: "Certification",
        value: n,
      })),
    }),
  };
}

// T-105/SEO_PLAYBOOK §4: only emitted when a product actually has FAQ items
// (D-01: never a placeholder question).
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
