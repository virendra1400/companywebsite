import type { Block } from "payload";

// UI-SPEC §2a TrustBar — generic, editor-authored partner/importer logo-label
// row. Deliberately standalone: does NOT reuse or extend CertStrip's
// Certifications-collection binding (D-03) — CertStrip reads from the
// Certifications collection at render time, this block has zero collection
// dependency. Field-level localization NOT set here — cascades from
// Pages.layout (RESEARCH Pattern 2).
export const TrustBar: Block = {
  slug: "trustBar",
  labels: { singular: "Trust Bar", plural: "Trust Bars" },
  fields: [
    { name: "sectionTitle", type: "text" },
    {
      name: "items",
      type: "array",
      fields: [
        // logo is OPTIONAL (unlike MediaGallery's required image) — an item
        // with no logo yet still renders as an honest text chip, never a
        // broken image box.
        { name: "logo", type: "upload", relationTo: "media" },
        { name: "name", type: "text", required: true },
      ],
    },
  ],
};
