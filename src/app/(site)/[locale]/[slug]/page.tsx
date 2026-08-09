import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getPageContent } from "@/lib/payload-fetch";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import { LocaleFallbackNotice } from "@/components/chrome/LocaleFallbackNotice";
import { getTranslatedLocales } from "@/lib/seo/translated-locales";
import { buildMetadata } from "@/lib/seo/metadata";
import type { Media } from "../../../../../payload-types";
import type { Locale } from "@/i18n/routing";

// ISR: 1hr staleness fallback, not the freshness mechanism — CMS edits
// (Pages/Products/SiteSettings) appear instantly via the on-demand revalidate
// hooks that fire on save. This timer only catches pages that never got an
// explicit revalidatePath call. D-48: was 60s, which turned every ordinary
// page visit + redeploy during active dev into a fresh ISR write and burned
// the Vercel free-tier 200k/mo quota pre-launch.
export const revalidate = 3600;

// RESEARCH Pattern 6: a fixed, explicit set of interior slugs — not a
// `[...slug]` catch-all, which would falsely imply arbitrary editor-created
// pages (an anti-feature per REQUIREMENTS.md).
const INTERIOR_SLUGS = [
  "about",
  "certifications",
  "manufacturing",
  "export",
  "company",
  "contact",
] as const;

export function generateStaticParams() {
  return INTERIOR_SLUGS.map((slug) => ({ slug }));
}

// T-204 follow-up (D-50): none of the 6 interior pages had page-specific
// metadata — every one silently inherited the root layout's generic
// title/description. Fallback copy below is reused verbatim/near-verbatim
// from each page's own already-approved hero headline+subhead in
// seed-content.ts — repackaging existing copy into meta tags, not new
// content — overridden by the CMS seo group once an editor sets one.
const FALLBACK_SEO: Record<(typeof INTERIOR_SLUGS)[number], { title: string; description: string }> = {
  about: {
    title: "About VNP Global | India-Based Agricultural Exporter",
    description:
      "VNP Global sources and exports agricultural products, built from the ground up to meet the standards international buyers expect.",
  },
  certifications: {
    title: "Certifications & Quality Standards | VNP Global",
    description:
      "We're working toward the certifications international buyers expect. Check back as they're confirmed, or ask us directly.",
  },
  manufacturing: {
    title: "Inside Our Processing Facilities | VNP Global",
    description:
      "From intake to cold-chain dispatch, every stage of VNP Global's production is documented and quality-controlled.",
  },
  export: {
    title: "Markets We're Built to Serve | VNP Global",
    description:
      "VNP Global is positioned to export to the Gulf, Southeast Asia, and other international markets. Reach out to discuss your destination and requirements.",
  },
  company: {
    title: "Company & Compliance | VNP Global",
    description: "IEC and APEDA registration in progress, with full export documentation support on every order.",
  },
  contact: {
    title: "Contact VNP Global | Export Inquiries",
    description: "Reach VNP Global's export team. We respond to every inquiry within one business day.",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const { page } = await getPageContent(slug, locale as Locale);
  if (!page) return {};

  const fallback = FALLBACK_SEO[slug as (typeof INTERIOR_SLUGS)[number]];
  const seoImage =
    page.seo?.ogImage && typeof page.seo.ogImage === "object" ? (page.seo.ogImage as Media) : null;

  const translatedLocales = await getTranslatedLocales("pages", slug);
  return buildMetadata({
    title: page.seo?.title || fallback?.title || page.title,
    description: page.seo?.description || fallback?.description || page.title,
    imageUrl: seoImage?.url,
    translatedLocales,
    path: `/${slug}`,
    locale: locale as Locale,
  });
}

export default async function InteriorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const { page, isTranslated } = await getPageContent(slug, locale as Locale);
  if (!page) notFound();

  return (
    <main>
      {!isTranslated ? <LocaleFallbackNotice locale={locale as Locale} /> : null}
      <RenderBlocks blocks={page.layout ?? []} />
    </main>
  );
}
