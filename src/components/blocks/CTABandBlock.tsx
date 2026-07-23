import { Button } from "@/components/ui/button";
import { WhatsAppTrackedLink } from "@/components/chrome/WhatsAppTrackedLink";
import type { Page } from "../../../payload-types";

type CTABandData = Extract<NonNullable<Page["layout"]>[number], { blockType: "ctaBand" }>;

// UI-SPEC Block Library #7 — full-width closing action band. Deliberately
// ignores the sectionBg alternation and always renders dark (bg-primary-900,
// matches the footer surface) per the UI-SPEC's documented exception.
export function CTABandBlock({ block }: { block: CTABandData; index: number }) {
  return (
    <section className="bg-primary-900 px-md py-2xl text-center text-white md:px-lg md:py-3xl xl:px-xl xl:py-4xl">
      <div className="mx-auto flex max-w-[42rem] flex-col items-center gap-md">
        <h2 className="text-heading font-semibold">{block.heading}</h2>
        {block.body ? <p className="text-body text-primary-100">{block.body}</p> : null}
        <div className="flex flex-col items-center gap-sm sm:flex-row">
          {block.primaryCta?.label ? (
            <Button asChild className="hover:bg-primary-500 focus-visible:ring-accent-600">
              <a href={block.primaryCta.href || "/contact"}>
                {block.primaryCta.label}
              </a>
            </Button>
          ) : null}
          {block.secondaryCta?.label ? (
            <Button
              asChild
              variant="outline"
              className="border-white text-white hover:bg-white/10 focus-visible:ring-accent-600"
            >
              <WhatsAppTrackedLink href={block.secondaryCta.href || "#"} location="cta-band">
                {block.secondaryCta.label}
              </WhatsAppTrackedLink>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
