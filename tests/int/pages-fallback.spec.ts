import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Payload } from "payload";
import { getTestPayload } from "./config";
import { getPageContent } from "@/lib/payload-fetch";

// TRUST-06/FOUND-06: getPageContent's isTranslated flag drives the
// English-plus-notice fallback rule — must be true only when the active
// locale (non-English) has real, non-fallback content. Mirrors the retired
// payload-fallback.spec.ts (Home global), generalized to the Pages collection.
describe("getPageContent fallback-detection helper", () => {
  let payload: Payload;
  let pageId: number;

  beforeAll(async () => {
    payload = await getTestPayload();
    const doc = await payload.create({
      collection: "pages",
      locale: "en",
      data: {
        title: "Star Agrevolution",
        slug: "fallback-test",
        layout: [{ blockType: "hero", variant: "compact", headline: "Star Agrevolution" }],
      },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    pageId = doc.id;
  });

  afterAll(async () => {
    await payload.delete({ collection: "pages", id: pageId, overrideAccess: true });
    await payload.destroy();
  });

  it("en is always treated as translated", async () => {
    const { page, isTranslated } = await getPageContent("fallback-test", "en");
    expect(isTranslated).toBe(true);
    expect(page?.title).toBe("Star Agrevolution");
  });

  it("untranslated fr falls back to English content with isTranslated:false", async () => {
    const { page, isTranslated } = await getPageContent("fallback-test", "fr");
    expect(isTranslated).toBe(false);
    expect(page?.title).toBe("Star Agrevolution");
  });

  it("once fr has real content, isTranslated becomes true", async () => {
    await payload.update({
      collection: "pages",
      id: pageId,
      locale: "fr",
      data: { title: "Star Agrevolution FR" },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });

    const { page, isTranslated } = await getPageContent("fallback-test", "fr");
    expect(isTranslated).toBe(true);
    expect(page?.title).toBe("Star Agrevolution FR");
  });

  it("returns page:null for a slug that does not exist", async () => {
    const { page, isTranslated } = await getPageContent("does-not-exist", "en");
    expect(page).toBeNull();
    expect(isTranslated).toBe(true);
  });
});
