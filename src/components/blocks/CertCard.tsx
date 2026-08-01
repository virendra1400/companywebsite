import Image from "next/image";
import { Download } from "lucide-react";
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
  t: (key: string) => string;
};

export function CertCard({ name, subtitle, logo, pdf, halal, t }: CertCardProps) {
  return (
    <Card
      className={
        halal
          ? "col-span-2 gap-sm rounded-card border-2 border-accent-600 bg-white p-lg shadow-card md:col-span-2"
          : "gap-sm rounded-card border border-neutral-300 bg-white p-lg shadow-card"
      }
    >
      {halal ? <Badge className="mb-sm w-fit bg-accent-100 text-accent-800">{t("halalBadge")}</Badge> : null}
      <div className="relative aspect-[3/2] w-full bg-white">
        {logo?.url ? (
          <Image
            src={logo.url}
            alt={logo.alt}
            fill
            unoptimized={isSvgUrl(logo.url)}
            className="object-contain"
          />
        ) : null}
      </div>
      <p className="mt-md text-body font-semibold">{name}</p>
      {subtitle ? <p className="text-label text-neutral-600">{subtitle}</p> : null}
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
