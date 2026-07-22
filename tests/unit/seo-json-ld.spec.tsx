import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { JsonLd, breadcrumbJsonLd, organizationJsonLd, productJsonLd } from "@/lib/seo/json-ld";

describe("organizationJsonLd", () => {
  it("emits Organization with name/url/logo/address/sameAs when all present", () => {
    const result = organizationJsonLd({
      siteName: "Star",
      url: "https://example.test",
      logoUrl: "https://example.test/logo.png",
      address: { city: "Mumbai", country: "IN" },
      sameAs: ["https://linkedin.com/x"],
    });

    expect(result["@type"]).toBe("Organization");
    expect(result.name).toBe("Star");
    expect(result.url).toBe("https://example.test");
    expect(result.logo).toBe("https://example.test/logo.png");
    expect((result.address as Record<string, unknown>)["@type"]).toBe("PostalAddress");
    expect((result.address as Record<string, unknown>).addressLocality).toBe("Mumbai");
    expect((result.address as Record<string, unknown>).addressCountry).toBe("IN");
    expect(result.sameAs).toEqual(["https://linkedin.com/x"]);
  });

  it("omits logo/address/sameAs entirely when absent (not null)", () => {
    const result = organizationJsonLd({
      siteName: "Star",
      url: "https://example.test",
      logoUrl: null,
    });

    expect(result).not.toHaveProperty("logo");
    expect(result).not.toHaveProperty("address");
    expect(result).not.toHaveProperty("sameAs");
  });
});

describe("productJsonLd", () => {
  it("emits Product with name/image/description/category/additionalProperty and D-10 omissions", () => {
    const result = productJsonLd({
      name: "Rice < 5% broken",
      images: ["a.jpg"],
      description: "d",
      categoryName: "Grains",
      certNames: ["Halal"],
    });

    expect(result["@type"]).toBe("Product");
    expect(result.name).toBe("Rice < 5% broken");
    expect(result.image).toEqual(["a.jpg"]);
    expect(result.description).toBe("d");
    expect(result.category).toBe("Grains");
    expect(result.additionalProperty).toEqual([{ "@type": "PropertyValue", name: "Certification", value: "Halal" }]);

    expect(result).not.toHaveProperty("offers");
    expect(result).not.toHaveProperty("price");
    expect(result).not.toHaveProperty("priceCurrency");
    expect(result).not.toHaveProperty("availability");
    expect(result).not.toHaveProperty("review");
    expect(result).not.toHaveProperty("aggregateRating");
  });
});

describe("breadcrumbJsonLd", () => {
  it("emits BreadcrumbList with 1-indexed positions", () => {
    const result = breadcrumbJsonLd([
      { name: "Insights", url: "u1" },
      { name: "Article", url: "u2" },
    ]);

    expect(result["@type"]).toBe("BreadcrumbList");
    expect(result.itemListElement).toHaveLength(2);
    expect(result.itemListElement[0]).toEqual({ "@type": "ListItem", position: 1, name: "Insights", item: "u1" });
    expect(result.itemListElement[1]).toEqual({ "@type": "ListItem", position: 2, name: "Article", item: "u2" });
  });
});

describe("JsonLd", () => {
  it("escapes '<' in the emitted script so a CMS string can't break out of the script context", () => {
    const html = renderToStaticMarkup(<JsonLd data={{ name: "Rice < 5% broken" }} />);

    expect(html).toContain("\\u003c");
    // The escaped payload itself must not contain a raw '<' inside the JSON text.
    const scriptContentMatch = html.match(/>(\{.*\})<\/script>/);
    expect(scriptContentMatch).not.toBeNull();
    expect(scriptContentMatch?.[1]).not.toContain("< 5%");
  });
});
