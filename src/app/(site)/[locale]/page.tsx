import { setRequestLocale } from "next-intl/server";
import { getPageContent } from "@/lib/payload-fetch";
import { RenderBlocks } from "@/components/blocks/RenderBlocks";
import { LocaleFallbackNotice } from "@/components/chrome/LocaleFallbackNotice";
import type { Locale } from "@/i18n/routing";

// ISR: 1hr staleness fallback, not the freshness mechanism — CMS edits
// (Pages/Products/SiteSettings) appear instantly via the on-demand revalidate
// hooks that fire on save. This timer only catches pages that never got an
// explicit revalidatePath call. D-48: was 60s, which turned every ordinary
// page visit + redeploy during active dev into a fresh ISR write and burned
// the Vercel free-tier 200k/mo quota pre-launch.
export const revalidate = 3600;

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
