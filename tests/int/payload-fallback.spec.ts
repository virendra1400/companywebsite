import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Payload } from "payload";
import { getTestPayload } from "./config";
import { getHomeContent } from "@/lib/payload-fetch";

// FOUND-06/D-06: getHomeContent's isTranslated flag drives the
// English-plus-notice fallback rule — must be true only when the active
// locale (non-English) has real, non-fallback content.
describe("getHomeContent fallback-detection helper", () => {
  let payload: Payload;

  beforeAll(async () => {
    payload = await getTestPayload();
    await payload.updateGlobal({
      slug: "home",
      locale: "en",
      data: { heroHeadline: "Star Agrevolution" },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
  });

  afterAll(async () => {
    await payload.destroy();
  });

  it("en is always treated as translated", async () => {
    const { content, isTranslated } = await getHomeContent("en");
    expect(isTranslated).toBe(true);
    expect(content.heroHeadline).toBe("Star Agrevolution");
  });

  it("untranslated fr falls back to English content with isTranslated:false", async () => {
    const { content, isTranslated } = await getHomeContent("fr");
    expect(isTranslated).toBe(false);
    expect(content.heroHeadline).toBe("Star Agrevolution");
  });

  it("once fr has real content, isTranslated becomes true", async () => {
    await payload.updateGlobal({
      slug: "home",
      locale: "fr",
      data: { heroHeadline: "Star Agrevolution FR" },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });

    const { content, isTranslated } = await getHomeContent("fr");
    expect(isTranslated).toBe(true);
    expect(content.heroHeadline).toBe("Star Agrevolution FR");
  });
});
