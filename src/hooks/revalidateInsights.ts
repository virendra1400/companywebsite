import type { CollectionAfterChangeHook } from "payload";
import { revalidatePath } from "next/cache";

// BLOG-02: adapts revalidateCatalog.ts's exact per-locale revalidatePath
// mechanics to the new Insights collection. An article change affects BOTH
// the index ('/insights') AND its own detail path ('/insights/<slug>').
function revalidateAllLocales(path: string) {
  revalidatePath(path);
  revalidatePath(`/ar${path}`);
  revalidatePath(`/fr${path}`);
  revalidatePath(`/ru${path}`);
}

export const revalidateInsight: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidateAllLocales("/insights");
    revalidateAllLocales(`/insights/${doc.slug}`);
  }
  return doc;
};
