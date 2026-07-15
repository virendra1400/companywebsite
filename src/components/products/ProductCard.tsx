import Image from "next/image";
import { ImageOff } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { Product, Media, Category } from "../../../payload-types";

// UI-SPEC §Component Inventory #1 ProductCard — CatalogIndex grid item.
// Whole card is the tap target (Link wraps everything). Category tag is a
// plain neutral Badge (variant="secondary"), NOT accent-colored — a category
// tag is wayfinding metadata, not a trust signal (UI-SPEC Color section).
export function ProductCard({ product }: { product: Product }) {
  // imageGallery[0].image is a relation: number (id, not populated) | Media
  // (populated) | null/undefined — same guard as MediaGalleryBlock.
  const first = product.imageGallery?.[0]?.image;
  const image = first && typeof first === "object" ? (first as Media) : null;
  const category = typeof product.category === "object" ? (product.category as Category) : null;

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <Card className="gap-sm rounded-lg border border-neutral-300 bg-white p-md transition-transform duration-150 group-hover:-translate-y-[1px] group-hover:shadow-md group-focus-visible:-translate-y-[1px] group-focus-visible:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-accent-600 md:p-lg">
        <AspectRatio ratio={4 / 3} className="overflow-hidden rounded-md bg-neutral-100">
          {image?.url ? (
            <Image
              src={image.url}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <ImageOff aria-hidden="true" className="size-8 text-neutral-600" />
            </div>
          )}
        </AspectRatio>
        {category ? (
          <Badge variant="secondary" className="w-fit bg-neutral-100 text-neutral-900">
            {category.name}
          </Badge>
        ) : null}
        <p className="line-clamp-2 text-body font-semibold text-neutral-900">{product.name}</p>
        <p className="line-clamp-2 text-body text-neutral-600">{product.shortDescription}</p>
      </Card>
    </Link>
  );
}
