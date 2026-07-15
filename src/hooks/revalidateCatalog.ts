import type { CollectionAfterChangeHook } from "payload";
import { revalidatePath } from "next/cache";

// CAT-03: adapts revalidatePage.ts's exact per-locale revalidatePath mechanics
// to the new Categories/Products collections. A Category change only affects
// the catalog INDEX (D-05: flat grouping, no per-category landing page) —
// revalidate '/products' only. A Product change affects BOTH the index (a
// card may appear/disappear from a section) AND its own detail path.
function revalidateAllLocales(path: string) {
  revalidatePath(path);
  revalidatePath(`/ar${path}`);
  revalidatePath(`/fr${path}`);
  revalidatePath(`/ru${path}`);
}

export const revalidateCategory: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) revalidateAllLocales("/products");
  return doc;
};

export const revalidateProduct: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidateAllLocales("/products");
    revalidateAllLocales(`/products/${doc.slug}`);
  }
  return doc;
};
