import type { CollectionConfig } from "payload";

// T-103/MASTER_PLAN §7.3: downloadable buyer collateral (catalog PDF,
// brochures) shown on a future /resources hub (T-202). Distinct from
// Products.downloads (per-product spec sheets) — this collection is for
// documents that aren't scoped to one product.
export const Resources: CollectionConfig = {
  slug: "resources",
  admin: { useAsTitle: "title" },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Catalog", value: "catalog" },
        { label: "Brochure", value: "brochure" },
        { label: "Spec sheet", value: "spec-sheet" },
        { label: "Certificate", value: "certificate" },
        { label: "Other", value: "other" },
      ],
    },
    { name: "file", type: "upload", relationTo: "media", required: true },
    // Optional — ties a resource to one product without requiring it.
    { name: "product", type: "relationship", relationTo: "products" },
    { name: "displayOrder", type: "number", defaultValue: 0 },
  ],
};
