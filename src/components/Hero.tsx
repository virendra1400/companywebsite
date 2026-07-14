import Image from "next/image";
import { getFormatter, getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import type { Home, Media } from "../../payload-types";

// UI-SPEC Component Inventory — Hero (placeholder homepage only): full-bleed
// photography slot, vertical primary-900 gradient overlay (bg-gradient-to-t —
// direction-agnostic, no RTL concern), Display headline (CMS, max 2 lines),
// Body subhead (CMS), PrimaryButton "Request a Quote" CTA (chrome string).
export async function Hero({ content }: { content: Home }) {
  const t = await getTranslations("hero");
  const tSample = await getTranslations("sample");
  const format = await getFormatter();
  // FOUND-03: force Western (latn) digits — Intl defaults `ar` to Arabic-Indic.
  const buyers = format.number(60, "latn");

  // heroImage is a relation: number (id, not populated) | Media (populated) | null/undefined.
  const image =
    content.heroImage && typeof content.heroImage === "object"
      ? (content.heroImage as Media)
      : null;

  return (
    <section
      data-testid="hero"
      className="relative flex min-h-[70dvh] flex-col justify-center overflow-hidden bg-primary-900 px-md py-3xl text-white md:px-lg xl:px-xl"
    >
      {/* Known stub: no real photography uploaded to Payload Media yet — the
          section renders on its primary-900 background alone until content
          editors add a heroImage via /admin (Phase 2 content task). */}
      {image?.url ? (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : null}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-primary-900/80 via-primary-900/30 to-transparent"
      />
      <div className="relative mx-auto flex w-full max-w-[1280px] flex-col items-start gap-lg text-start">
        <h1 className="max-w-2xl text-display font-semibold text-white">
          {content.heroHeadline}
        </h1>
        {content.heroSubhead ? (
          <p className="max-w-xl text-body text-primary-100">{content.heroSubhead}</p>
        ) : null}
        <Button
          asChild
          className="hover:bg-primary-500 focus-visible:ring-accent-600"
        >
          <a href="mailto:sales@staragrevolution.com">{t("cta")}</a>
        </Button>
        <p data-testid="sample-count" className="text-label text-primary-100">
          {tSample("count", { count: buyers })}
        </p>
      </div>
    </section>
  );
}
