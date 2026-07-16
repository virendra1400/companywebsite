import { getTranslations } from "next-intl/server";
import { MapPin, Phone, Mail } from "lucide-react";
import { ContactForm } from "./ContactForm";
import { sectionBg } from "./RenderBlocks";
import { getSiteBrand } from "@/lib/payload-fetch";
import type { Page } from "../../../payload-types";

type ContactBlockData = Extract<NonNullable<Page["layout"]>[number], { blockType: "contactBlock" }>;

// UI-SPEC §9 — single small hand-authored monochrome WhatsApp glyph (no
// dedicated Lucide brand icon exists); one component, no new icon-library
// dependency, per UI-SPEC's explicit instruction.
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.35 5.09L2 22l5.06-1.32A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Zm0 18a7.94 7.94 0 0 1-4.06-1.11l-.29-.17-3 .78.8-2.93-.19-.3A7.95 7.95 0 1 1 12 20Zm4.36-5.96c-.24-.12-1.4-.69-1.62-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.18-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.46-.39-.4-.54-.4h-.46c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.4-.57 1.6-1.12.2-.55.2-1.02.14-1.12-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

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
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("whatsappAria")}
            className="flex items-center gap-xs text-body hover:text-primary-700"
          >
            <WhatsAppIcon className="size-4 shrink-0" />
            <span>
              {t("whatsappLabel")} ({whatsapp})
            </span>
          </a>
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
        <ContactForm />
      </div>
    </section>
  );
}
