import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { sectionBg } from "./RenderBlocks";
import { isSvgUrl } from "@/lib/is-svg-url";
import type { Page, Media } from "../../../payload-types";

type TrustBarData = Extract<NonNullable<Page["layout"]>[number], { blockType: "trustBar" }>;

// UI-SPEC §2a TrustBar — centered, editor-authored logo/label row. Distinct
// from CertStripBlock's left-aligned Certifications-collection strip: this
// block has zero collection dependency, so a logo-less item falls back to
// the exact ExportMapBlock text-chip pattern (reuse, don't invent a new one).
export async function TrustBarBlock({ block, index }: { block: TrustBarData; index: number }) {
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
          <div className="flex flex-wrap items-center justify-center gap-x-xl gap-y-lg">
            {items.map((item, i) => {
              const logo = item.logo && typeof item.logo === "object" ? (item.logo as Media) : null;
              return logo?.url ? (
                <div key={i} className="relative h-12 w-28 shrink-0 grayscale opacity-70">
                  <Image
                    src={logo.url}
                    alt={logo.alt}
                    fill
                    sizes="112px"
                    unoptimized={isSvgUrl(logo.url)}
                    className="object-contain"
                  />
                </div>
              ) : (
                <span
                  key={i}
                  className="rounded-full bg-neutral-100 px-md py-xs text-label text-neutral-900"
                >
                  {item.name}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
