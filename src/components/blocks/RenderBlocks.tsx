import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import type { Page } from "../../../payload-types";
import { Reveal } from "@/components/motion/Reveal";
import { HeroBlock } from "./HeroBlock";
import { RichTextBlock } from "./RichTextBlock";
import { CTABandBlock } from "./CTABandBlock";
import { CertStripBlock } from "./CertStripBlock";
import { FeatureGridBlock } from "./FeatureGridBlock";
import { StatsBandBlock } from "./StatsBandBlock";
import { DocumentCardBlock } from "./DocumentCardBlock";
import { MediaGalleryBlock } from "./MediaGalleryBlock";
import { ExportMapBlock } from "./ExportMapBlock";
import { TrustBarBlock } from "./TrustBarBlock";
import { ExportProcessBlock } from "./ExportProcessBlock";
import { TestimonialsBlock } from "./TestimonialsBlock";
import { FaqBlock } from "./FaqBlock";

// T-206/PERF: dynamic (not static) import. ContactBlockView pulls in
// ContactForm -> react-hook-form + zod + the Turnstile widget (~90KB, the
// single largest JS chunk site-wide). A static import here made that whole
// tree part of RenderBlocks' own module — and RenderBlocks is imported by
// every Pages-collection route (home, about, manufacturing, certifications,
// company...), so the bundler hoisted it into a chunk loaded on EVERY page,
// including ones with no contact block at all (confirmed via production
// Lighthouse: the react-hook-form chunk was loading on `/`). Dynamic import
// scopes it to only the routes that actually render a contactBlock — in
// practice just /contact.
const ContactBlockView = dynamic(() =>
  import("./ContactBlockView").then((m) => m.ContactBlockView),
);

type LayoutBlock = NonNullable<Page["layout"]>[number];

// blockType -> component switch (RESEARCH Pattern 3). The map is intentionally
// loose (ComponentType<any>) — a single generic renderer dispatching a
// heterogeneous discriminated union can't stay statically precise per-variant
// without excess ceremony; each block component narrows `block` to its own
// shape internally via `Extract<LayoutBlock, { blockType: '...' }>`.
// Reserve: append later blocks here as later plans add them.
const BLOCK_MAP: Record<string, ComponentType<{ block: any; index: number }>> = {
  hero: HeroBlock,
  richText: RichTextBlock,
  ctaBand: CTABandBlock,
  certStrip: CertStripBlock,
  featureGrid: FeatureGridBlock,
  statsBand: StatsBandBlock,
  documentCard: DocumentCardBlock,
  mediaGallery: MediaGalleryBlock,
  exportMap: ExportMapBlock,
  contactBlock: ContactBlockView,
  trustBar: TrustBarBlock,
  exportProcess: ExportProcessBlock,
  testimonials: TestimonialsBlock,
  faq: FaqBlock,
};

// UI-SPEC "Section rhythm rule": two consecutive blocks never share the same
// background. Hero and CTABand are the documented exceptions — both hardcode
// their own background and ignore this alternation.
export function sectionBg(index: number) {
  return index % 2 === 0 ? "bg-white" : "bg-neutral-100";
}

// CR-01: hero is the LCP exception (D-07); these four already implement
// their own item-level RevealItem stagger internally (see
// FeatureGridBlock/MediaGalleryBlock/ExportProcessBlock/TestimonialsBlock) —
// wrapping them in an outer section-level Reveal too nests two independent
// IntersectionObserver-driven wrappers, compounding opacity/translate.
const OWN_ITEM_REVEAL = new Set(["hero", "featureGrid", "mediaGallery", "exportProcess", "testimonials"]);

export function RenderBlocks({ blocks }: { blocks: LayoutBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        const Component = BLOCK_MAP[block.blockType];
        if (!Component) return null; // unknown blockType: fail soft, not a blank crash
        const key = block.id ?? index;
        // WR-02: `key` only matters on whichever element is the direct
        // child of this array (React ignores it elsewhere) — Component
        // when returned bare, Reveal when Component is its child.
        if (OWN_ITEM_REVEAL.has(block.blockType)) {
          return <Component key={key} block={block} index={index} />;
        }
        return (
          <Reveal key={key}>
            <Component block={block} index={index} />
          </Reveal>
        );
      })}
    </>
  );
}
