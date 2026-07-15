import type { CollectionConfig } from "payload";
import { revalidateProduct } from "@/hooks/revalidateCatalog";

// RESEARCH D-02/D-04 / Pattern 2: typed, localized Products collection —
// deliberately NOT a Phase 2 Blocks page-builder entry (products are uniform
// structured data, not freeform editorial layout).
export const Products: CollectionConfig = {
  slug: "products",
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
    // NOT localized — a product belongs to the same category in every locale.
    { name: "category", type: "relationship", relationTo: "categories", required: true },
    { name: "shortDescription", type: "textarea", required: true, localized: true },
    { name: "description", type: "richText", localized: true },
    // NOT localized — photography carries no per-locale meaning (UI-SPEC RTL
    // Extensions: gallery order is source/CMS order in every locale). Pitfall 4.
    {
      name: "imageGallery",
      type: "array",
      fields: [{ name: "image", type: "upload", relationTo: "media", required: true }],
    },
    // D-04: both label and value localized. Setting localized:true on the
    // ARRAY field cascades to every nested field automatically — do NOT
    // re-set localized on the nested fields themselves (Pitfall 3, same
    // cascade already proven live in this repo's Pages.ts `layout` field).
    {
      name: "specifications",
      type: "array",
      localized: true,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "value", type: "text", required: true },
      ],
    },
    { name: "packaging", type: "text", localized: true },
    // NOT localized — a cert relation is the same set of documents in every
    // locale (each Certification doc carries its own localized name/body).
    { name: "certifications", type: "relationship", relationTo: "certifications", hasMany: true },
    // Editor-controlled sort order, avoids hard-coding order in the query.
    { name: "displayOrder", type: "number", defaultValue: 0 },
    { name: "published", type: "checkbox", defaultValue: true },
  ],
  hooks: { afterChange: [revalidateProduct] },
};
