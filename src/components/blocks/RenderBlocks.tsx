import type { ComponentType } from "react";
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
import { ContactBlockView } from "./ContactBlockView";
import { TrustBarBlock } from "./TrustBarBlock";
import { ExportProcessBlock } from "./ExportProcessBlock";
import { TestimonialsBlock } from "./TestimonialsBlock";
import { FaqBlock } from "./FaqBlock";

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

export function RenderBlocks({ blocks }: { blocks: LayoutBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        const Component = BLOCK_MAP[block.blockType];
        if (!Component) return null; // unknown blockType: fail soft, not a blank crash
        const rendered = <Component key={block.id ?? index} block={block} index={index} />;
        // D-07: hero is the LCP candidate on any page that has one — never
        // gate it behind a scroll-triggered Reveal. Explicit blockType check
        // (not index/threshold) so this stays correct if hero ever appears
        // at a position other than 0.
        if (block.blockType === "hero") return rendered;
        return <Reveal key={block.id ?? index}>{rendered}</Reveal>;
      })}
    </>
  );
}
