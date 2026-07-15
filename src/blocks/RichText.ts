import type { Block } from "payload";

// UI-SPEC Block Library #2 — CMS Lexical rich text, no new package (existing
// @payloadcms/richtext-lexical editor, already configured in payload.config.ts).
export const RichText: Block = {
  slug: "richText",
  labels: { singular: "Rich Text", plural: "Rich Text Blocks" },
  fields: [{ name: "content", type: "richText" }],
};
