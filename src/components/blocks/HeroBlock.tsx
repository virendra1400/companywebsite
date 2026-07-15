import Image from "next/image";
import { getFormatter, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import type { Page, Media } from "../../../payload-types";

type HeroData = Extract<NonNullable<Page["layout"]>[number], { blockType: "hero" }>;

// UI-SPEC Block Library #1 — generalizes the Phase 1 placeholder Hero
// (src/components/Hero.tsx, now retired) into a page-builder block. `full`
// (homepage only) keeps the existing 70dvh photography hero + the FOUND-03
// sample-count line (kept ONLY on `full` so the existing rtl-arabic.spec.ts
// e2e assertion stays green); `compact` (every interior page) drops to a
// smaller footprint per UI-SPEC.
export async function HeroBlock({ block }: { block: HeroData; index: number }) {
  const t = await getTranslations("hero");
  const tSample = await getTranslations("sample");
  const format = await getFormatter();
  const isFull = block.variant === "full";
  // FOUND-03: force Western (latn) digits — Intl defaults `ar` to Arabic-Indic.
  const buyers = format.number(60, "latn");

  // heroImage is a relation: number (id, not populated) | Media (populated) | null/undefined.
  const image =
    block.heroImage && typeof block.heroImage === "object" ? (block.heroImage as Media) : null;

  return (
    <section
      data-testid="hero"
      className={`relative flex flex-col justify-center overflow-hidden bg-primary-900 px-md py-3xl text-white md:px-lg xl:px-xl ${
        isFull ? "min-h-[70dvh]" : "min-h-[320px] md:min-h-[400px]"
      }`}
    >
      {/* Known stub: no real photography uploaded to Payload Media yet — the
          section renders on its primary-900 background alone until content
          editors add a heroImage via /admin. */}
      {image?.url ? (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          priority={isFull}
          sizes="100vw"
          className="object-cover"
        />
      ) : null}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-primary-900/30 to-transparent"
      />
      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col items-start gap-lg text-start">
        {block.eyebrow ? (
          <p className="text-label tracking-wide text-primary-100">{block.eyebrow}</p>
        ) : null}
        <h1 className="max-w-[42rem] text-display font-semibold text-white">{block.headline}</h1>
        {block.subhead ? (
          <p className="max-w-[36rem] text-body text-primary-100">{block.subhead}</p>
        ) : null}
        <div className="flex flex-col items-start gap-sm sm:flex-row sm:items-center">
          <Button asChild className="hover:bg-primary-500 focus-visible:ring-accent-600">
            <a href={block.primaryCta?.href || "mailto:sales@staragrevolution.com"}>
              {block.primaryCta?.label || t("cta")}
            </a>
          </Button>
          {block.secondaryCta?.label ? (
            <Button
              asChild
              variant="outline"
              className="border-white text-white hover:bg-white/10 focus-visible:ring-accent-600"
            >
              <a href={block.secondaryCta.href || "#"}>{block.secondaryCta.label}</a>
            </Button>
          ) : null}
        </div>
        {isFull ? (
          <p data-testid="sample-count" className="text-label text-primary-100">
            {tSample("count", { count: buyers })}
          </p>
        ) : null}
      </div>
    </section>
  );
}
