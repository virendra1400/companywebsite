import { RichText } from "@payloadcms/richtext-lexical/react";
import type { Page } from "../../../payload-types";
import { sectionBg } from "./RenderBlocks";

type RichTextData = Extract<NonNullable<Page["layout"]>[number], { blockType: "richText" }>;

// UI-SPEC Block Library #2 — renders CMS Lexical content via Payload's own
// React JSX converter (RESEARCH: do NOT hand-roll dangerouslySetInnerHTML).
export function RichTextBlock({ block, index }: { block: RichTextData; index: number }) {
  if (!block.content) return null;

  return (
    <section className={`${sectionBg(index)} px-md py-2xl md:px-lg md:py-3xl xl:px-xl`}>
      <div className="mx-auto max-w-[720px] text-body">
        <RichText data={block.content} />
      </div>
    </section>
  );
}
