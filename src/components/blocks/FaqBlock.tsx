import { getTranslations } from "next-intl/server";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { sectionBg } from "./RenderBlocks";
import type { Page } from "../../../payload-types";

type FaqData = Extract<NonNullable<Page["layout"]>[number], { blockType: "faq" }>;

// 08-UI-SPEC Contract §6 / 08-CONTEXT.md "FAQ scope: build it this phase" —
// single-collapsible Accordion, nothing pre-opened. No card wrapper: the
// accordion's own row dividers carry the StatsBandBlock lightweight-band
// precedent, not the flat spec-sheet card look.
export async function FaqBlock({ block, index }: { block: FaqData; index: number }) {
  const t = await getTranslations("blocks");
  const items = block.items ?? [];

  return (
    <section className={`${sectionBg(index)} px-md py-2xl md:px-lg md:py-3xl xl:px-xl xl:py-4xl`}>
      <div className="mx-auto max-w-[1280px]">
        {block.sectionTitle ? (
          <h2 className="mb-lg text-center text-heading font-semibold">{block.sectionTitle}</h2>
        ) : null}
        {items.length === 0 ? (
          <p className="text-center text-body text-neutral-600">{t("emptyState")}</p>
        ) : (
          <Accordion type="single" collapsible className="mx-auto max-w-[720px]">
            {items.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </section>
  );
}
