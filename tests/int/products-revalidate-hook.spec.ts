import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { Payload } from "payload";

// Mirrors pages-revalidate-hook.spec.ts: mock next/cache before any module in
// the import chain (config -> payload.config -> collections/Products ->
// hooks/revalidateCatalog) pulls it in, so the hooks call our spy instead of
// the real Next.js cache API (which throws outside a request/render context).
const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath }));

const { getTestPayload } = await import("./config");

describe("revalidateCatalog afterChange hooks", () => {
  let payload: Payload;
  let categoryId: number;
  let productId: number;

  beforeAll(async () => {
    payload = await getTestPayload();

    const category = await payload.create({
      collection: "categories",
      data: { name: "Revalidate Test Category", slug: "revalidate-test-category" },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    categoryId = category.id;

    const product = await payload.create({
      collection: "products",
      data: {
        name: "Revalidate Test Product",
        slug: "revalidate-test-product",
        category: categoryId,
        shortDescription: "Revalidate hook fixture.",
      },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    productId = product.id;
  });

  afterAll(async () => {
    await payload.delete({ collection: "products", id: productId, overrideAccess: true });
    await payload.delete({ collection: "categories", id: categoryId, overrideAccess: true });
    await payload.destroy();
  });

  it("revalidateCategory revalidates only the 4 '/products' index paths", async () => {
    revalidatePath.mockClear();

    await payload.update({
      collection: "categories",
      id: categoryId,
      data: { name: "Revalidate Test Category Updated" },
      overrideAccess: true,
    });

    expect(revalidatePath).toHaveBeenCalledWith("/products");
    expect(revalidatePath).toHaveBeenCalledWith("/ar/products");
    expect(revalidatePath).toHaveBeenCalledWith("/fr/products");
    expect(revalidatePath).toHaveBeenCalledWith("/ru/products");
    expect(revalidatePath).toHaveBeenCalledTimes(4);
  });

  it("revalidateProduct revalidates the 4 index paths AND the 4 detail paths", async () => {
    revalidatePath.mockClear();

    await payload.update({
      collection: "products",
      id: productId,
      data: { name: "Revalidate Test Product Updated" },
      overrideAccess: true,
    });

    expect(revalidatePath).toHaveBeenCalledWith("/products");
    expect(revalidatePath).toHaveBeenCalledWith("/ar/products");
    expect(revalidatePath).toHaveBeenCalledWith("/fr/products");
    expect(revalidatePath).toHaveBeenCalledWith("/ru/products");
    expect(revalidatePath).toHaveBeenCalledWith("/products/revalidate-test-product");
    expect(revalidatePath).toHaveBeenCalledWith("/ar/products/revalidate-test-product");
    expect(revalidatePath).toHaveBeenCalledWith("/fr/products/revalidate-test-product");
    expect(revalidatePath).toHaveBeenCalledWith("/ru/products/revalidate-test-product");
    expect(revalidatePath).toHaveBeenCalledTimes(8);
  });

  it("skips revalidation entirely when context.disableRevalidate is set", async () => {
    revalidatePath.mockClear();

    await payload.update({
      collection: "products",
      id: productId,
      data: { name: "Revalidate Test Product No Revalidate" },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });

    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
