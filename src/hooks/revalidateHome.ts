import type { GlobalAfterChangeHook } from "payload";
import { revalidatePath } from "next/cache";

// CMS-03: publishing the Home global triggers on-demand ISR revalidation for
// every locale path — no rebuild. RESEARCH Pattern 6.
export const revalidateHome: GlobalAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    revalidatePath("/"); // en (root, per D-05 path-prefix)
    revalidatePath("/ar");
    revalidatePath("/fr");
    revalidatePath("/ru");
  }
  return doc;
};
