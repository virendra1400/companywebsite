import { setRequestLocale } from "next-intl/server";
import { getPageContent } from "@/lib/payload-fetch";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import { LocaleFallbackNotice } from "@/components/chrome/LocaleFallbackNotice";
import type { Locale } from "@/i18n/routing";

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
