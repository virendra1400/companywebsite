import Image from "next/image";
import { Download, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { isSvgUrl } from "@/lib/is-svg-url";
import type { Media } from "../../../payload-types";

// UI-SPEC §5 — the single reusable primitive shared by CertStrip's grid
// variant, the full Certifications page grid, AND (per UI-SPEC's Page
// Composition table for Company/Compliance) the later company-profile
// document card. GENERIC prop shape on purpose — never a raw Certification —
// so that reuse doesn't require a second component.
export type CertCardProps = {
  name: string;
  subtitle?: string;
  logo: Media | null;
  pdf: Media | null;
  halal?: boolean;
  // T-106/COMPONENT_LIBRARY C-07: status board fields. `status` structurally
  // guards the "never render a cert as held without a number" QA rule below
  // — it's not just editorial discipline, a registered cert with no number
  // renders as in-certification instead of silently claiming "held".
  status?: "registered" | "in-certification" | null;
  number?: string | null;
  scope?: string | null;
  targetDate?: string | null;
  t: (key: string) => string;
};

export function CertCard({
  name,
  subtitle,
  logo,
  pdf,
  halal,
  status,
  number,
  scope,
  targetDate,
  t,
}: CertCardProps) {
  const isRegistered = status === "registered" && Boolean(number);

  return (
    <Card
      className={
        halal
          ? "col-span-2 gap-sm rounded-card border-2 border-accent-600 bg-white p-lg shadow-card md:col-span-2"
          : "gap-sm rounded-card border border-neutral-300 bg-white p-lg shadow-card"
      }
    >
      {halal || status ? (
        <div className="flex flex-wrap items-center gap-xs">
          {halal ? <Badge className="w-fit bg-accent-100 text-accent-800">{t("halalBadge")}</Badge> : null}
          {status ? (
            <Badge
              variant="secondary"
              className={
                isRegistered
                  ? "w-fit bg-primary-100 text-primary-700"
                  : "w-fit bg-neutral-100 text-neutral-900"
              }
            >
              {isRegistered ? t("registeredBadge") : t("inCertificationBadge")}
            </Badge>
          ) : null}
        </div>
      ) : null}
      {/* No bg-white: the cert logos are transparent PNGs and the Card behind
          them is already white, so the fill only ever showed as a hard white
          rectangle wherever the card sat on a tinted section. */}
      <div className="relative aspect-[3/2] w-full">
        {logo?.url ? (
          <Image
            src={logo.url}
            alt={logo.alt}
            fill
            unoptimized={isSvgUrl(logo.url)}
            className="object-contain"
          />
        ) : (
          // No logo yet (in-certification, or not uploaded) — a text-only
          // placeholder, never an official cert-body logo before the
          // certification is actually granted.
          <div className="flex size-full items-center justify-center rounded-md bg-neutral-100">
            <ShieldCheck aria-hidden="true" className="size-8 text-neutral-600" />
          </div>
        )}
      </div>
      <p className="mt-md text-body font-semibold">{name}</p>
      {subtitle ? <p className="text-label text-neutral-600">{subtitle}</p> : null}
      {isRegistered && number ? (
        <p className="text-label text-neutral-600">
          {t("numberLabel")} {number}
        </p>
      ) : null}
      {scope ? (
        <p className="text-label text-neutral-600">
          {t("scopeLabel")}: {scope}
        </p>
      ) : null}
      {!isRegistered && targetDate ? (
        <p className="text-label text-neutral-600">
          {t("targetDateLabel")}: {targetDate}
        </p>
      ) : null}
      {pdf?.url ? (
        <a
          href={pdf.url}
          download
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Download ${name} certificate (PDF)`}
          className="mt-sm inline-flex items-center gap-xs text-label text-neutral-900 hover:text-accent-800"
        >
          <Download aria-hidden="true" className="size-4" />
          {t("downloadPdf")}
        </a>
      ) : (
        <p className="mt-sm text-label text-neutral-600">{t("pdfUnavailable")}</p>
      )}
    </Card>
  );
}
