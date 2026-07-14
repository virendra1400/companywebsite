import type { GlobalConfig } from "payload";
import { revalidateHome } from "@/hooks/revalidateHome";

// CMS-02: field-level localized:true per RESEARCH Pattern 5/State-of-the-Art —
// NOT the ARCHITECTURE.md document-split sketch (superseded now that D-01
// locked Payload). English is defaultLocale + fallback:true (payload.config.ts).
export const Home: GlobalConfig = {
  slug: "home",
  access: {
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: "heroHeadline",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "heroSubhead",
      type: "text",
      localized: true,
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
    },
  ],
  hooks: {
    afterChange: [revalidateHome],
  },
};
