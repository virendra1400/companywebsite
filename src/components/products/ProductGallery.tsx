"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { isSvgUrl } from "@/lib/is-svg-url";

export type GalleryImage = { url: string; alt: string };

// UI-SPEC §ProductDetail Gallery — thumbnail-swap gallery, no lightbox/
// carousel library (existing anti-feature ruling, reused from Phase 2
// MediaGallery). Does NOT flex-reverse in RTL — product photography carries
// no reading-direction, gallery stays in source/CMS array order in both
// directions (RTL Extensions). thumbLabels is precomputed server-side (a
// client component can't receive a translation function as a prop across the
// RSC boundary) so each button's accessible name is already localized.
export function ProductGallery({
  images,
  thumbLabels,
}: {
  images: GalleryImage[];
  thumbLabels: string[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <AspectRatio
        ratio={4 / 3}
        data-testid="gallery-placeholder"
        className="flex items-center justify-center overflow-hidden rounded-md bg-neutral-100"
      >
        <ImageOff aria-hidden="true" className="size-12 text-neutral-600" />
      </AspectRatio>
    );
  }

  const active = images[activeIndex];

  return (
    <div>
      <AspectRatio ratio={4 / 3} className="overflow-hidden rounded-md bg-neutral-100">
        <Image
          src={active.url}
          alt={active.alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          unoptimized={isSvgUrl(active.url)}
          className="object-cover"
        />
      </AspectRatio>
      {images.length > 1 ? (
        <div className="mt-sm grid grid-cols-4 gap-sm">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              aria-label={thumbLabels[i]}
              aria-pressed={i === activeIndex}
              onClick={() => setActiveIndex(i)}
              className={`relative aspect-[4/3] overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 ${
                i === activeIndex ? "ring-2 ring-primary-700" : ""
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="25vw"
                unoptimized={isSvgUrl(img.url)}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
