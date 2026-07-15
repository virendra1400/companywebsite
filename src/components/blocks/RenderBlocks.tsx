import type { ComponentType } from "react";
import type { Page } from "../../../payload-types";
import { HeroBlock } from "./HeroBlock";
import { RichTextBlock } from "./RichTextBlock";
import { CTABandBlock } from "./CTABandBlock";
import { CertStripBlock } from "./CertStripBlock";
import { FeatureGridBlock } from "./FeatureGridBlock";
import { StatsBandBlock } from "./StatsBandBlock";
import { DocumentCardBlock } from "./DocumentCardBlock";
import { MediaGalleryBlock } from "./MediaGalleryBlock";

type LayoutBlock = NonNullable<Page["layout"]>[number];

// blockType -> component switch (RESEARCH Pattern 3). The map is intentionally
// loose (ComponentType<any>) — a single generic renderer dispatching a
// heterogeneous discriminated union can't stay statically precise per-variant
// without excess ceremony; each block component narrows `block` to its own
// shape internally via `Extract<LayoutBlock, { blockType: '...' }>`.
// Reserve: append later blocks here (MediaGallery, ExportMap, ContactBlock)
// as later plans add them.
const BLOCK_MAP: Record<string, ComponentType<{ block: any; index: number }>> = {
  hero: HeroBlock,
  richText: RichTextBlock,
  ctaBand: CTABandBlock,
  certStrip: CertStripBlock,
  featureGrid: FeatureGridBlock,
  statsBand: StatsBandBlock,
  documentCard: DocumentCardBlock,
  mediaGallery: MediaGalleryBlock,
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
        return <Component key={block.id ?? index} block={block} index={index} />;
      })}
    </>
  );
}
