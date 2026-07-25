import { getTranslations } from "next-intl/server";
import { WhatsAppTrackedLink } from "@/components/chrome/WhatsAppTrackedLink";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { getSiteBrand } from "@/lib/payload-fetch";

// Single sitewide floating WhatsApp CTA, additive to the existing contextual
// WhatsApp CTAs (hero, CTABand, contact block, header icon, mobile nav) — no
// existing call site is touched. RTL via logical props only (`end-md`), auto
// mirrors to the inline-start corner in Arabic.
export async function WhatsAppFloatingButton() {
  const { waHref } = await getSiteBrand();
  const t = await getTranslations("contact");

  return (
    <WhatsAppTrackedLink
      href={waHref}
      location="floating-button"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("whatsappAria")}
      className="fixed bottom-md end-md z-40 inline-flex size-14 items-center justify-center rounded-full bg-primary-700 text-white shadow-card-hover transition-colors hover:bg-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
    >
      <WhatsAppIcon className="size-7" />
    </WhatsAppTrackedLink>
  );
}
