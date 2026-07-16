import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { getPageContent } from "@/lib/payload-fetch";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import { LocaleFallbackNotice } from "@/components/chrome/LocaleFallbackNotice";
import type { Locale } from "@/i18n/routing";

// ISR: CMS edits (Pages/Products/SiteSettings) appear within 60s without a redeploy.
// Complements the on-demand revalidate hooks (instant when they fire).
export const revalidate = 60;

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
