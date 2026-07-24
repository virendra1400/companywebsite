import { getTranslations } from "next-intl/server";
import { Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { sectionBg } from "./RenderBlocks";
import type { Page } from "../../../payload-types";

type TestimonialsData = Extract<NonNullable<Page["layout"]>[number], { blockType: "testimonials" }>;

// UI-SPEC §2c Testimonials — 3-up Card grid, no carousel (CONTEXT.md locks
// static grid). Seed copy (see seed-content.ts) is role + generic
// buyer-category + real served country, NOT invented company names —
// placeholder pending real client testimonials, same convention as
// MediaGalleryBlock's stub comment.
export async function TestimonialsBlock({
  block,
  index,
}: {
  block: TestimonialsData;
  index: number;
}) {
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
          <div className="grid grid-cols-1 gap-lg md:grid-cols-3">
            {items.map((item, i) => {
              const attribution = [item.company, item.country].filter(Boolean).join(" · ");
              return (
                <Card
                  key={i}
                  className="gap-sm rounded-card border border-neutral-300 bg-white p-lg shadow-card"
                >
                  <Quote aria-hidden="true" className="size-6 text-accent-600" />
                  <p className="text-body text-neutral-900">{item.quote}</p>
                  <p className="text-label font-semibold text-neutral-900">{item.name}</p>
                  {attribution ? (
                    <p className="text-label text-neutral-600">{attribution}</p>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
