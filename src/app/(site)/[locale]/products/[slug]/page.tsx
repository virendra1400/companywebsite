import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { ChevronRight, ImageOff } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CertCard } from "@/components/blocks/CertCard";
import { CTABandBlock } from "@/components/blocks/CTABandBlock";
import { ProductGallery } from "@/components/products/ProductGallery";
import { SpecTable } from "@/components/products/SpecTable";
import { LocaleFallbackNotice } from "@/components/chrome/LocaleFallbackNotice";
import { getProduct, getSiteBrand } from "@/lib/payload-fetch";
import { getTranslatedLocales } from "@/lib/seo/translated-locales";
import { buildMetadata } from "@/lib/seo/metadata";
import { localeUrl } from "@/lib/seo/alternates";
import { JsonLd, productJsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import type { Locale } from "@/i18n/routing";
import type { Media, Category, Certification } from "../../../../../../payload-types";

// ISR: CMS edits (Pages/Products/SiteSettings) appear within 60s without a redeploy.
// Complements the on-demand revalidate hooks (instant when they fire).
export const revalidate = 60;

const REQUEST_QUOTE_CTA = { label: "Request a Quote", href: "/contact" };

// CAT-03/RESEARCH Pitfall 1: query Payload for published product slugs — NOT
// a hardcoded list (contrast [locale]/[slug]/page.tsx's INTERIOR_SLUGS, which
// does not apply here). dynamicParams is left at the Next default (true) —
// no export below — so a product added post-build still renders on first
// request without a rebuild.
export async function generateStaticParams() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "products",
    where: { published: { equals: true } },
    locale: "en",
    overrideAccess: true,
    limit: 500,
  });
  return result.docs.map((doc) => ({ slug: doc.slug }));
}

// SEO-01/02/05: delegates to the shared buildMetadata/getTranslatedLocales
// glue (05-02) — same reciprocal alternates map sitemap.ts uses (Pitfall 1).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const { product } = await getProduct(slug, locale as Locale);
  if (!product) return {};

  const images = (product.imageGallery ?? [])
    .map((item) => (item.image && typeof item.image === "object" ? (item.image as Media) : null))
    .filter((img): img is Media => Boolean(img?.url));

  const translatedLocales = await getTranslatedLocales("products", slug);
  return buildMetadata({
    title: product.name,
    description: product.shortDescription,
    imageUrl: images[0]?.url,
    translatedLocales,
    path: `/products/${slug}`,
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("products");
  const tCerts = await getTranslations("certs");

  const { product, isTranslated } = await getProduct(slug, locale as Locale);
  const { waHref } = await getSiteBrand();
  if (!product) notFound();

  const category = typeof product.category === "object" ? (product.category as Category) : null;

  // Media populate guard, reused verbatim from MediaGalleryBlock/ProductCard.
  const images = (product.imageGallery ?? [])
    .map((item) => (item.image && typeof item.image === "object" ? (item.image as Media) : null))
    .filter((img): img is Media => Boolean(img?.url))
    .map((img) => ({ url: img.url as string, alt: img.alt }));

  const thumbLabels = images.map((_, i) => t("galleryThumbAria", { n: i + 1, total: images.length }));

  const certs = (product.certifications ?? []).filter(
    (c): c is Certification => typeof c === "object" && c !== null,
  );

  const rfqHref = `/contact?product=${product.slug}&productName=${encodeURIComponent(product.name)}`;

  const breadcrumbTrail = [
    { name: t("breadcrumbRoot"), url: localeUrl(locale as Locale, "/products") },
    ...(category ? [{ name: category.name, url: localeUrl(locale as Locale, "/products") }] : []),
    { name: product.name, url: localeUrl(locale as Locale, `/products/${slug}`) },
  ];

  return (
    <main>
      {/* SEO-04/D-10/D-11: Product (no price/offers/review) + BreadcrumbList,
          via the single shared <JsonLd> escaper. Organization JSON-LD is
          emitted once in the locale layout, not repeated here. */}
      <JsonLd
        data={productJsonLd({
          name: product.name,
          images: images.map((img) => img.url),
          description: product.shortDescription,
          categoryName: category?.name,
          certNames: certs.map((c) => c.name),
        })}
      />
      <JsonLd data={breadcrumbJsonLd(breadcrumbTrail)} />
      {!isTranslated ? <LocaleFallbackNotice locale={locale as Locale} /> : null}

      {/* PageHeader — a lightweight in-page header, NOT a full photographic
          Hero (UI-SPEC: the gallery below is this page's visual anchor). */}
      <header className="bg-white px-md py-lg md:px-lg md:py-xl xl:px-xl">
        <div className="mx-auto max-w-[1280px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-xs text-label text-neutral-600">
            <Link href="/products" className="hover:text-neutral-900">
              {t("breadcrumbRoot")}
            </Link>
            {category ? (
              <>
                <ChevronRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                <span>{category.name}</span>
              </>
            ) : null}
            <ChevronRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            <span aria-current="page" className="text-neutral-900">
              {product.name}
            </span>
          </nav>
          <h1 className="mt-sm text-display font-semibold text-neutral-900">{product.name}</h1>
          {category ? (
            <Badge variant="secondary" className="mt-sm w-fit bg-neutral-100 text-neutral-900">
              {category.name}
            </Badge>
          ) : null}
        </div>
      </header>

      {/* Two-column region: gallery inline-start, info (description + RFQ
          CTA) inline-end — auto-reverses via dir, no manual reorder. */}
      <section className="bg-white px-md py-lg md:px-lg md:py-xl xl:px-xl">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-2xl lg:grid-cols-2">
          <ProductGallery images={images} thumbLabels={thumbLabels} />

          <div>
            <p className="text-body font-semibold text-neutral-900">{product.shortDescription}</p>
            {product.description ? (
              <div className="mt-md max-w-[720px] text-body text-neutral-900">
                <RichText data={product.description} />
              </div>
            ) : null}
            <Button asChild className="mt-lg hover:bg-primary-500 focus-visible:ring-accent-600">
              <a href={rfqHref}>{t("rfqCta")}</a>
            </Button>
          </div>
        </div>
      </section>

      {/* SpecTable region — self-omits when there are no specs and no
          packaging (CAT-04: 0/1/N spec-row resilience). */}
      <section className="bg-neutral-100 px-md py-lg md:px-lg md:py-xl xl:px-xl">
        <div className="mx-auto max-w-[1280px]">
          <SpecTable
            rows={product.specifications ?? []}
            packaging={product.packaging ?? undefined}
            packagingLabel="Packaging"
          />
        </div>
      </section>

      {/* Applicable Certifications — reuse Phase 2 CertCard verbatim, no
          component changes, only new call-sites. Omitted when none apply. */}
      {certs.length > 0 ? (
        <section className="bg-white px-md py-lg md:px-lg md:py-xl xl:px-xl">
          <div className="mx-auto max-w-[1280px]">
            <div className="grid grid-cols-2 gap-md md:grid-cols-3">
              {certs.map((cert) => {
                const logo = cert.logo && typeof cert.logo === "object" ? (cert.logo as Media) : null;
                const pdf =
                  cert.certificatePdf && typeof cert.certificatePdf === "object"
                    ? (cert.certificatePdf as Media)
                    : null;
                return (
                  <CertCard
                    key={cert.id}
                    name={cert.name}
                    subtitle={cert.issuingBody}
                    logo={logo}
                    pdf={pdf}
                    halal={Boolean(cert.halal)}
                    t={(key) => tCerts(key)}
                  />
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <CTABandBlock
        block={{
          blockType: "ctaBand",
          heading: "Ready to Source With Confidence?",
          primaryCta: REQUEST_QUOTE_CTA,
          secondaryCta: { label: "Chat on WhatsApp", href: waHref },
        }}
        index={0}
      />
    </main>
  );
}
