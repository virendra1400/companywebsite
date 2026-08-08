import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";
});

describe("buildMetadata", () => {
  it("assembles title/description/openGraph and delegates alternates to buildAlternates", async () => {
    const { buildMetadata } = await import("@/lib/seo/metadata");
    const { buildAlternates } = await import("@/lib/seo/alternates");

    const result = buildMetadata({
      title: "Rice",
      description: "d",
      imageUrl: "https://example.test/x.jpg",
      translatedLocales: ["en"],
      path: "/products/rice",
      locale: "en",
    });

    expect(result.title).toBe("Rice");
    expect(result.description).toBe("d");
    expect(result.openGraph?.images).toEqual(["https://example.test/x.jpg"]);
    expect(result.alternates).toEqual(buildAlternates(["en"], "/products/rice", "en"));
  });

  it("yields an empty openGraph.images array when imageUrl is null/undefined", async () => {
    const { buildMetadata } = await import("@/lib/seo/metadata");

    const withNull = buildMetadata({
      title: "Rice",
      description: "d",
      imageUrl: null,
      translatedLocales: ["en"],
      path: "/products/rice",
      locale: "en",
    });
    const withUndefined = buildMetadata({
      title: "Rice",
      description: "d",
      translatedLocales: ["en"],
      path: "/products/rice",
      locale: "en",
    });

    expect(withNull.openGraph?.images).toEqual([]);
    expect(withUndefined.openGraph?.images).toEqual([]);
  });

  it("still yields a non-empty title for a fallback-sourced (EN-fallback) title", async () => {
    const { buildMetadata } = await import("@/lib/seo/metadata");

    const result = buildMetadata({
      title: "Rice (EN fallback)",
      description: "d",
      translatedLocales: ["en"],
      path: "/products/rice",
      locale: "en",
    });

    expect(result.title).toBeTruthy();
  });

  // D-50 regression: buildMetadata's alternates.canonical must track the
  // `locale` argument, not always resolve to English.
  it("delegates canonical to the passed locale, not always English", async () => {
    const { buildMetadata } = await import("@/lib/seo/metadata");
    const { localeUrl } = await import("@/lib/seo/alternates");

    const result = buildMetadata({
      title: "Rice",
      description: "d",
      translatedLocales: ["en", "ar"],
      path: "/products/rice",
      locale: "ar",
    });

    expect(result.alternates?.canonical).toBe(localeUrl("ar", "/products/rice"));
  });
});
