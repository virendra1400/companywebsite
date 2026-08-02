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
}

export function organizationJsonLd(settings: OrganizationInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName,
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
