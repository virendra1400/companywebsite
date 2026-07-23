import type { CollectionConfig } from "payload";
import { revalidateInsight } from "@/hooks/revalidateInsights";

// BLOG-02/D-01..D-04: editorial articles collection. Deviates from Products
// on access.read (PUBLIC — copied from Media.ts, not Products' Boolean(user))
// because Insights is served through Payload's auto-generated public REST
// endpoint, unlike Pages/Products which are always read via payload-fetch.ts
// with overrideAccess:true.
export const Insights: CollectionConfig = {
  slug: "insights",
  admin: { useAsTitle: "title" },
  access: {
    // Public REST reads are restricted to published docs; authenticated
    // editors (CMS admin) can still read drafts. Query constraint form per
    // Payload's access-control API (a returned Where is merged into every
    // find), not the earlier `() => true` which had no filter at all.
    read: ({ req: { user } }) => (user ? true : { published: { equals: true } }),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    // NOT localized — one canonical URL segment, same as Products.slug.
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "excerpt", type: "textarea", required: true, localized: true },
    { name: "coverImage", type: "upload", relationTo: "media", required: true },
    // D-02: single relationship, no tag/multi-taxonomy in v1.
    { name: "category", type: "relationship", relationTo: "categories", required: false },
    // D-03: plain text only — no author sub-collection or photo.
    { name: "author", type: "text", localized: true, defaultValue: "Export Team" },
    { name: "body", type: "richText", required: true, localized: true },
    { name: "publishedDate", type: "date" },
    // RESEARCH Open Question 1 — hard-filterable from every public query,
    // mirroring Products.published (Pitfall 2).
    { name: "published", type: "checkbox", defaultValue: true },
  ],
  hooks: { afterChange: [revalidateInsight] },
};
