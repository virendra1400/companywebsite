import type { Block } from "payload";

// UI-SPEC §2b ExportProcess — inquiry-to-delivery step sequence. No icon
// field (numbered badges instead — keeps this block's role distinct from
// FeatureGrid's icon value-props). Field-level localization NOT set here —
// cascades from Pages.layout (RESEARCH Pattern 2).
export const ExportProcess: Block = {
  slug: "exportProcess",
  labels: { singular: "Export Process", plural: "Export Processes" },
  fields: [
    { name: "sectionTitle", type: "text" },
    {
      name: "steps",
      type: "array",
      fields: [
        { name: "title", type: "text", required: true },
        { name: "body", type: "textarea", required: true },
      ],
    },
  ],
};
