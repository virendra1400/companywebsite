import type { CollectionConfig } from "payload";
import { revalidateCategory } from "@/hooks/revalidateCatalog";

// RESEARCH D-01 / Pattern 1: flat, localized collection mirroring
// Certifications.ts's access/localization shape exactly. `image` and
// `shortDescription` are schema-present but not rendered by the CatalogIndex
// this phase (RESEARCH A3) — future-proofing for CAT-03 without a redesign.
export const Categories: CollectionConfig = {
  slug: "categories",
  admin: { useAsTitle: "name" },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: "name", type: "text", required: true, localized: true },
    // NOT localized — one canonical URL segment, same as Pages.slug.
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "shortDescription", type: "textarea", localized: true },
    { name: "image", type: "upload", relationTo: "media" },
    // Editor-controlled sort order, avoids hard-coding order in the query.
    { name: "displayOrder", type: "number", defaultValue: 0 },
  ],
  hooks: { afterChange: [revalidateCategory] },
};
