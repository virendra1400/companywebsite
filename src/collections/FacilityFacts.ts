import type { CollectionConfig } from "payload";

// T-103/MASTER_PLAN §7.3: discrete, sourceable facts about the manufacturing
// facility (e.g. "Cold storage capacity" / "500 MT"), each independently
// markable as verified — lets the Facility & Quality page (T-107) show only
// claims the owner has actually confirmed, matching D-01's zero-fabricated-
// claims rule instead of a hardcoded copy block.
export const FacilityFacts: CollectionConfig = {
  slug: "facility-facts",
  admin: { useAsTitle: "label" },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    { name: "key", type: "text", required: true, unique: true, admin: { description: "Stable identifier, e.g. \"cold-storage-capacity\". Not shown to visitors." } },
    { name: "label", type: "text", required: true, localized: true },
    { name: "value", type: "text", required: true, localized: true },
    {
      name: "verified",
      type: "checkbox",
      defaultValue: false,
      admin: { description: "Only verified facts should render on the public site (D-01)." },
    },
    { name: "displayOrder", type: "number", defaultValue: 0 },
  ],
};
