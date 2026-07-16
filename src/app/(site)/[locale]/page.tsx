import { setRequestLocale } from "next-intl/server";
import { getPageContent } from "@/lib/payload-fetch";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import { LocaleFallbackNotice } from "@/components/chrome/LocaleFallbackNotice";
import type { Locale } from "@/i18n/routing";

// ISR: CMS edits (Pages/Products/SiteSettings) appear within 60s without a redeploy.
// Complements the on-demand revalidate hooks (instant when they fire).
export const revalidate = 60;

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
