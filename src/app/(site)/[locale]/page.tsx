import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getPageContent } from "@/lib/payload-fetch";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import { LocaleFallbackNotice } from "@/components/chrome/LocaleFallbackNotice";
import { getTranslatedLocales } from "@/lib/seo/translated-locales";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Media } from "../../../../payload-types";
import type { Locale } from "@/i18n/routing";

// ISR: 1hr staleness fallback, not the freshness mechanism — CMS edits
// (Pages/Products/SiteSettings) appear instantly via the on-demand revalidate
// hooks that fire on save. This timer only catches pages that never got an
// explicit revalidatePath call. D-48: was 60s, which turned every ordinary
// page visit + redeploy during active dev into a fresh ISR write and burned
// the Vercel free-tier 200k/mo quota pre-launch.
export const revalidate = 3600;

// T-204 follow-up (D-50): home had zero page-specific metadata, silently
// inheriting the root layout's generic default title/description on every
// locale. SEO_PLAYBOOK §3's own home title template, used as the fallback
// when the CMS seo override is blank — same buildMetadata pattern as the
// product-detail page.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { page } = await getPageContent("home", locale as Locale);
  const seoImage =
    page?.seo?.ogImage && typeof page.seo.ogImage === "object" ? (page.seo.ogImage as Media) : null;

  const translatedLocales = await getTranslatedLocales("pages", "home");
  return buildMetadata({
    title: page?.seo?.title || "VNP Global — Frozen Vegetables & Fruit Pulp Exporter, India",
    description:
      page?.seo?.description ||
      "VNP Global sources and exports agricultural products from India — quality control, documentation, and reliable communication built in from day one.",
    imageUrl: seoImage?.url,
    translatedLocales,
    path: "/",
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { page, isTranslated } = await getPageContent("home", locale as Locale);

  return (
    <main>
      {!isTranslated ? <LocaleFallbackNotice locale={locale as Locale} /> : null}
      <RenderBlocks blocks={page?.layout ?? []} />
    </main>
  );
}
