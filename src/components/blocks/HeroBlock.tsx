import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { WhatsAppTrackedLink } from "@/components/chrome/WhatsAppTrackedLink";
import { Link } from "@/i18n/navigation";
import { getSiteBrand } from "@/lib/payload-fetch";
import { pickHeroFallback } from "@/lib/stock-fallback-images";
import type { Page, Media } from "../../../payload-types";

type HeroData = Extract<NonNullable<Page["layout"]>[number], { blockType: "hero" }>;

// UI-SPEC Block Library #1 — generalizes the Phase 1 placeholder Hero
// (src/components/Hero.tsx, now retired) into a page-builder block. `full`
// (homepage only) keeps the existing 70dvh photography hero; `compact`
// (every interior page) drops to a smaller footprint per UI-SPEC.
// T-001: the fabricated "Trusted by 60+ international buyers" sample-count
// line that used to render here has been removed (playbook D-01 honesty rule
// — zero real customers). The RTL Western-digit assertion it fed now targets
// insight published-dates instead (tests/e2e/rtl-arabic.spec.ts).
export async function HeroBlock({ block }: { block: HeroData; index: number }) {
  const t = await getTranslations("hero");
  const { waHref } = await getSiteBrand();
  const isFull = block.variant === "full";

  const heroPadding = isFull
    ? "px-md py-3xl md:px-lg md:py-3xl xl:px-xl xl:py-4xl"
    : "px-md py-3xl md:px-lg xl:px-xl";
  const overlayClass = isFull
    ? "bg-gradient-to-t from-primary-900/75 via-primary-900/25 to-transparent"
    : "bg-gradient-to-t from-primary-900/80 via-primary-900/30 to-transparent";
  const stackGap = isFull ? "gap-xl" : "gap-lg";
  // Same display-xl/tracking treatment as the homepage hero on every page —
  // only the max-width cap differs (compact hero band is shorter, so a
  // slightly narrower measure keeps line count sane). T-101: font-medium
  // (500), not font-light (300) — Fraunces' display weight, replacing the
  // old Geist thin-display treatment (DESIGN_SYSTEM §3: "Hero H1 in
  // Fraunces 500").
  const headlineClass = isFull
    ? "max-w-[46rem] text-display-xl font-display font-medium tracking-display text-white"
    : "max-w-[42rem] text-display-xl font-display font-medium tracking-display text-white";
  const subheadClass = isFull
    ? "max-w-[38rem] text-body text-primary-100"
    : "max-w-[36rem] text-body text-primary-100";

  // heroImage is a relation: number (id, not populated) | Media (populated) | null/undefined.
  const image =
    block.heroImage && typeof block.heroImage === "object" ? (block.heroImage as Media) : null;
  const fallbackSrc = pickHeroFallback(block.headline || "hero");

  return (
    <section
      data-testid="hero"
      className={`relative flex flex-col justify-center overflow-hidden bg-primary-900 text-white ${heroPadding} ${
        isFull ? "min-h-[70dvh]" : "min-h-[320px] md:min-h-[400px]"
      }`}
    >
      {/* Real photography uploaded via Payload Media wins; until then a
          deterministic stock fallback (temporary, see stock-fallback-images.ts)
          keeps the hero from rendering as an empty color block. */}
      <Image
        src={image?.url || fallbackSrc}
        alt={image?.alt || ""}
        fill
        priority={isFull}
        sizes="100vw"
        className="object-cover"
      />
      <div aria-hidden="true" className={`absolute inset-0 ${overlayClass}`} />
      <div
        className={`relative mx-auto flex w-full max-w-[1280px] flex-col items-start text-start ${stackGap}`}
      >
        {block.eyebrow ? (
          <p className="text-label tracking-wide text-primary-100">{block.eyebrow}</p>
        ) : null}
        <h1 className={headlineClass}>{block.headline}</h1>
        {block.subhead ? <p className={subheadClass}>{block.subhead}</p> : null}
        <div className="flex flex-col items-start gap-sm sm:flex-row sm:items-center">
          <Button asChild>
            {block.primaryCta?.href ? (
              <a href={block.primaryCta.href}>{block.primaryCta?.label || t("cta")}</a>
            ) : (
              <Link href="/contact">{block.primaryCta?.label || t("cta")}</Link>
            )}
          </Button>
          {block.secondaryCta?.label ? (
            <Button asChild variant="outlineOnDark">
              {/* WhatsApp CTA — number from SiteSettings (single source), ignores stale seeded href */}
              <WhatsAppTrackedLink href={waHref} location="hero" target="_blank" rel="noopener noreferrer">
                {block.secondaryCta.label}
              </WhatsAppTrackedLink>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
