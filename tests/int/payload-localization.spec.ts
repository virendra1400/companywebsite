import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Payload } from "payload";
import { getTestPayload } from "./config";

// CMS-02/FOUND-02: Home has a field-level localized:true field; querying a
// non-English locale with fallbackLocale:false must return null/undefined
// when untranslated, while the display query (fallback on) returns English.
describe("Payload localization (Home global)", () => {
  let payload: Payload;

  beforeAll(async () => {
    payload = await getTestPayload();
    await payload.updateGlobal({
      slug: "home",
      locale: "en",
      data: { heroHeadline: "Star Agrevolution", heroSubhead: "Premium agro exports" },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
  });

  afterAll(async () => {
    await payload.destroy();
  });

  it("existence check (fallbackLocale:false) returns no ar value when untranslated", async () => {
    const nativeAr = await payload.findGlobal({
      slug: "home",
      locale: "ar",
      fallbackLocale: false,
      overrideAccess: true,
    });
    expect(nativeAr.heroHeadline).toBeFalsy();
  });

  it("display query (fallback on) returns English content for untranslated ar", async () => {
    const displayAr = await payload.findGlobal({
      slug: "home",
      locale: "ar",
      fallbackLocale: "en",
      overrideAccess: true,
    });
    expect(displayAr.heroHeadline).toBe("Star Agrevolution");
  });
});
