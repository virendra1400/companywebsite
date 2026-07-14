import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

// D-06/FOUND-06: when the active locale has no real Home content, the page
// still renders the English content plus this small visible notice — never a
// blank/broken page. Copy comes from the `fallbackNotice.*` chrome strings
// (next-intl messages), translated into the visitor's own locale, not CMS
// content (UI-SPEC Copywriting Contract).
export async function LocaleFallbackNotice({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "fallbackNotice" });

  return (
    <div
      data-testid="fallback-notice"
      role="status"
      className="w-full bg-primary-100 px-md py-sm text-body text-neutral-900 md:px-lg xl:px-xl"
    >
      <p className="mx-auto max-w-[1280px] font-semibold">{t("heading")}</p>
      <p className="mx-auto max-w-[1280px]">{t("body")}</p>
    </div>
  );
}
