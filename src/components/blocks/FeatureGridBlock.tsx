import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/card";
import { RevealItem } from "@/components/motion/RevealItem";
import { sectionBg } from "./RenderBlocks";
import { ShieldCheck, RefreshCw, FileCheck2, Globe2, Sparkles, type LucideIcon } from "lucide-react";
import type { Page, Media } from "../../../payload-types";

type FeatureGridData = Extract<NonNullable<Page["layout"]>[number], { blockType: "featureGrid" }>;

// T-02-10 mitigation: a FIXED allow-list of lucide icons keyed by CMS-authored
// name — never a dynamic import of an arbitrary module name from CMS data.
// An unknown/missing name falls back to Sparkles, never a crash.
const ICONS: Record<string, LucideIcon> = {
  shieldCheck: ShieldCheck,
  refreshCw: RefreshCw,
  fileCheck: FileCheck2,
  globe: Globe2,
};

// Item count drives column count (UI-SPEC §3), capped at 4 — planner's
// discretion baked in as a lookup rather than a formula, so the cap is
// impossible to accidentally exceed.
function lgColsClass(count: number) {
  if (count >= 4) return "lg:grid-cols-4";
  if (count === 3) return "lg:grid-cols-3";
  if (count === 2) return "lg:grid-cols-2";
  return "lg:grid-cols-1";
}

export async function FeatureGridBlock({ block, index }: { block: FeatureGridData; index: number }) {
  const t = await getTranslations("blocks");
  const items = block.items ?? [];

  return (
    <section className={`${sectionBg(index)} px-md py-2xl md:px-lg md:py-3xl xl:px-xl xl:py-4xl`}>
      <div className="mx-auto max-w-[1280px]">
        {block.sectionTitle ? (
          <h2 className="mb-lg text-heading font-semibold">{block.sectionTitle}</h2>
        ) : null}
        {items.length === 0 ? (
          // UI-SPEC Copywriting Contract — generic empty-state fallback,
          // never a blank grid.
          <p className="text-center text-body text-neutral-600">{t("emptyState")}</p>
        ) : (
          <div className={`grid grid-cols-1 gap-lg md:grid-cols-2 ${lgColsClass(items.length)}`}>
            {items.map((item, i) => {
              const photo =
                item.photo && typeof item.photo === "object" ? (item.photo as Media) : null;
              const Icon = ICONS[item.icon ?? ""] ?? Sparkles;
              return (
                // 09-01 RevealItem: full-height wrapper + card restores the
                // equal-height row that CSS grid's default align-items:
                // stretch gave the Card directly (Phase 8 recipe).
                <RevealItem key={i} index={i} className="h-full">
                  {/* 08-UI-SPEC Contract §1 — hairline card recipe convergence */}
                  <Card className="h-full gap-sm rounded-card border border-neutral-300 bg-white p-lg shadow-card">
                    {block.variant === "photo" ? (
                      <div className="relative size-24 shrink-0 overflow-hidden rounded-full bg-neutral-100">
                        {photo?.url ? (
                          <Image src={photo.url} alt={photo.alt} fill className="object-cover" />
                        ) : null}
                      </div>
                    ) : (
                      <Icon aria-hidden="true" className="size-8 text-primary-700" />
                    )}
                    <p className="mt-md text-body font-semibold">{item.title}</p>
                    <p className="text-body text-neutral-600">{item.body}</p>
                  </Card>
                </RevealItem>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
