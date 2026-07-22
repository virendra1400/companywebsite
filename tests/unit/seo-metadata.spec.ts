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
    });

    expect(result.title).toBe("Rice");
    expect(result.description).toBe("d");
    expect(result.openGraph?.images).toEqual(["https://example.test/x.jpg"]);
    expect(result.alternates).toEqual(buildAlternates(["en"], "/products/rice"));
  });

  it("yields an empty openGraph.images array when imageUrl is null/undefined", async () => {
    const { buildMetadata } = await import("@/lib/seo/metadata");

    const withNull = buildMetadata({
      title: "Rice",
      description: "d",
      imageUrl: null,
      translatedLocales: ["en"],
      path: "/products/rice",
    });
    const withUndefined = buildMetadata({
      title: "Rice",
      description: "d",
      translatedLocales: ["en"],
      path: "/products/rice",
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
    });

    expect(result.title).toBeTruthy();
  });
});
