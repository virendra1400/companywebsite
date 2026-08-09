import { Button } from "@/components/ui/button";
import { WhatsAppTrackedLink } from "@/components/chrome/WhatsAppTrackedLink";
import { getSiteBrand } from "@/lib/payload-fetch";
import type { Page } from "../../../payload-types";

type CTABandData = Extract<NonNullable<Page["layout"]>[number], { blockType: "ctaBand" }>;

// UI-SPEC Block Library #7 — full-width closing action band. Deliberately
// ignores the sectionBg alternation and always renders dark (bg-primary-900,
// matches the footer surface) per the UI-SPEC's documented exception.
export async function CTABandBlock({ block }: { block: CTABandData; index: number }) {
  // D-60: was reading block.secondaryCta.href directly — a value baked into
  // each page's seeded content at seed time (seed-content.ts's
  // WHATSAPP_PLACEHOLDER_LINK, same placeholder number on every page).
  // HeroBlock already ignores this same stale-seeded-href problem and pulls
  // from SiteSettings (single source of truth) instead; CTABandBlock never
  // got the same fix, so every "Chat on WhatsApp" button in a CTA band
  // (bottom of nearly every page) was frozen at whatever number existed
  // when that page's content was seeded, not the live SiteSettings number —
  // update the real number once in the CMS and every CTA band except this
  // one would follow; this one silently would not.
  const { waHref } = await getSiteBrand();
  return (
    <section className="bg-primary-900 px-md py-2xl text-center text-white md:px-lg md:py-3xl xl:px-xl xl:py-4xl">
      <div className="mx-auto flex max-w-[42rem] flex-col items-center gap-md">
        <h2 className="text-heading font-semibold">{block.heading}</h2>
        {block.body ? <p className="text-body text-primary-100">{block.body}</p> : null}
        <div className="flex flex-col items-center gap-sm sm:flex-row">
          {block.primaryCta?.label ? (
            <Button asChild>
              <a href={block.primaryCta.href || "/contact"}>
                {block.primaryCta.label}
              </a>
            </Button>
          ) : null}
          {block.secondaryCta?.label ? (
            <Button asChild variant="outlineOnDark">
              <WhatsAppTrackedLink href={waHref} location="cta-band">
                {block.secondaryCta.label}
              </WhatsAppTrackedLink>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
