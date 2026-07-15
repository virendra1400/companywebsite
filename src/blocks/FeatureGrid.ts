import type { Block } from "payload";

// UI-SPEC Block Library #3 — one block, one `variant` flag (icon | photo)
// covers both the homepage value-props section AND the Company/Compliance
// leadership-bios section, per UI-SPEC "one block type, not two separate
// blocks". Field-level localization is NOT set here — Pages.layout's
// top-level localized:true cascades to every nested field (RESEARCH
// Pattern 2), matching Hero.ts/CertStrip.ts precedent.
export const FeatureGrid: Block = {
  slug: "featureGrid",
  labels: { singular: "Feature Grid", plural: "Feature Grids" },
  fields: [
    { name: "sectionTitle", type: "text" },
    {
      name: "variant",
      type: "select",
      options: ["icon", "photo"],
      defaultValue: "icon",
      required: true,
    },
    {
      name: "items",
      type: "array",
      fields: [
        // T-02-10 mitigation: this is a lucide icon NAME, not code — the
        // render component maps it through a fixed allow-list, never a
        // dynamic import (FeatureGridBlock.tsx).
        { name: "icon", type: "text" },
        { name: "photo", type: "upload", relationTo: "media" },
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea", required: true },
      ],
    },
  ],
};
