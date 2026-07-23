import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Payload } from "payload";

// SEO-03: fixed base BEFORE anything under test imports src/lib/seo/alternates.ts
// (its BASE constant is read from process.env at module-eval time — mirrors the
// existing pattern of setting up env/mocks before the first dynamic import in
// products-revalidate-hook.spec.ts / pages-revalidate-hook.spec.ts).
process.env.NEXT_PUBLIC_SITE_URL = "https://example.test";
const BASE = "https://example.test";

const { getTestPayload } = await import("./config");
const sitemap = (await import("@/app/sitemap")).default;

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
          children: [{ type: "text", detail: 0, format: 0, mode: "normal", style: "", text, version: 1 }],
        },
      ],
    },
  };
}

describe("sitemap.ts", () => {
  let payload: Payload;
  let categoryId: number;
  let mediaId: number;
  let publishedProductId: number;
  let draftProductId: number;
  let publishedInsightId: number;
  let draftInsightId: number;

  beforeAll(async () => {
    payload = await getTestPayload();

    const category = await payload.create({
      collection: "categories",
      data: { name: "Sitemap Test Category", slug: "sitemap-test-category" },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    categoryId = category.id;

    const media = await payload.create({
      collection: "media",
      data: { alt: "Sitemap test cover" },
      filePath: "scripts/seed-assets/product-basmati-rice.svg",
      overrideAccess: true,
    });
    mediaId = media.id;

    const publishedProduct = await payload.create({
      collection: "products",
      data: {
        name: "Sitemap Published Product",
        slug: "sitemap-published-product",
        category: categoryId,
        shortDescription: "Published product fixture.",
        published: true,
      },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    publishedProductId = publishedProduct.id;

    const draftProduct = await payload.create({
      collection: "products",
      data: {
        name: "Sitemap Draft Product",
        slug: "sitemap-draft-product",
        category: categoryId,
        shortDescription: "Draft product fixture.",
        published: false,
      },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    draftProductId = draftProduct.id;

    const publishedInsight = await payload.create({
      collection: "insights",
      locale: "en",
      data: {
        title: "Sitemap Published Insight",
        slug: "sitemap-published-insight",
        excerpt: "Published insight fixture.",
        coverImage: mediaId,
        body: lexicalRoot("Published insight body."),
        published: true,
      },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    publishedInsightId = publishedInsight.id;

    const draftInsight = await payload.create({
      collection: "insights",
      locale: "en",
      data: {
        title: "Sitemap Draft Insight",
        slug: "sitemap-draft-insight",
        excerpt: "Draft insight fixture.",
        coverImage: mediaId,
        body: lexicalRoot("Draft insight body."),
        published: false,
      },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    draftInsightId = draftInsight.id;
  });

  afterAll(async () => {
    await payload.delete({ collection: "insights", id: publishedInsightId, overrideAccess: true });
    await payload.delete({ collection: "insights", id: draftInsightId, overrideAccess: true });
    await payload.delete({ collection: "products", id: publishedProductId, overrideAccess: true });
    await payload.delete({ collection: "products", id: draftProductId, overrideAccess: true });
    await payload.delete({ collection: "media", id: mediaId, overrideAccess: true });
    await payload.delete({ collection: "categories", id: categoryId, overrideAccess: true });
    await payload.destroy();
  });

  it("returns a non-empty array whose entries all start with the configured base URL", async () => {
    const entries = await sitemap();
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      expect(entry.url.startsWith(BASE)).toBe(true);
    }
  });

  it("includes the published product's en URL and excludes draft product/insight slugs entirely (Pitfall 2)", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);

    expect(urls).toContain(`${BASE}/products/sitemap-published-product`);
    expect(urls.some((u) => u.includes("sitemap-draft-product"))).toBe(false);
    expect(urls.some((u) => u.includes("sitemap-draft-insight"))).toBe(false);
    expect(urls).toContain(`${BASE}/insights/sitemap-published-insight`);
  });

  it("never emits two entries with the same url (no duplicate <url>)", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("emits a home entry whose en URL is the bare base (no /en prefix, SEO-05)", async () => {
    const entries = await sitemap();
    expect(entries.some((e) => e.url === BASE)).toBe(true);
  });

  it("every entry carries an alternates.languages map with exactly one x-default key", async () => {
    const entries = await sitemap();
    expect(entries.length).toBeGreaterThan(0);
    for (const entry of entries) {
      const languages = entry.alternates?.languages;
      expect(languages).toBeTruthy();
      const xDefaultKeys = Object.keys(languages ?? {}).filter((k) => k === "x-default");
      expect(xDefaultKeys.length).toBe(1);
    }
  });

  it("still returns a valid non-throwing array (home + products) with zero published insights", async () => {
    await payload.delete({ collection: "insights", id: publishedInsightId, overrideAccess: true });
    await payload.delete({ collection: "insights", id: draftInsightId, overrideAccess: true });

    let entries: Awaited<ReturnType<typeof sitemap>> = [];
    await expect(
      (async () => {
        entries = await sitemap();
      })(),
    ).resolves.not.toThrow();

    expect(entries.some((e) => e.url === BASE)).toBe(true);
    expect(entries.some((e) => e.url === `${BASE}/products/sitemap-published-product`)).toBe(true);
    // The /insights hub is a locale-invariant listing route (WR-02) — it stays
    // in the sitemap even with zero articles. Only per-article detail entries
    // should disappear.
    expect(entries.some((e) => e.url === `${BASE}/insights`)).toBe(true);
    expect(entries.some((e) => e.url.includes("/insights/"))).toBe(false);

    // Recreate so afterAll's deletes stay valid (avoids deleting an
    // already-deleted id).
    const recreatedPublished = await payload.create({
      collection: "insights",
      locale: "en",
      data: {
        title: "Sitemap Published Insight",
        slug: "sitemap-published-insight-2",
        excerpt: "Published insight fixture.",
        coverImage: mediaId,
        body: lexicalRoot("Published insight body."),
        published: true,
      },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    publishedInsightId = recreatedPublished.id;
    const recreatedDraft = await payload.create({
      collection: "insights",
      locale: "en",
      data: {
        title: "Sitemap Draft Insight",
        slug: "sitemap-draft-insight-2",
        excerpt: "Draft insight fixture.",
        coverImage: mediaId,
        body: lexicalRoot("Draft insight body."),
        published: false,
      },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    draftInsightId = recreatedDraft.id;
  });
});
