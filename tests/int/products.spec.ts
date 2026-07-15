import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Payload } from "payload";
import { getTestPayload } from "./config";
import { getProductsByCategory, getProduct } from "@/lib/payload-fetch";

// CAT-01/CAT-02/Pitfall 3: getProductsByCategory/getProduct are the catalog
// route plans' entire data source. Covers grouping + displayOrder, published
// exclusion (T-03-01), an empty category, en->fr fallback-detection (mirrors
// pages-fallback.spec.ts), and the specifications localized-array-only
// cascade (no fallback bleed between locales).
describe("catalog fetch helpers", () => {
  let payload: Payload;
  let categoryWithProductsId: number;
  let emptyCategoryId: number;
  let publishedProductId: number;
  let draftProductId: number;
  let cascadeProductId: number;

  beforeAll(async () => {
    payload = await getTestPayload();

    const categoryWithProducts = await payload.create({
      collection: "categories",
      locale: "en",
      data: { name: "Grains", slug: "grains-test", displayOrder: 1 },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    categoryWithProductsId = categoryWithProducts.id;

    const emptyCategory = await payload.create({
      collection: "categories",
      locale: "en",
      data: { name: "Oilseeds", slug: "oilseeds-test", displayOrder: 2 },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    emptyCategoryId = emptyCategory.id;

    const publishedProduct = await payload.create({
      collection: "products",
      locale: "en",
      data: {
        name: "Test Basmati Rice",
        slug: "test-basmati-rice",
        category: categoryWithProductsId,
        shortDescription: "Premium long-grain rice.",
        published: true,
        displayOrder: 1,
      },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    publishedProductId = publishedProduct.id;

    const draftProduct = await payload.create({
      collection: "products",
      locale: "en",
      data: {
        name: "Test Draft Sesame",
        slug: "test-draft-sesame",
        category: categoryWithProductsId,
        shortDescription: "Not yet published.",
        published: false,
        displayOrder: 2,
      },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    draftProductId = draftProduct.id;

    // Pitfall 3 fixture: created with en spec rows, then updated with
    // DIFFERENT fr spec rows below (in the cascade test itself).
    const cascadeProduct = await payload.create({
      collection: "products",
      locale: "en",
      data: {
        name: "Test Cascade Product",
        slug: "test-cascade-product",
        category: categoryWithProductsId,
        shortDescription: "Cascade fixture.",
        published: true,
        specifications: [{ label: "Origin", value: "India" }],
      },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    cascadeProductId = cascadeProduct.id;
  });

  afterAll(async () => {
    await payload.delete({ collection: "products", id: publishedProductId, overrideAccess: true });
    await payload.delete({ collection: "products", id: draftProductId, overrideAccess: true });
    await payload.delete({ collection: "products", id: cascadeProductId, overrideAccess: true });
    await payload.delete({ collection: "categories", id: categoryWithProductsId, overrideAccess: true });
    await payload.delete({ collection: "categories", id: emptyCategoryId, overrideAccess: true });
    await payload.destroy();
  });

  it("groups products by category ordered by displayOrder", async () => {
    const grouped = await getProductsByCategory("en");
    const ids = grouped.map((g) => g.category.id);
    expect(ids.indexOf(categoryWithProductsId)).toBeLessThan(ids.indexOf(emptyCategoryId));
  });

  it("an empty category yields products: []", async () => {
    const grouped = await getProductsByCategory("en");
    const empty = grouped.find((g) => g.category.id === emptyCategoryId);
    expect(empty?.products).toEqual([]);
  });

  it("excludes a published:false product from every category's products list", async () => {
    const grouped = await getProductsByCategory("en");
    const withProducts = grouped.find((g) => g.category.id === categoryWithProductsId);
    const productIds = withProducts?.products.map((p) => p.id) ?? [];
    expect(productIds).toContain(publishedProductId);
    expect(productIds).not.toContain(draftProductId);
  });

  it("getProduct for an en-only product falls back to English for fr with isTranslated:false", async () => {
    const { product, isTranslated } = await getProduct("test-basmati-rice", "fr");
    expect(product).not.toBeNull();
    expect(product?.name).toBe("Test Basmati Rice");
    expect(isTranslated).toBe(false);
  });

  it("getProduct for en locale is always isTranslated:true", async () => {
    const { product, isTranslated } = await getProduct("test-basmati-rice", "en");
    expect(product?.name).toBe("Test Basmati Rice");
    expect(isTranslated).toBe(true);
  });

  it("specifications cascade: fr rows are independent of en rows (no fallback bleed)", async () => {
    await payload.update({
      collection: "products",
      id: cascadeProductId,
      locale: "fr",
      data: {
        name: "Produit Cascade Test",
        shortDescription: "Fixture cascade.",
        specifications: [{ label: "Origine", value: "Inde" }, { label: "Type", value: "Long grain" }],
      },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });

    const { product: frProduct } = await getProduct("test-cascade-product", "fr");
    const frSpecs = frProduct?.specifications?.map(({ label, value }) => ({ label, value }));
    expect(frSpecs).toEqual([
      { label: "Origine", value: "Inde" },
      { label: "Type", value: "Long grain" },
    ]);

    const { product: enProduct } = await getProduct("test-cascade-product", "en");
    const enSpecs = enProduct?.specifications?.map(({ label, value }) => ({ label, value }));
    expect(enSpecs).toEqual([{ label: "Origin", value: "India" }]);
  });
});
