import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";
});

describe("localeUrl", () => {
  it("does not prefix the default locale (en)", async () => {
    const { localeUrl } = await import("@/lib/seo/alternates");
    expect(localeUrl("en", "/products/rice")).toBe("https://example.test/products/rice");
  });

  it("prefixes non-default locales with /<locale>", async () => {
    const { localeUrl } = await import("@/lib/seo/alternates");
    expect(localeUrl("ar", "/products/rice")).toBe("https://example.test/ar/products/rice");
  });

  it("normalizes the home path to the bare origin", async () => {
    const { localeUrl } = await import("@/lib/seo/alternates");
    expect(localeUrl("en", "/")).toBe("https://example.test");
  });
});

describe("buildAlternates", () => {
  it("en-only: self-referencing canonical, exactly one x-default, no ar/fr/ru keys", async () => {
    const { buildAlternates, localeUrl } = await import("@/lib/seo/alternates");
    const result = buildAlternates(["en"], "/products/rice", "en");
    const enUrl = localeUrl("en", "/products/rice");

    expect(result.canonical).toBe(enUrl);
    expect(result.languages).toEqual({
      en: enUrl,
      "x-default": enUrl,
    });
  });

  it("en+ar: languages map contains en, ar, and exactly one x-default (reciprocal)", async () => {
    const { buildAlternates, localeUrl } = await import("@/lib/seo/alternates");
    const result = buildAlternates(["en", "ar"], "/products/rice", "en");
    const enUrl = localeUrl("en", "/products/rice");
    const arUrl = localeUrl("ar", "/products/rice");

    expect(result.languages).toEqual({
      en: enUrl,
      ar: arUrl,
      "x-default": enUrl,
    });
    expect(Object.keys(result.languages as Record<string, string>).filter((k) => k === "x-default")).toHaveLength(1);
  });

  it("canonical for an English page is the un-prefixed English URL", async () => {
    const { buildAlternates, localeUrl } = await import("@/lib/seo/alternates");
    const result = buildAlternates(["en", "ar", "fr", "ru"], "/products/rice", "en");
    expect(result.canonical).toBe(localeUrl("en", "/products/rice"));
  });

  // D-50 regression: canonical used to be hardcoded to the English URL for
  // EVERY locale — so /ar/products/rice's own canonical pointed at the
  // English page, telling Google the Arabic page isn't authoritative and
  // suppressing it from ranking. Canonical must self-reference whichever
  // locale is currently rendering; x-default/languages stay English/full
  // set respectively, only canonical changes per locale.
  it("canonical for a non-English page self-references that locale, not English", async () => {
    const { buildAlternates, localeUrl } = await import("@/lib/seo/alternates");
    const result = buildAlternates(["en", "ar", "fr", "ru"], "/products/rice", "ar");
    expect(result.canonical).toBe(localeUrl("ar", "/products/rice"));
    expect(result.canonical).not.toBe(localeUrl("en", "/products/rice"));
    // x-default and the full languages map are unaffected by currentLocale.
    expect(result.languages?.["x-default" as keyof typeof result.languages]).toBe(localeUrl("en", "/products/rice"));
  });
});
