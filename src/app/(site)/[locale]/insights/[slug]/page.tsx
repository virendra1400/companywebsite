import { notFound } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";
import type { Metadata } from "next";
import { getFormatter, getTranslations, setRequestLocale } from "next-intl/server";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { ChevronRight, ImageOff } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { CTABandBlock } from "@/components/blocks/CTABandBlock";
import { LocaleFallbackNotice } from "@/components/chrome/LocaleFallbackNotice";
import { getSiteBrand } from "@/lib/payload-fetch";
import { buildMetadata } from "@/lib/seo/metadata";
import { getTranslatedLocales } from "@/lib/seo/translated-locales";
import { localeUrl } from "@/lib/seo/alternates";
import { JsonLd, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import type { Locale } from "@/i18n/routing";
import type { Media, Category, Insight } from "../../../../../../payload-types";

// ISR: 1hr staleness fallback, not the freshness mechanism — CMS edits
// (Insights/SiteSettings) appear instantly via the on-demand revalidateInsight
// hook that fires on save. This timer only catches pages that never got an
// explicit revalidatePath call. D-48: was 60s, which turned every ordinary
// page visit + redeploy during active dev into a fresh ISR write and burned
// the Vercel free-tier 200k/mo quota pre-launch.
export const revalidate = 3600;

const REQUEST_QUOTE_CTA = { label: "Request a Quote", href: "/contact" };

// D-07/getProduct dual-query pattern retargeted at "insights". Hard-filters
// published:true (T-05-02) so a draft never reaches the public article page
// even via a guessed/shared slug.
async function getInsight(
  slug: string,
  locale: Locale,
): Promise<{ article: Insight | null; isTranslated: boolean }> {
  const payload = await getPayload({ config });

  const display = await payload.find({
    collection: "insights",
    where: { slug: { equals: slug }, published: { equals: true } },
    limit: 1,
    locale,
    fallbackLocale: locale === "en" ? undefined : "en",
    overrideAccess: true,
  });

  const nativeCheck = await payload.find({
    collection: "insights",
    where: { slug: { equals: slug }, published: { equals: true } },
    limit: 1,
    locale,
    fallbackLocale: false,
    overrideAccess: true,
  });

  const article = display.docs[0] ?? null;
  const isTranslated = locale === "en" || Boolean(nativeCheck.docs[0]?.title);

  return { article, isTranslated };
}

// CAT-03-style enumeration — query Payload for published insight slugs, not a
// hardcoded list. dynamicParams stays at the Next default (true) so a new
// article renders on first request without a rebuild.
export async function generateStaticParams() {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "insights",
    where: { published: { equals: true } },
    locale: "en",
    overrideAccess: true,
    limit: 500,
  });
  return result.docs.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const { article } = await getInsight(slug, locale as Locale);
  if (!article) return {};

  const translatedLocales = await getTranslatedLocales("insights", slug);
  const cover = article.coverImage && typeof article.coverImage === "object"
    ? (article.coverImage as Media)
    : null;

  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    imageUrl: cover?.url,
    translatedLocales,
    path: `/insights/${slug}`,
    locale: locale as Locale,
  });
}

export default async function InsightArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("insights");
  const format = await getFormatter();

  const { article, isTranslated } = await getInsight(slug, locale as Locale);
  const { waHref } = await getSiteBrand();
  if (!article) notFound();

  const category = typeof article.category === "object" ? (article.category as Category) : null;
  const cover = article.coverImage && typeof article.coverImage === "object"
    ? (article.coverImage as Media)
    : null;
  // FOUND-03: force Western (latn) digits — Intl defaults `ar` to Arabic-Indic.
  const date = article.publishedDate
    ? format.dateTime(new Date(article.publishedDate), "latn")
    : null;

  const insightsUrl = localeUrl(locale as Locale, "/insights");
  const articleUrl = localeUrl(locale as Locale, `/insights/${slug}`);

  return (
    <main>
      {!isTranslated ? <LocaleFallbackNotice locale={locale as Locale} /> : null}

      <JsonLd
        data={breadcrumbJsonLd([
          { name: t("breadcrumbRoot"), url: insightsUrl },
          { name: article.title, url: articleUrl },
        ])}
      />

      {/* PageHeader — 2-level breadcrumb only (Insights / title), no
          category crumb (D-11 — categories have no dedicated archive page). */}
      <header className="bg-white px-md py-lg md:px-lg md:py-xl xl:px-xl">
        <div className="mx-auto max-w-[1280px]">
          <nav aria-label="Breadcrumb" className="flex items-center gap-xs text-label text-neutral-600">
            <Link href="/insights" className="hover:text-neutral-900">
              {t("breadcrumbRoot")}
            </Link>
            <ChevronRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            <span aria-current="page" className="text-neutral-900">
              {article.title}
            </span>
          </nav>
          <h1 className="mt-sm text-display font-semibold text-neutral-900">{article.title}</h1>
          <div className="mt-sm flex flex-wrap items-center gap-sm">
            {category ? (
              <Badge variant="secondary" className="w-fit bg-neutral-100 text-neutral-900">
                {category.name}
              </Badge>
            ) : null}
            <p className="text-label text-neutral-600">
              {date
                ? t("byline", { author: article.author || "Export Team", date })
                : `By ${article.author || "Export Team"}`}
            </p>
          </div>
        </div>
      </header>

      {/* Cover image banner — this page's LCP candidate. */}
      <section className="bg-white px-md py-lg md:px-lg md:py-xl xl:px-xl">
        <div className="mx-auto max-w-[1280px]">
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md bg-neutral-100">
            {cover?.url ? (
              <Image src={cover.url} alt={cover.alt} fill priority className="object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center">
                <ImageOff aria-hidden="true" className="size-8 text-neutral-600" />
              </div>
            )}
          </AspectRatio>
        </div>
      </section>

      <section className="bg-white px-md py-lg md:px-lg md:py-xl xl:px-xl">
        <div className="mx-auto max-w-[720px] text-body text-neutral-900">
          <RichText data={article.body} />
        </div>
      </section>

      <CTABandBlock
        block={{
          blockType: "ctaBand",
          // T-208/CONTENT_PLAYBOOK §1: banned rhetorical-question heading pattern.
          heading: "Source With Confidence",
          primaryCta: REQUEST_QUOTE_CTA,
          secondaryCta: { label: "Chat on WhatsApp", href: waHref },
        }}
        index={0}
      />
    </main>
  );
}
