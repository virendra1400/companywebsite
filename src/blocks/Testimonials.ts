import type { Block } from "payload";

// UI-SPEC §2c Testimonials — buyer quote grid, no carousel dependency
// (CONTEXT.md locks static grid/list). No avatar/photo field — real
// testimonial photos don't exist yet (ponytail: don't add an upload field
// guaranteed to render empty; add later if real photos arrive). Field-level
// localization NOT set here — cascades from Pages.layout (RESEARCH Pattern 2).
export const Testimonials: Block = {
  slug: "testimonials",
  labels: { singular: "Testimonials", plural: "Testimonials Sections" },
  fields: [
    { name: "sectionTitle", type: "text" },
    {
      name: "items",
      type: "array",
      fields: [
        { name: "quote", type: "textarea", required: true },
        { name: "name", type: "text", required: true },
        { name: "company", type: "text" },
        { name: "country", type: "text" },
      ],
    },
  ],
};
