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

// T-206/PERF (D-57): ContactBlockView is back to a plain static import.
// The dynamic() call used to live here, wrapping ContactBlockView itself —
// looked correct but never actually code-split anything: next/dynamic()
// only splits when the call site is a Client Component, and RenderBlocks
// is a Server Component (vercel/next.js#54935). ContactBlockView must also
// stay a Server Component (it uses next-intl/server's getTranslations), so
// it can't itself be the dynamic boundary either. The real fix moved one
// level deeper — see ContactFormLazy.tsx, which wraps just ContactForm
// (the actual react-hook-form/zod/Turnstile tree) in a dynamic() call
// inside a "use client" file. ContactBlockView is lightweight now that its
// own heavy child is behind that boundary, so importing it statically here
// is correct and no longer pulls the form's dependencies along.


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
