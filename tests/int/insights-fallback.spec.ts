import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Payload } from "payload";
import { getTestPayload } from "./config";

// Mirrors pages-fallback.spec.ts, retargeted at the insights collection.
// src/lib/seo/translated-locales.ts (05-02) had not landed at the time this
// spec was authored, so the existence-check is exercised directly against
// the raw payload.find dual-query shape (payload-fetch.ts's getPageContent
// pattern) rather than through the not-yet-existing helper — this keeps the
// spec self-contained on the Insights collection alone (05-01 scope).
async function nativeExists(payload: Payload, slug: string, locale: "en" | "fr") {
  const result = await payload.find({
    collection: "insights",
    where: { slug: { equals: slug } },
    limit: 1,
    locale,
    fallbackLocale: false,
    overrideAccess: true,
  });
  return locale === "en" || Boolean(result.docs[0]?.title);
}

function lexicalRoot(text: string) {
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: [
        {
          type: "paragraph",
          format: "" as const,
          indent: 0,
          version: 1,
          direction: "ltr" as const,
          textFormat: 0,
          children: [
            { type: "text", detail: 0, format: 0, mode: "normal", style: "", text, version: 1 },
          ],
        },
      ],
    },
  };
}

describe("insights collection translation-status existence check", () => {
  let payload: Payload;
  let mediaId: number;
  let insightId: number;

  beforeAll(async () => {
    payload = await getTestPayload();

    const media = await payload.create({
      collection: "media",
      data: { alt: "Basmati rice sample" },
      filePath: "scripts/seed-assets/product-basmati-rice.svg",
      overrideAccess: true,
    });
    mediaId = media.id;

    const insight = await payload.create({
      collection: "insights",
      locale: "en",
      data: {
        title: "Fallback Test Insight",
        slug: "fallback-test-insight",
        excerpt: "Fallback fixture excerpt.",
        coverImage: mediaId,
        body: lexicalRoot("Fallback fixture body."),
      },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    insightId = insight.id;
  });

  afterAll(async () => {
    await payload.delete({ collection: "insights", id: insightId, overrideAccess: true });
    await payload.delete({ collection: "media", id: mediaId, overrideAccess: true });
    await payload.destroy();
  });

  it("en is always treated as translated", async () => {
    expect(await nativeExists(payload, "fallback-test-insight", "en")).toBe(true);
  });

  it("untranslated fr has isTranslated:false via the native (fallbackLocale:false) check", async () => {
    expect(await nativeExists(payload, "fallback-test-insight", "fr")).toBe(false);
  });

  it("once fr has real content, isTranslated becomes true", async () => {
    await payload.update({
      collection: "insights",
      id: insightId,
      locale: "fr",
      data: { title: "Fallback Test Insight FR" },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });

    expect(await nativeExists(payload, "fallback-test-insight", "fr")).toBe(true);
  });
});
