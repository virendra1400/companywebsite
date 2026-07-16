import type { Block } from "payload";

// UI-SPEC §9 ContactBlock (Contact page only, D-07) — intro + registered
// address here; email/phone/WhatsApp now come from the SiteSettings global
// (single site-wide source), not this block. The form is UI-only (ContactForm.tsx).
// Field-level localization cascades from Pages.layout (RESEARCH Pattern 2).
export const ContactBlock: Block = {
  slug: "contactBlock",
  labels: { singular: "Contact Block", plural: "Contact Blocks" },
  fields: [
    { name: "intro", type: "textarea" },
    { name: "address", type: "textarea", required: true },
  ],
};
