import Image from "next/image";
import { ImageOff } from "lucide-react";
import { getFormatter } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { Insight, Media, Category } from "../../../payload-types";

// UI-SPEC §Component Inventory #2 InsightCard — Insights list grid item.
// Whole card is the tap target (Link wraps everything), adapted from
// ProductCard: AspectRatio 16/9 (editorial banner, not 4/3 product photo),
// meta row (category badge · date, conditional separator), line-clamp-3
// excerpt (one line more than ProductCard's teaser — UI-SPEC deviation).
export async function InsightCard({ insight }: { insight: Insight }) {
  const format = await getFormatter();
  const image = insight.coverImage && typeof insight.coverImage === "object"
    ? (insight.coverImage as Media)
    : null;
  const category = typeof insight.category === "object" ? (insight.category as Category) : null;
  // FOUND-03: force Western (latn) digits — Intl defaults `ar` to Arabic-Indic.
  const date = insight.publishedDate
    ? format.dateTime(new Date(insight.publishedDate), "latn")
    : null;

  return (
    <Link href={`/insights/${insight.slug}`} className="group block">
      <Card className="gap-sm rounded-card border border-neutral-300 bg-white p-md shadow-card transition-transform duration-150 motion-reduce:transition-none group-hover:-translate-y-[2px] group-hover:shadow-card-hover group-focus-visible:-translate-y-[2px] group-focus-visible:shadow-card-hover group-focus-visible:ring-2 group-focus-visible:ring-accent-600 md:p-lg">
        <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md bg-neutral-100">
          {image?.url ? (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <ImageOff aria-hidden="true" className="size-8 text-neutral-600" />
            </div>
          )}
        </AspectRatio>
        <div className="flex flex-wrap items-center gap-sm text-label text-neutral-600">
          {category ? (
            <Badge variant="secondary" className="w-fit bg-neutral-100 text-neutral-900">
              {category.name}
            </Badge>
          ) : null}
          {category && date ? <span aria-hidden="true">·</span> : null}
          {date ? <span>{date}</span> : null}
        </div>
        <p className="line-clamp-2 text-body font-semibold text-neutral-900">{insight.title}</p>
        <p className="line-clamp-3 text-body text-neutral-600">{insight.excerpt}</p>
      </Card>
    </Link>
  );
}
