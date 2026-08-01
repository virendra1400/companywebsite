import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { RevealItem } from "@/components/motion/RevealItem";
import { sectionBg } from "./RenderBlocks";
import { isSvgUrl } from "@/lib/is-svg-url";
import type { Page, Media } from "../../../payload-types";

type MediaGalleryData = Extract<NonNullable<Page["layout"]>[number], { blockType: "mediaGallery" }>;

// UI-SPEC §6 MediaGallery — fixed aspect-ratio grid, caption BELOW the image
// (never overlaid, per the UI-SPEC's contrast-risk note). No lightbox/modal
// in Phase 2 (ponytail: skip until analytics show demand) — static grid only.
export async function MediaGalleryBlock({
  block,
  index,
}: {
  block: MediaGalleryData;
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
          // UI-SPEC Copywriting Contract — generic empty-state fallback,
          // never a broken/empty grid.
          <p className="text-center text-body text-neutral-600">{t("emptyState")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-md md:grid-cols-3">
            {items.map((item, i) => {
              // image is a relation: number (id, not populated) | Media
              // (populated) | null/undefined. Media guard (Pitfall 3) — skip
              // a cell with no populated image rather than render a broken box.
              const image =
                item.image && typeof item.image === "object" ? (item.image as Media) : null;
              if (!image?.url) return null;
              return (
                <RevealItem key={i} index={i}>
                  <AspectRatio ratio={4 / 3} className="overflow-hidden rounded-md bg-neutral-100">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 768px) 33vw, 50vw"
                      unoptimized={isSvgUrl(image.url)}
                      className="object-cover"
                    />
                  </AspectRatio>
                  {item.caption ? (
                    <p className="mt-sm text-label text-neutral-600">{item.caption}</p>
                  ) : null}
                  {item.videoUrl ? (
                    <a
                      href={item.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-label text-primary-700 underline"
                    >
                      {t("watchVideo")}
                    </a>
                  ) : null}
                </RevealItem>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
