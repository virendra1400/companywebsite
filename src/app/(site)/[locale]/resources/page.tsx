import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeroBlock } from "@/components/blocks/HeroBlock";
import { CTABandBlock } from "@/components/blocks/CTABandBlock";
import { LocaleFallbackNotice } from "@/components/chrome/LocaleFallbackNotice";
import { Reveal } from "@/components/motion/Reveal";
import { ResourceDocumentList } from "@/components/resources/ResourceDocumentList";
import { getResourceDocuments, getSiteBrand } from "@/lib/payload-fetch";
import { buildMetadata } from "@/lib/seo/metadata";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/routing";

// T-202/PROMPT_LIBRARY P-09: no CMS Pages doc backs `/resources` — same
// reasoning as products/page.tsx and insights/page.tsx (structurally
// available in every locale via generateStaticParams, not content-gated).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({
    title: "Resources & Documentation | VNP Global",
    description:
      "Spec sheets, certifications, and company documentation from VNP Global — every download ungated, no signup required.",
    translatedLocales: [...routing.locales],
    path: "/resources",
    locale: locale as Locale,
  });
}

// ISR: 1hr staleness fallback, not the freshness mechanism — CMS edits
// (SiteSettings/Certifications/Products) appear instantly via the on-demand
// revalidate hooks that fire on save. D-48: was 60s on other routes before
// this one existed; this one starts at the corrected value.
export const revalidate = 3600;

const REQUEST_QUOTE_CTA = { label: "Request a Quote", href: "/contact" };

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("resources");
  const { waHref } = await getSiteBrand();
  const { siteDocuments, certificateDocuments, productDocuments } = await getResourceDocuments(
    locale as Locale,
  );

  const companyDocuments = [...siteDocuments, ...certificateDocuments];
  const isEmpty = companyDocuments.length === 0 && productDocuments.length === 0;

  return (
    <main>
      {locale !== "en" ? <LocaleFallbackNotice locale={locale as Locale} /> : null}
      <HeroBlock
        block={{ blockType: "hero", variant: "compact", headline: t("heading"), heroImage: null }}
        index={0}
      />

      {isEmpty ? (
        <section
          data-testid="resources-empty"
          className="px-md py-2xl text-center md:px-lg md:py-3xl xl:px-xl"
        >
          <div className="mx-auto flex max-w-[640px] flex-col gap-sm">
            <h2 className="text-heading font-semibold text-neutral-900">{t("emptyHeading")}</h2>
            <p className="text-body text-neutral-600">{t("emptyBody")}</p>
          </div>
        </section>
      ) : (
        <>
          {companyDocuments.length > 0 ? (
            <section className="bg-white px-md py-2xl md:px-lg md:py-3xl xl:px-xl">
              <div className="mx-auto flex max-w-[720px] flex-col gap-md">
                <h2 className="text-heading font-semibold text-neutral-900">{t("companyDocsHeading")}</h2>
                <ResourceDocumentList
                  items={companyDocuments}
                  unavailableLabel={t("unavailable")}
                  downloadLabel={t("download")}
                />
              </div>
            </section>
          ) : null}

          {productDocuments.length > 0 ? (
            <section className="bg-neutral-100 px-md py-2xl md:px-lg md:py-3xl xl:px-xl">
              <div className="mx-auto flex max-w-[720px] flex-col gap-md">
                <h2 className="text-heading font-semibold text-neutral-900">{t("productDocsHeading")}</h2>
                <ResourceDocumentList
                  items={productDocuments}
                  unavailableLabel={t("unavailable")}
                  downloadLabel={t("download")}
                />
              </div>
            </section>
          ) : null}
        </>
      )}

      {/* WR-01: this page bypasses RenderBlocks (hand-built, not a CMS Page
          layout), so CTABandBlock needs its own Reveal wrap to match the
          scroll-reveal treatment every CMS Page gets automatically. */}
      <Reveal>
        <CTABandBlock
          block={{
            blockType: "ctaBand",
            heading: "Need a Document You Don't See Here?",
            primaryCta: REQUEST_QUOTE_CTA,
            secondaryCta: { label: "Chat on WhatsApp", href: waHref },
          }}
          index={1}
        />
      </Reveal>
    </main>
  );
}
