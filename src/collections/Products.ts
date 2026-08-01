import type { CollectionConfig, Field } from "payload";
import { revalidateProduct } from "@/hooks/revalidateCatalog";

// Shared row shape for the four specs.* arrays below — kept as a function
// (not a shared array constant) since Payload field arrays are consumed by
// reference internally; a shared constant would alias the same field
// objects across all four arrays.
function specRowFields(): Field[] {
  return [
    { name: "parameter", type: "text", required: true },
    { name: "value", type: "text", required: true },
    { name: "unit", type: "text" },
    { name: "method", type: "text", admin: { description: "Test method, e.g. \"AOAC 925.10\"." } },
  ];
}

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
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        // T-103/MASTER_PLAN §7.3: optional shot-type tag for the product
        // template's gallery layout (e.g. lead with "pack", group "macro"
        // detail shots). Optional — existing rows without a role still render.
        {
          name: "role",
          type: "select",
          options: [
            { label: "Pack shot", value: "pack" },
            { label: "Macro detail", value: "macro" },
            { label: "Context / in-use", value: "context" },
          ],
        },
      ],
    },
    // D-04: both label and value localized. Setting localized:true on the
    // ARRAY field cascades to every nested field automatically — do NOT
    // re-set localized on the nested fields themselves (Pitfall 3, same
    // cascade already proven live in this repo's Pages.ts `layout` field).
    //
    // T-103/MASTER_PLAN §7.3: kept alongside the new `specs` group below
    // rather than replaced. Live production already has real specification
    // rows entered against this flat shape for the real catalog; the LOCKED
    // §7.3 shape (specs split into physicoChemical/organoleptic/
    // microbiological/contaminants) is additive so no existing content is
    // silently dropped by this migration. Recategorizing existing rows into
    // the new per-type arrays is an editor task (T-110), not an automated
    // migration — there's no reliable way to infer which category a given
    // row belongs to. See DECISION_LOG D-30.
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
    {
      name: "applications",
      type: "text",
      hasMany: true,
      localized: true,
      admin: { description: "e.g. \"Bakery fillings\", \"Retail frozen aisle\" — short use-case tags." },
    },
    {
      type: "group",
      name: "specs",
      label: "Structured specifications",
      admin: {
        description:
          "T-103/MASTER_PLAN §7.3: buyer-facing spec sheet, split by category. Each row: parameter, value, optional unit + test method. Leave a category empty to omit it from the product page.",
      },
      fields: [
        { name: "physicoChemical", type: "array", localized: true, fields: specRowFields() },
        { name: "organoleptic", type: "array", localized: true, fields: specRowFields() },
        { name: "microbiological", type: "array", localized: true, fields: specRowFields() },
        { name: "contaminants", type: "array", localized: true, fields: specRowFields() },
      ],
    },
    {
      name: "packagingOptions",
      type: "array",
      admin: { description: "T-103/MASTER_PLAN §7.3: packaging formats offered for this product." },
      fields: [
        { name: "format", type: "text", localized: true, required: true, admin: { description: "e.g. \"IQF pouch\", \"Aseptic drum\"." } },
        { name: "netWeight", type: "text", required: true, admin: { description: "e.g. \"1 kg\", \"200 L\"." } },
        { name: "unitsPerCarton", type: "number" },
        { name: "cartonsPerPallet", type: "number" },
      ],
    },
    {
      type: "group",
      name: "containerLoading",
      label: "Container loading",
      admin: { description: "T-103/MASTER_PLAN §7.3: shown to buyers sizing a shipment." },
      fields: [
        { name: "teu20Units", type: "number", label: "Units per 20' container" },
        { name: "teu20NetMT", type: "number", label: "Net metric tons per 20' container" },
        { name: "palletNote", type: "text", localized: true },
      ],
    },
    { name: "shelfLife", type: "text", localized: true, admin: { description: "e.g. \"24 months from date of manufacture\"." } },
    { name: "storageTemp", type: "text", localized: true, admin: { description: "e.g. \"-18°C or below\"." } },
    { name: "moqRange", type: "text", localized: true, label: "MOQ range", admin: { description: "e.g. \"1 x 20' container\"." } },
    {
      name: "faq",
      type: "array",
      localized: true,
      label: "Product FAQ",
      fields: [
        { name: "q", type: "text", required: true },
        { name: "a", type: "textarea", required: true },
      ],
    },
    {
      name: "downloads",
      type: "array",
      label: "Downloads",
      admin: { description: "Spec sheets, COAs, other per-product documents. Label is localized, file is not." },
      fields: [
        { name: "label", type: "text", localized: true, required: true },
        { name: "file", type: "upload", relationTo: "media", required: true },
      ],
    },
    {
      type: "group",
      name: "seo",
      label: "SEO overrides",
      admin: {
        description: "Optional per-product overrides. Leave blank to fall back to name / shortDescription (buildMetadata's existing default).",
      },
      fields: [
        { name: "title", type: "text", localized: true },
        { name: "description", type: "textarea", localized: true },
        { name: "ogImage", type: "upload", relationTo: "media" },
      ],
    },
    // NOT localized — a cert relation is the same set of documents in every
    // locale (each Certification doc carries its own localized name/body).
    { name: "certifications", type: "relationship", relationTo: "certifications", hasMany: true },
    // Editor-controlled sort order, avoids hard-coding order in the query.
    { name: "displayOrder", type: "number", defaultValue: 0 },
    { name: "published", type: "checkbox", defaultValue: true },
  ],
  hooks: { afterChange: [revalidateProduct] },
};
