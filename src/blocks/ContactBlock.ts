import type { Block } from "payload";

// UI-SPEC §9 ContactBlock (Contact page only, D-07) — registered address,
// WhatsApp, email, phone info column + a non-submitting inquiry form (the
// form itself is UI-only, see ContactForm.tsx; this block only carries the
// contact-details CMS content). Field-level localization NOT set here —
// cascades from Pages.layout (RESEARCH Pattern 2).
export const ContactBlock: Block = {
  slug: "contactBlock",
  labels: { singular: "Contact Block", plural: "Contact Blocks" },
  fields: [
    { name: "intro", type: "textarea" },
    { name: "address", type: "textarea", required: true },
    // E.164 number (e.g. "910000000000", no "+"), combined into a
    // wa.me/<number>?text=... link at render time.
    { name: "whatsapp", type: "text", required: true },
    { name: "email", type: "text", required: true },
    { name: "phone", type: "text", required: true },
  ],
};
