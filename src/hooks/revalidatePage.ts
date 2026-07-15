import type { CollectionAfterChangeHook } from "payload";
import { revalidatePath } from "next/cache";

// CMS-03: publishing a Pages doc triggers on-demand ISR revalidation for
// every locale path — no rebuild. Generalizes revalidateHome (RESEARCH
// Pattern 5): slug "home" maps to the root path, every other slug to
// `/${slug}`, mirrored across the 4 locale path-prefixes.
export const revalidatePage: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    const path: string = doc.slug === "home" ? "/" : `/${doc.slug}`;
    revalidatePath(path);
    revalidatePath(path === "/" ? "/ar" : `/ar${path}`);
    revalidatePath(path === "/" ? "/fr" : `/fr${path}`);
    revalidatePath(path === "/" ? "/ru" : `/ru${path}`);
  }
  return doc;
};
