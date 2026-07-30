import { getPayload } from "payload";
import config from "@payload-config";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeroBlock } from "@/components/blocks/HeroBlock";
import { CTABandBlock } from "@/components/blocks/CTABandBlock";
import { InsightCard } from "@/components/insights/InsightCard";
import { RevealItem } from "@/components/motion/RevealItem";
import { getSiteBrand } from "@/lib/payload-fetch";
import type { Locale } from "@/i18n/routing";
import type { Insight } from "../../../../../payload-types";

// ISR: CMS edits (Insights/SiteSettings) appear within 60s without a
// redeploy. Complements the on-demand revalidateInsight hook.
export const revalidate = 60;

const REQUEST_QUOTE_CTA = { label: "Request a Quote", href: "/contact" };

// BLOG-01 — InsightsIndex. UI-SPEC: compact Hero -> flat reverse-chron
// InsightCard grid (no category grouping/anchor-nav, "Resolved discretion")
// -> CTABand. Query mirrors getProductsByCategory's inline shape.
async function getPublishedInsights(locale: Locale): Promise<Insight[]> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "insights",
    where: { published: { equals: true } },
    sort: "-publishedDate",
    locale,
    fallbackLocale: locale === "en" ? undefined : "en",
    overrideAccess: true,
    limit: 500,
  });
  return result.docs;
}

export default async function InsightsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("insights");
  const insights = await getPublishedInsights(locale as Locale);
  const { waHref } = await getSiteBrand();

  // Pre-seed state: zero published articles. Whole-page empty state, still
  // wrapped in a data-testid="hero" region so nav-links.spec's "every nav
  // target renders a hero" assertion holds even before content exists.
  if (insights.length === 0) {
    return (
      <main>
        <section
          data-testid="hero"
          className="flex min-h-[320px] flex-col items-center justify-center bg-primary-900 px-md py-3xl text-center text-white md:min-h-[400px] md:px-lg xl:px-xl"
        >
          <div className="mx-auto flex max-w-[640px] flex-col items-center gap-md">
            <h1 className="text-display font-semibold">{t("emptyHeading")}</h1>
            <p className="text-body text-primary-100">
              {t("emptyBody")}{" "}
              <Link href="/contact" className="underline decoration-accent-600">
                {t("emptyContactLinkLabel")}
              </Link>
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main>
      <HeroBlock
        block={{ blockType: "hero", variant: "compact", headline: t("heading") }}
        index={0}
      />

      <section className="px-md py-2xl md:px-lg md:py-3xl xl:px-xl">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-md md:grid-cols-2 md:gap-lg lg:grid-cols-3">
          {insights.map((insight, i) => (
            <RevealItem key={insight.id} index={i}>
              <InsightCard insight={insight} />
            </RevealItem>
          ))}
        </div>
      </section>

      <CTABandBlock
        block={{
          blockType: "ctaBand",
          heading: "Ready to Source With Confidence?",
          primaryCta: REQUEST_QUOTE_CTA,
          secondaryCta: { label: "Chat on WhatsApp", href: waHref },
        }}
        index={1}
      />
    </main>
  );
}
