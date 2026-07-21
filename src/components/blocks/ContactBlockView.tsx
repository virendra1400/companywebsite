import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { MapPin, Phone, Mail } from "lucide-react";
import { ContactForm } from "./ContactForm";
import { sectionBg } from "./RenderBlocks";
import { getSiteBrand } from "@/lib/payload-fetch";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { WhatsAppTrackedLink } from "@/components/chrome/WhatsAppTrackedLink";
import type { Page } from "../../../payload-types";

type ContactBlockData = Extract<NonNullable<Page["layout"]>[number], { blockType: "contactBlock" }>;

// UI-SPEC §9 — two-column layout: info column first/inline-start, form
// column second/inline-end; single column stacked on mobile, same DOM order
// (RTL Extensions "Contact form field order" — normal DOM order + logical
// grid handles LTR/RTL swap automatically, no manual reordering needed).
export async function ContactBlockView({ block, index }: { block: ContactBlockData; index: number }) {
  const t = await getTranslations("contact");
  const { email, phone, whatsapp } = await getSiteBrand();
  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    "Hi, I'd like to enquire about your products.",
  )}`;

  return (
    <section className={`${sectionBg(index)} px-md py-2xl md:px-lg md:py-3xl xl:px-xl`}>
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-2xl lg:grid-cols-2">
        <div className="flex flex-col gap-md">
          {block.intro ? <p className="text-body">{block.intro}</p> : null}
          <p className="flex items-start gap-xs text-body">
            <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0" />
            <span>{block.address}</span>
          </p>
          {/* WhatsApp: NOT icon-only — visible text label + value beside the
              icon, plus aria-label (UI-SPEC §9 explicit requirement). */}
          <WhatsAppTrackedLink
            href={waHref}
            location="contact-page"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("whatsappAria")}
            className="flex items-center gap-xs text-body hover:text-primary-700"
          >
            <WhatsAppIcon className="size-4 shrink-0" />
            <span>
              {t("whatsappLabel")} ({whatsapp})
            </span>
          </WhatsAppTrackedLink>
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-xs text-body hover:text-primary-700"
          >
            <Mail aria-hidden="true" className="size-4 shrink-0" />
            <span>{email}</span>
          </a>
          <a
            href={`tel:${phone}`}
            className="flex items-center gap-xs text-body hover:text-primary-700"
          >
            <Phone aria-hidden="true" className="size-4 shrink-0" />
            <span>{phone}</span>
          </a>
        </div>
        {/* ContactForm reads the `?product=`/`productName=` query params via
            useSearchParams() (D-02/D-03, RFQ mode) — Next.js requires a
            Suspense boundary around any client subtree using that hook so
            this statically-generated page (revalidate=60) doesn't fail to
            build. */}
        <Suspense fallback={null}>
          <ContactForm />
        </Suspense>
      </div>
    </section>
  );
}
