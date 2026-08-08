import { getPayload } from "payload";
import config from "@payload-config";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HeroBlock } from "@/components/blocks/HeroBlock";
import { CTABandBlock } from "@/components/blocks/CTABandBlock";
import { InsightCard } from "@/components/insights/InsightCard";
import { LocaleFallbackNotice } from "@/components/chrome/LocaleFallbackNotice";
import { Reveal } from "@/components/motion/Reveal";
import { RevealItem } from "@/components/motion/RevealItem";
import { getSiteBrand } from "@/lib/payload-fetch";
import { buildMetadata } from "@/lib/seo/metadata";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";
import type { Insight, Media } from "../../../../../payload-types";

// T-204 follow-up (D-50): same gap/fix as products/page.tsx — no CMS Pages
// doc backs `/insights`, route is structurally available in every locale.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    title: "Insights | VNP Global",
    description:
      "Export guidance, industry updates, and buyer resources from VNP Global — an India-based agricultural and food products exporter.",
    translatedLocales: [...routing.locales],
    path: "/insights",
    locale: locale as Locale,
  });
}

// ISR: 1hr staleness fallback, not the freshness mechanism — CMS edits
// (Insights/SiteSettings) appear instantly via the on-demand revalidateInsight
// hook that fires on save. This timer only catches pages that never got an
// explicit revalidatePath call. D-48: was 60s, which turned every ordinary
// page visit + redeploy during active dev into a fresh ISR write and burned
// the Vercel free-tier 200k/mo quota pre-launch.
export const revalidate = 3600;

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
  const { waHref, insightsHeroUrl } = await getSiteBrand();

  // Pre-seed state: zero published articles. Whole-page empty state, still
  // wrapped in a data-testid="hero" region so nav-links.spec's "every nav
  // target renders a hero" assertion holds even before content exists.
  if (insights.length === 0) {
    return (
      <main>
        {locale !== "en" ? <LocaleFallbackNotice locale={locale as Locale} /> : null}
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
      {locale !== "en" ? <LocaleFallbackNotice locale={locale as Locale} /> : null}
      <HeroBlock
        block={{
          blockType: "hero",
          variant: "compact",
          headline: t("heading"),
          heroImage: insightsHeroUrl
            ? ({ url: insightsHeroUrl, alt: t("heading") } as Media)
            : null,
        }}
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

      {/* WR-01: this page bypasses RenderBlocks (hand-built, not a CMS Page
          layout), so CTABandBlock needs its own Reveal wrap to match the
          scroll-reveal treatment every CMS Page gets automatically. */}
      <Reveal>
        <CTABandBlock
          block={{
            blockType: "ctaBand",
            // T-208/CONTENT_PLAYBOOK §1: banned rhetorical-question heading pattern.
            heading: "Source With Confidence",
            primaryCta: REQUEST_QUOTE_CTA,
            secondaryCta: { label: "Chat on WhatsApp", href: waHref },
          }}
          index={1}
        />
      </Reveal>
    </main>
  );
}
