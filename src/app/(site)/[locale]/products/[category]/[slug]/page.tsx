import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
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
import { SpecTable, type SpecRow } from "@/components/products/SpecTable";
import { ProductSpecSections } from "@/components/products/ProductSpecSections";
import { ProductPackagingOptions } from "@/components/products/ProductPackagingOptions";
import { ProductContainerCard } from "@/components/products/ProductContainerCard";
import { ProductDownloads } from "@/components/products/ProductDownloads";
import { ProductFaq } from "@/components/products/ProductFaq";
import { LocaleFallbackNotice } from "@/components/chrome/LocaleFallbackNotice";
import { getProduct, getSiteBrand } from "@/lib/payload-fetch";
import { getTranslatedLocales } from "@/lib/seo/translated-locales";
import { buildMetadata } from "@/lib/seo/metadata";
import { localeUrl, localePath } from "@/lib/seo/alternates";
import { JsonLd, productJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo/json-ld";
import type { Locale } from "@/i18n/routing";
import type { Media, Category, Certification } from "../../../../../../../payload-types";

// ISR: CMS edits (Pages/Products/SiteSettings) appear within 60s without a redeploy.
// Complements the on-demand revalidate hooks (instant when they fire).
export const revalidate = 60;

const REQUEST_QUOTE_CTA = { label: "Request a Quote", href: "/contact" };

// T-105/MASTER_PLAN §5.2: nested URL is /products/{category.slug}/{product.slug}
// (LOCKED — E-01). Queries products WITH category populated so both segments
// are known at build time — contrast the old [slug]-only route, which now
// exists purely as a 301 redirect shim (see the sibling ../[slug]/page.tsx).
export async function generateStaticParams() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "products",
    where: { published: { equals: true } },
    locale: "en",
    overrideAccess: true,
    limit: 500,
    depth: 1,
  });
  return result.docs
    .filter((doc): doc is typeof doc & { category: Category } => typeof doc.category === "object")
    .map((doc) => ({ category: doc.category.slug, slug: doc.slug }));
}

// SEO-01/02/05: delegates to the shared buildMetadata/getTranslatedLocales
// glue (05-02) — same reciprocal alternates map sitemap.ts uses (Pitfall 1).
// T-103/T-105: product.seo overrides win over the name/shortDescription
// default when an editor has actually filled them in.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const { product } = await getProduct(slug, locale as Locale);
  if (!product) return {};

  const category = typeof product.category === "object" ? (product.category as Category) : null;
  const images = (product.imageGallery ?? [])
    .map((item) => (item.image && typeof item.image === "object" ? (item.image as Media) : null))
    .filter((img): img is Media => Boolean(img?.url));
  const seoImage =
    product.seo?.ogImage && typeof product.seo.ogImage === "object"
      ? (product.seo.ogImage as Media)
      : null;

  const translatedLocales = await getTranslatedLocales("products", slug);
  return buildMetadata({
    title: product.seo?.title || product.name,
    description: product.seo?.description || product.shortDescription,
    imageUrl: seoImage?.url || images[0]?.url,
    translatedLocales,
    path: `/products/${category?.slug ?? "product"}/${slug}`,
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const { locale, category: categoryParam, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("products");
  const tCerts = await getTranslations("certs");

  const { product, isTranslated } = await getProduct(slug, locale as Locale);
  const { waHref } = await getSiteBrand();
  if (!product) notFound();

  const category = typeof product.category === "object" ? (product.category as Category) : null;

  // Canonicalize: a product's category can change in the CMS after this URL
  // was shared/indexed. Redirect to the current real path rather than
  // silently serving the product under a stale category segment (would
  // create two indexable URLs for the same product).
  if (category && category.slug !== categoryParam) {
    permanentRedirect(localePath(locale as Locale, `/products/${category.slug}/${slug}`));
  }

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
  const detailPath = `/products/${category?.slug ?? categoryParam}/${slug}`;

  // No category archive route exists to link to, so a category crumb would
  // have to reuse the "/products" URL — an invalid duplicate-URL
  // BreadcrumbList (WR-01). Omit it rather than fake a distinct URL. (The
  // category IS now part of the product's own URL segment, but that's a
  // namespace, not a separately-crawlable listing page.)
  const breadcrumbTrail = [
    { name: t("breadcrumbRoot"), url: localeUrl(locale as Locale, "/products") },
    { name: product.name, url: localeUrl(locale as Locale, detailPath) },
  ];

  // T-103/T-105: structured specs win when populated; the old flat
  // `specifications` array is the fallback (D-30 — real catalog data still
  // lives there until T-110 migrates it).
  const specCategories = [
    { key: "physicoChemical", title: t("specsPhysicoChemical"), rows: product.specs?.physicoChemical },
    { key: "organoleptic", title: t("specsOrganoleptic"), rows: product.specs?.organoleptic },
    { key: "microbiological", title: t("specsMicrobiological"), rows: product.specs?.microbiological },
    { key: "contaminants", title: t("specsContaminants"), rows: product.specs?.contaminants },
  ];
  const legacyRows: SpecRow[] = (product.specifications ?? []).map((row) => ({
    label: row.label,
    value: row.value,
  }));

  // Quick facts (shelf life / storage / MOQ) — new T-103 fields, independent
  // of the old flat specifications, so shown whenever any is filled in.
  const quickFacts: SpecRow[] = [
    product.shelfLife ? { label: t("shelfLifeLabel"), value: product.shelfLife } : null,
    product.storageTemp ? { label: t("storageTempLabel"), value: product.storageTemp } : null,
    product.moqRange ? { label: t("moqRangeLabel"), value: product.moqRange } : null,
  ].filter((row): row is SpecRow => row !== null);

  const applications = (product.applications ?? []).filter((a): a is string => Boolean(a));
  const faqItems = (product.faq ?? [])
    .filter((item): item is { q: string; a: string; id?: string | null } => Boolean(item.q && item.a))
    .map((item) => ({ q: item.q, a: item.a }));

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
      {faqItems.length > 0 ? <JsonLd data={faqJsonLd(faqItems)} /> : null}
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
          {applications.length > 0 ? (
            <div className="mt-sm flex flex-wrap gap-xs">
              {applications.map((app, i) => (
                <span
                  key={i}
                  className="rounded-full bg-primary-100 px-sm py-xs text-label text-primary-700"
                >
                  {app}
                </span>
              ))}
            </div>
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
            <Button asChild className="mt-lg">
              <a href={rfqHref}>{t("rfqCta")}</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Structured content region: spec sections (or legacy fallback),
          quick facts, packaging options, container loading — each self-omits
          when empty (CAT-04). */}
      <section className="bg-neutral-100 px-md py-lg md:px-lg md:py-xl xl:px-xl">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-lg">
          <ProductSpecSections
            categories={specCategories}
            legacyRows={legacyRows}
            legacyPackaging={product.packaging ?? undefined}
            packagingLabel={t("packagingLabel")}
          />
          {quickFacts.length > 0 ? (
            <SpecTable rows={quickFacts} packagingLabel={t("packagingLabel")} />
          ) : null}
          <ProductPackagingOptions
            options={product.packagingOptions ?? []}
            title={t("packagingOptionsTitle")}
          />
          <ProductContainerCard
            teu20Units={product.containerLoading?.teu20Units}
            teu20NetMT={product.containerLoading?.teu20NetMT}
            palletNote={product.containerLoading?.palletNote}
            unitsLabel={t("containerUnitsLabel")}
            netMtLabel={t("containerNetMtLabel")}
            title={t("containerLoadingTitle")}
          />
          <ProductDownloads downloads={product.downloads ?? []} title={t("downloadsTitle")} />
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

      {faqItems.length > 0 ? (
        <section className="bg-neutral-100 px-md py-lg md:px-lg md:py-xl xl:px-xl">
          <div className="mx-auto max-w-[720px]">
            <ProductFaq items={faqItems} title={t("faqTitle")} />
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
