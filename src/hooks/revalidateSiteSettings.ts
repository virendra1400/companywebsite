import type { GlobalAfterChangeHook } from "payload";
import { revalidatePath } from "next/cache";

// SiteSettings (siteName/logo) is rendered in the shared (site)/[locale] layout
// chrome (header/footer/mobile) on EVERY page. A path revalidate isn't enough —
// bust the LAYOUT segment for each locale so all pages pick up the new brand.
export const revalidateSiteSettings: GlobalAfterChangeHook = ({ doc, req: { context } }) => {
  if (!context.disableRevalidate) {
    // type: "layout" cascades to every page nested under that locale segment.
    revalidatePath("/", "layout");
    revalidatePath("/ar", "layout");
    revalidatePath("/fr", "layout");
    revalidatePath("/ru", "layout");
    // icon.tsx lives at the true app root, outside every locale layout above
    // — it's prerendered as a static route (Next has no dynamic API usage to
    // key off) and only picks up a new CMS favicon via this explicit bust.
    revalidatePath("/icon");
  }
  return doc;
};
