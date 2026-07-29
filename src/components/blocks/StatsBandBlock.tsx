import { getTranslations } from "next-intl/server";
import { sectionBg } from "./RenderBlocks";
import type { Page } from "../../../payload-types";

type StatsBandData = Extract<NonNullable<Page["layout"]>[number], { blockType: "statsBand" }>;

// UI-SPEC §4 — deliberately NO card border (Card is FeatureGrid/CertCard's
// signature; StatsBand reads as a lightweight band so the page isn't a wall
// of cards).
export async function StatsBandBlock({ block, index }: { block: StatsBandData; index: number }) {
  const t = await getTranslations("blocks");
  const stats = block.stats ?? [];

  return (
    <section className={`${sectionBg(index)} px-md py-2xl md:px-lg md:py-3xl xl:px-xl xl:py-4xl`}>
      <div className="mx-auto max-w-[1280px]">
        {block.sectionTitle ? (
          <h2 className="mb-lg text-center text-heading font-semibold">{block.sectionTitle}</h2>
        ) : null}
        {stats.length === 0 ? (
          // UI-SPEC Copywriting Contract — generic empty-state fallback.
          <p className="text-center text-body text-neutral-600">{t("emptyState")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-lg md:grid-cols-4">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-display font-semibold tabular-nums text-primary-700">{stat.value}</p>
                <p className="text-label text-neutral-600">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
