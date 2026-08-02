import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

// T-103/T-105/CONTENT_PLAYBOOK §4 Product detail: per-product FAQ. Same
// single-collapsible Accordion recipe as FaqBlock.tsx (no card wrapper, row
// dividers only). Self-omits when empty (CAT-04) — the FAQPage JSON-LD
// (rendered by the caller, since it needs the raw q/a pairs) only fires
// alongside this, never for an empty list.
export function ProductFaq({ items, title }: { items: { q: string; a: string }[]; title: string }) {
  if (items.length === 0) return null;

  return (
    <div>
      <p className="mb-md text-heading font-semibold text-neutral-900">{title}</p>
      <Accordion type="single" collapsible>
        {items.map((item, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
