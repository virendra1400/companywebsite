import type { CollectionAfterChangeHook } from "payload";
import { revalidatePath } from "next/cache";

// Certifications feed CertStripBlock on both /certifications and / (home) —
// revalidate every locale of both, same per-locale mechanics as
// revalidatePage.ts/revalidateCatalog.ts. Previously missing entirely: any
// admin edit to this collection needed a manual redeploy to go live.
function revalidateAllLocales(path: string) {
  revalidatePath(path);
  revalidatePath(path === "/" ? "/ar" : `/ar${path}`);
  revalidatePath(path === "/" ? "/fr" : `/fr${path}`);
  revalidatePath(path === "/" ? "/ru" : `/ru${path}`);
}

export const revalidateCertifications: CollectionAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidateAllLocales("/certifications");
    revalidateAllLocales("/");
  }
  return doc;
};
