import Image from "next/image";
import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCertifications } from "@/lib/payload-fetch";
import { CertCard } from "./CertCard";
import { sectionBg } from "./RenderBlocks";
import type { Locale } from "@/i18n/routing";
import type { Page, Media } from "../../../payload-types";

type CertStripData = Extract<NonNullable<Page["layout"]>[number], { blockType: "certStrip" }>;

// UI-SPEC Block Library #5 — no cert data lives on the block itself; it
// queries the Certifications collection at render time via
// getCertifications(locale) (halal-first, RESEARCH Pitfall 3 Media guard
// repeated per-cert below). `grid` (Certifications page) renders the full
// CertCard; `strip` (homepage teaser) renders logos only, each linking to
// /certifications (TRUST-01/02). Locale is read internally via next-intl's
// getLocale() rather than prop-drilled — no sibling block (Hero/RichText/
// CTABand) currently receives locale as a prop either.
export async function CertStripBlock({ block, index }: { block: CertStripData; index: number }) {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("certs");
  const certs = await getCertifications(locale);

  return (
    <section className={`${sectionBg(index)} px-md py-2xl md:px-lg md:py-3xl xl:px-xl xl:py-4xl`}>
      <div className="mx-auto max-w-[1280px]">
        {block.sectionTitle ? (
          <h2 className="mb-lg text-heading font-semibold">{block.sectionTitle}</h2>
        ) : null}
        {block.intro ? (
          <p className="mb-lg max-w-[42rem] text-body text-neutral-600">{block.intro}</p>
        ) : null}

        {certs.length === 0 ? (
          // UI-SPEC Copywriting Contract — never render a blank grid.
          <div className="text-center">
            <h3 className="text-heading font-semibold">{t("comingSoonHeading")}</h3>
            <p className="mt-sm text-body text-neutral-600">{t("comingSoonBody")}</p>
          </div>
        ) : block.variant === "strip" ? (
          <div className="flex gap-lg overflow-x-auto md:flex-wrap md:overflow-visible">
            {certs.map((cert) => {
              const logo =
                cert.logo && typeof cert.logo === "object" ? (cert.logo as Media) : null;
              return (
                <Link
                  key={cert.id}
                  href="/certifications"
                  aria-label={cert.name}
                  className={`relative block h-16 w-24 shrink-0 bg-white ${
                    cert.halal ? "border-2 border-accent-600" : ""
                  }`}
                >
                  {logo?.url ? (
                    <Image src={logo.url} alt={logo.alt} fill className="object-contain" />
                  ) : null}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3">
            {certs.map((cert) => {
              const logo =
                cert.logo && typeof cert.logo === "object" ? (cert.logo as Media) : null;
              const pdf =
                cert.certificatePdf && typeof cert.certificatePdf === "object"
                  ? (cert.certificatePdf as Media)
                  : null;
              return (
                <CertCard
                  key={cert.id}
                  name={cert.name}
                  subtitle={cert.issuingBody}
                  logo={logo}
                  pdf={pdf}
                  halal={Boolean(cert.halal)}
                  t={(key) => t(key)}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
