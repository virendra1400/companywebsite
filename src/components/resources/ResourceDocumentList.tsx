"use client";

import { Download, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";
import type { ResourceDocument } from "@/lib/payload-fetch";

// Rough "type" label from mimeType — PDF is the only format this codebase's
// upload fields (spec sheets, COAs, certs) currently target, but this stays
// generic rather than hardcoding "PDF" so an image/doc upload doesn't lie.
function formatType(mimeType?: string | null): string {
  if (!mimeType) return "";
  if (mimeType === "application/pdf") return "PDF";
  const subtype = mimeType.split("/")[1];
  return subtype ? subtype.toUpperCase() : mimeType;
}

function formatSize(bytes?: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// T-202/COMPONENT_LIBRARY C-16: "Row per document: icon, title, type+size,
// ungated download." Self-omits (whole list, not just this component) when
// `items` is empty — same CAT-04 discipline as ProductDownloads/CertCard;
// caller decides whether an empty section renders at all.
export function ResourceDocumentList({
  items,
  unavailableLabel,
  downloadLabel,
}: {
  items: ResourceDocument[];
  unavailableLabel: string;
  downloadLabel: string;
}) {
  if (items.length === 0) return null;

  return (
    <Card className="gap-0 divide-y divide-neutral-200 rounded-card border border-neutral-300 bg-white p-0 shadow-card">
      {items.map((item, i) => {
        const meta = [formatType(item.mimeType), formatSize(item.filesize)].filter(Boolean).join(" · ");

        return (
          <div key={i} className="flex items-center gap-sm px-lg py-md">
            {item.url ? (
              <Download aria-hidden="true" className="size-5 shrink-0 text-primary-700" />
            ) : (
              <FileText aria-hidden="true" className="size-5 shrink-0 text-neutral-400" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-body font-medium text-neutral-900">{item.title}</p>
              {meta ? <p className="text-label text-neutral-600">{meta}</p> : null}
            </div>
            {item.url ? (
              <a
                href={item.url}
                download
                onClick={() => trackEvent("spec_download", { title: item.title })}
                className="shrink-0 text-label font-medium text-primary-700 underline-offset-4 hover:underline"
              >
                {downloadLabel}
              </a>
            ) : (
              <span className="shrink-0 text-label text-neutral-500">{unavailableLabel}</span>
            )}
          </div>
        );
      })}
    </Card>
  );
}
