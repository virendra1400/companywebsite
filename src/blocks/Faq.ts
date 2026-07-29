import type { Block } from "payload";

// 08-UI-SPEC Contract §6 FAQ block / 08-CONTEXT.md "FAQ scope: build it this
// phase". Field-level localization is deliberately NOT set here — it
// cascades from Pages.layout's localized flag (RESEARCH Pattern 2), same as
// every other block.
export const Faq: Block = {
  slug: "faq",
  labels: { singular: "FAQ", plural: "FAQ Sections" },
  fields: [
    { name: "sectionTitle", type: "text" },
    {
      name: "items",
      type: "array",
      fields: [
        { name: "question", type: "text", required: true },
        { name: "answer", type: "textarea", required: true },
      ],
    },
  ],
};
