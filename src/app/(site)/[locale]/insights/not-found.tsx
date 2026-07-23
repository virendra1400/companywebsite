import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// WR-03: /insights/[slug]'s notFound() was falling through to Next's generic
// boundary instead of the documented insights.notFoundHeading/notFoundBody
// copy (05-04-PLAN must-have) — this segment not-found.tsx is what Next
// renders instead.
//
// Next's App Router does NOT pass route params to not-found.tsx (verified:
// destructuring params here throws "Cannot destructure property 'locale' of
// undefined" during prerender), so this can't call setRequestLocale like a
// normal page. getTranslations() falls back to request-time locale detection,
// which opts this route segment (and its [slug] sibling) out of static
// generation — a real perf tradeoff (Phase 6/PERF-01 territory), not a
// functional bug. Correct 404 status + correct locale copy both still work.
export default async function InsightsNotFound() {
  const t = await getTranslations("insights");

  return (
    <main className="px-md py-3xl text-center md:px-lg xl:px-xl">
      <div className="mx-auto max-w-[640px]">
        <h1 className="text-display font-semibold text-neutral-900">{t("notFoundHeading")}</h1>
        <p className="mt-sm text-body text-neutral-600">{t("notFoundBody")}</p>
        <Link href="/insights" className="mt-lg inline-block text-primary-700 underline">
          {t("breadcrumbRoot")}
        </Link>
      </div>
    </main>
  );
}
