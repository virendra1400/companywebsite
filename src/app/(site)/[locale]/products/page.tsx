import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { HeroBlock } from "@/components/blocks/HeroBlock";
import { CTABandBlock } from "@/components/blocks/CTABandBlock";
import { sectionBg } from "@/components/blocks/RenderBlocks";
import { ProductCard } from "@/components/products/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { RevealItem } from "@/components/motion/RevealItem";
import { getProductsByCategory, getSiteBrand } from "@/lib/payload-fetch";
import type { Locale } from "@/i18n/routing";
import type { Media } from "../../../../../payload-types";

// ISR: CMS edits (Pages/Products/SiteSettings) appear within 60s without a redeploy.
// Complements the on-demand revalidate hooks (instant when they fire).
export const revalidate = 60;

// CAT-01/CAT-04 — CatalogIndex (RESEARCH Pitfall 2: a NEW sibling `products`
// folder, never a special case inside `[slug]/page.tsx`; Next resolves
// static-over-dynamic automatically). Composition per UI-SPEC §CatalogIndex:
// compact Hero -> [optional] category anchor-nav -> one alternating-bg
// section per category (header + ProductCard grid, or the per-category
// empty-state copy) -> CTABand. Same WhatsApp/"Request a Quote" CTA pair
// used by every other page's ctaBand (src/lib/seed-content.ts), reused
// verbatim rather than inventing new placeholder contact copy.
const REQUEST_QUOTE_CTA = { label: "Request a Quote", href: "/contact" };

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("products");
  const tBlocks = await getTranslations("blocks");
  const grouped = await getProductsByCategory(locale as Locale);
  const { waHref, productsHeroUrl } = await getSiteBrand();

  // Pre-seed state: zero categories at all. Whole-catalog empty state, still
  // wrapped in a data-testid="hero" region so nav-links.spec's "every nav
  // target renders a hero" assertion holds even before content exists.
  if (grouped.length === 0) {
    return (
      <main>
        <section
          data-testid="hero"
          className="flex min-h-[320px] flex-col items-center justify-center bg-primary-900 px-md py-3xl text-center text-white md:min-h-[400px] md:px-lg xl:px-xl"
        >
          <div className="mx-auto flex max-w-[640px] flex-col items-center gap-md">
            <h1 className="text-display font-semibold">{t("catalogEmptyHeading")}</h1>
            <p className="text-body text-primary-100">
              {t("catalogEmptyBody")}{" "}
              <Link href="/contact" className="underline decoration-accent-600">
                {t("breadcrumbRoot")}
              </Link>
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <HeroBlock
        block={{
          blockType: "hero",
          variant: "compact",
          headline: t("heading"),
          heroImage: productsHeroUrl
            ? ({ url: productsHeroUrl, alt: t("heading") } as Media)
            : null,
        }}
        index={0}
      />

      {grouped.length > 1 ? (
        <nav
          aria-label="Category"
          className="flex flex-wrap gap-sm px-md py-md md:px-lg xl:px-xl"
        >
          {grouped.map(({ category }) => (
            <Badge key={category.id} asChild variant="outline" className="min-h-11 items-center">
              <a href={`#${category.slug}`}>{category.name}</a>
            </Badge>
          ))}
        </nav>
      ) : null}

      {grouped.map(({ category, products }, index) => (
        <section
          key={category.id}
          id={category.slug}
          className={`${sectionBg(index)} px-md py-2xl md:px-lg md:py-3xl xl:px-xl`}
        >
          <div className="mx-auto max-w-[1280px]">
            <h2 className="text-heading font-semibold text-neutral-900">{category.name}</h2>
            {category.shortDescription ? (
              <p className="mt-sm max-w-[720px] text-body text-neutral-600">
                {category.shortDescription}
              </p>
            ) : null}

            {products.length === 0 ? (
              <p className="mt-lg text-body text-neutral-600">{tBlocks("emptyState")}</p>
            ) : (
              <div className="mt-lg grid grid-cols-2 gap-md md:grid-cols-3 md:gap-lg lg:grid-cols-4">
                {products.map((product, i) => (
                  <RevealItem key={product.id} index={i}>
                    <ProductCard product={product} />
                  </RevealItem>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}

      {/* WR-01: this page bypasses RenderBlocks (hand-built, not a CMS Page
          layout), so CTABandBlock needs its own Reveal wrap to match the
          scroll-reveal treatment every CMS Page gets automatically. */}
      <Reveal>
        <CTABandBlock
          block={{
            blockType: "ctaBand",
            heading: "Ready to Source These Products?",
            primaryCta: REQUEST_QUOTE_CTA,
            secondaryCta: { label: "Chat on WhatsApp", href: waHref },
          }}
          index={grouped.length}
        />
      </Reveal>
    </main>
  );
}
