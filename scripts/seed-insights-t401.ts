// T-401: first 3 substantive Insights posts. Generic, verifiable buyer-intent
// content (documentation/logistics/product-format explainers) — no
// VNP-specific facts invented, no specs/claims about VNP itself beyond what's
// already published elsewhere on the site. Sources checked against current
// industry guidance (phytosanitary/COO/HS-code requirements, Incoterms 2020
// FOB/CFR/CIF risk-transfer points, IQF vs block-freeze process mechanics)
// before writing — see DECISION_LOG D-55 for the research trail.
// Same idempotent skip-by-slug / disableRevalidate pattern as
// scripts/seed-insights.ts, kept as a separate file so this one-time content
// drop doesn't get silently re-run or mixed into that file's e2e-fixture
// purpose.
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");

const payload = await getPayload({ config });

async function upsertMediaByAlt(alt: string, filePath: string) {
  const existing = await payload.find({
    collection: "media",
    where: { alt: { equals: alt } },
    limit: 1,
    overrideAccess: true,
  });
  if (existing.docs[0]) return existing.docs[0];
  return payload.create({
    collection: "media",
    data: { alt },
    filePath,
    overrideAccess: true,
  });
}

type Block = { h2: string } | { p: string } | { ul: string[] };

// Lexical editor-state JSON — same documented shape as seed-content.ts's
// richText() (root > block nodes > text), extended with heading (h2) and
// unordered-list nodes using Lexical's standard HeadingNode/ListNode/
// ListItemNode shapes so these read as real structured articles, not a
// wall of single paragraphs.
function article(blocks: Block[]) {
  const children = blocks.map((block) => {
    if ("h2" in block) {
      return {
        type: "heading",
        tag: "h2",
        format: "" as const,
        indent: 0,
        version: 1,
        direction: "ltr" as const,
        children: [{ type: "text", detail: 0, format: 0, mode: "normal", style: "", text: block.h2, version: 1 }],
      };
    }
    if ("ul" in block) {
      return {
        type: "list",
        listType: "bullet",
        tag: "ul",
        start: 1,
        format: "" as const,
        indent: 0,
        version: 1,
        direction: "ltr" as const,
        children: block.ul.map((item) => ({
          type: "listitem",
          value: 1,
          format: "" as const,
          indent: 0,
          version: 1,
          direction: "ltr" as const,
          children: [{ type: "text", detail: 0, format: 0, mode: "normal", style: "", text: item, version: 1 }],
        })),
      };
    }
    return {
      type: "paragraph",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      textFormat: 0,
      children: [{ type: "text", detail: 0, format: 0, mode: "normal", style: "", text: block.p, version: 1 }],
    };
  });

  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children,
    },
  };
}

type InsightSeed = {
  title: string;
  slug: string;
  excerpt: string;
  coverAlt: string;
  coverPath: string;
  publishedDate: string;
  body: Block[];
};

const INSIGHTS_T401: InsightSeed[] = [
  {
    title: "How to Import Agricultural Products from India: A Documentation Checklist",
    slug: "how-to-import-agricultural-products-from-india-documentation-checklist",
    excerpt:
      "The registration, certification, and customs documents a first-time buyer should confirm before placing an order with an Indian exporter.",
    coverAlt: "Import documentation checklist cover",
    coverPath: "scripts/seed-assets/insight-import-documentation.svg",
    publishedDate: "2026-08-08",
    body: [
      {
        p: "Importing frozen vegetables, fruit pulp, or other processed agricultural products from India involves a specific set of documents. Some are the exporter's registrations, checked once. Others travel with every shipment. Knowing which is which before you place an order saves time at customs and avoids surprises.",
      },
      { h2: "The exporter's registrations" },
      {
        p: "A legitimate Indian food exporter holds three registrations, all verifiable independently of anything the exporter tells you directly.",
      },
      {
        ul: [
          "IEC (Importer-Exporter Code) — issued by India's Directorate General of Foreign Trade, required for any company to legally export from India.",
          "FSSAI license — India's Food Safety and Standards Authority registration, required for any food business, export or domestic.",
          "APEDA registration — the Agricultural and Processed Food Products Export Development Authority registration, specific to agricultural and processed food exports and often required for the phytosanitary/health certificates below.",
        ],
      },
      {
        p: "Ask for the registration numbers directly and cross-check them against the relevant government portal. A supplier confident in its paperwork will provide these without hesitation.",
      },
      { h2: "Documents that travel with the shipment" },
      {
        p: "Beyond the exporter's own registrations, each shipment should arrive with its own set of certificates.",
      },
      {
        ul: [
          "Phytosanitary Certificate — confirms the shipment is free of regulated pests and plant diseases, issued by India's Plant Quarantine authority shortly before dispatch.",
          "Certificate of Origin (COO) — confirms where the goods were grown or processed, often required for preferential tariff treatment under trade agreements.",
          "Health or Quality Certificate — confirms the shipment meets the destination country's food safety requirements at time of dispatch.",
          "Certificate of Analysis (COA) — batch-level lab results for the specific shipment (moisture, microbiological parameters, and other product-specific values), distinct from the exporter's general food safety registration.",
        ],
      },
      { h2: "Customs classification" },
      {
        p: "Every product needs a correct HS (Harmonized System) code for customs clearance and duty calculation on your end. This is worth confirming with your own customs broker rather than relying solely on the exporter's classification, since duty treatment can vary by destination country even for the same product.",
      },
      { h2: "What this means for a first order" },
      {
        p: "None of this documentation is unusual to ask for. A supplier that readily shares registration numbers, sample certificates, and a clear phytosanitary/COO/COA process for each shipment is signaling operational maturity. Treat hesitation on any of these points as a reason to ask more questions, not fewer.",
      },
    ],
  },
  {
    title: "Incoterms for Food Buyers: FOB, CIF, and CFR Explained",
    slug: "incoterms-for-food-buyers-fob-cif-cfr-explained",
    excerpt:
      "What FOB, CFR, and CIF actually mean for a frozen food or fruit pulp shipment — where cost, risk, and control change hands, and how to choose.",
    coverAlt: "Incoterms for food buyers cover",
    coverPath: "scripts/seed-assets/insight-incoterms.svg",
    publishedDate: "2026-08-08",
    body: [
      {
        p: "FOB, CFR, and CIF are the three Incoterms that come up most often in food export quotes. They answer two separate questions: who pays for what, and at what point does risk shift from seller to buyer. Confusing the two is the most common source of disputes on a first order.",
      },
      { h2: "FOB (Free on Board)" },
      {
        p: "The seller's responsibility ends once the goods are loaded onto the vessel at the port of origin. From that point, the buyer arranges and pays for ocean freight, insurance, and everything downstream. FOB gives the buyer the most control over the shipping leg — and the most responsibility for it. It suits buyers with an established freight forwarder relationship and enough shipping volume to negotiate good rates directly.",
      },
      { h2: "CFR (Cost and Freight)" },
      {
        p: "The seller pays for freight to the destination port, but risk of loss or damage still transfers to the buyer once the goods are loaded on board at origin — same risk point as FOB, different cost split. Under CFR, the buyer must arrange their own cargo insurance, since the seller's obligation is freight only, not insurance.",
      },
      { h2: "CIF (Cost, Insurance, and Freight)" },
      {
        p: "The seller covers cost, freight, and insurance through to the destination port. This is often the simplest starting point for a buyer new to a supplier relationship, since it reduces the number of separate contracts (freight, insurance) the buyer has to arrange directly.",
      },
      { h2: "Which one to choose" },
      {
        p: "For a buyer's first order with a new supplier, CIF is generally the easier entry point — fewer moving parts, one point of contact if something goes wrong in transit. Buyers with existing freight-forwarder relationships and higher shipping volumes often move to FOB over time, since it gives more control over routing and cost.",
      },
      {
        p: "For frozen and perishable cargo specifically, confirm cold-chain responsibility explicitly regardless of which Incoterm is used — Incoterms define cost and risk transfer, not temperature-control obligations, so reefer container handling and any temperature-logging requirements should be agreed in writing separately from the Incoterm itself.",
      },
    ],
  },
  {
    title: "IQF vs Block-Frozen Vegetables: What the Difference Means for Buyers",
    slug: "iqf-vs-block-frozen-vegetables-what-buyers-should-know",
    excerpt:
      "How Individual Quick Freezing differs from block freezing, and why the choice affects quality, yield, and handling on the buyer's end.",
    coverAlt: "IQF versus block-frozen vegetables cover",
    coverPath: "scripts/seed-assets/insight-iqf-vs-block-frozen.svg",
    publishedDate: "2026-08-08",
    body: [
      {
        p: "IQF (Individually Quick Frozen) and block-frozen are the two dominant formats for frozen vegetables. Both start with the same raw material. The difference is entirely in how the freezing happens, and that difference carries through to how the product performs in a buyer's kitchen or processing line.",
      },
      { h2: "How each process works" },
      {
        p: "IQF freezes each piece separately, in minutes, using high-velocity cold air or a cryogenic tunnel — each pea or corn kernel freezes as an individual unit, never fused to its neighbors. Block freezing packs product together and freezes it as one mass, over a longer period. The equipment and time investment differ accordingly, and that shows up in the price.",
      },
      { h2: "Why freezing speed matters" },
      {
        p: "Fast, individual freezing forms smaller ice crystals inside each piece. Smaller ice crystals do less damage to the plant cell structure. Slower block freezing forms larger crystals, which rupture more cell walls — the practical result is more moisture loss, softer texture, and reduced color/flavor retention after thawing.",
      },
      { h2: "What this means in practice" },
      {
        ul: [
          "Portion control — IQF lets a kitchen or processing line pull exactly the quantity needed and reseal the rest; a block must be fully or partially thawed to access any of it.",
          "Thaw time and evenness — individual pieces thaw faster and more evenly than a solid block, reducing the risk of overcooked edges around a still-frozen center.",
          "Shelf appearance and yield — IQF generally holds shape, color, and texture better through the freeze-thaw cycle, which matters for retail packaging and food-service plating.",
          "Cost — block-frozen is typically the lower-cost format, and remains a reasonable choice where the end use involves full thawing and reprocessing anyway (purees, soups, sauces) rather than direct plating.",
        ],
      },
      { h2: "Questions worth asking a supplier" },
      {
        p: "Ask what freezing method is used, and whether it's individual (air-blast IQF, cryogenic IQF) or block. Ask about typical moisture loss on thaw for the specific vegetable you're sourcing — this varies by product, not just by freezing method. And ask how the format affects container loading and cold-chain handling, since IQF's free-flowing texture and block-frozen's solid mass load and travel differently.",
      },
    ],
  },
];

for (const insight of INSIGHTS_T401) {
  const existing = await payload.find({
    collection: "insights",
    where: { slug: { equals: insight.slug } },
    locale: "en",
    fallbackLocale: false,
    overrideAccess: true,
    limit: 1,
  });

  if (existing.docs[0]) {
    console.log(`Insight '${insight.slug}' (en) already seeded — skipping.`);
    continue;
  }

  const cover = await upsertMediaByAlt(insight.coverAlt, insight.coverPath);

  await payload.create({
    collection: "insights",
    locale: "en",
    data: {
      title: insight.title,
      slug: insight.slug,
      excerpt: insight.excerpt,
      coverImage: cover.id,
      author: "Export Team",
      body: article(insight.body),
      publishedDate: insight.publishedDate,
      published: true,
    },
    overrideAccess: true,
    context: { disableRevalidate: true },
  });
  console.log(`Seeded insight '${insight.slug}' (en).`);
}

await payload.destroy();
