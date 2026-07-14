import { setRequestLocale } from "next-intl/server";
import { getHomeContent } from "@/lib/payload-fetch";
import { Hero } from "@/components/Hero";
import { LocaleFallbackNotice } from "@/components/chrome/LocaleFallbackNotice";
import type { Locale } from "@/i18n/routing";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { content, isTranslated } = await getHomeContent(locale as Locale);

  return (
    <main>
      {!isTranslated ? <LocaleFallbackNotice locale={locale as Locale} /> : null}
      <Hero content={content} />
    </main>
  );
}
