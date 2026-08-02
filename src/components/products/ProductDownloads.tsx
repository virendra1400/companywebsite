import { Download } from "lucide-react";
import { Card } from "@/components/ui/card";

type DownloadItem = { label?: string | null; file?: { url?: string | null } | number | null };

// T-103/T-105/COMPONENT_LIBRARY C-16: per-product downloads (spec sheets,
// COAs). Self-omits when empty (CAT-04). Media-populate guard matches the
// same `typeof === "object"` pattern used across every other block.
export function ProductDownloads({ downloads, title }: { downloads: DownloadItem[]; title: string }) {
  const items = downloads
    .map((d) => ({
      label: d.label ?? "",
      url: d.file && typeof d.file === "object" ? (d.file.url ?? null) : null,
    }))
    .filter((d): d is { label: string; url: string } => Boolean(d.url));

  if (items.length === 0) return null;

  return (
    <Card className="gap-sm rounded-card border border-neutral-300 bg-white p-lg shadow-card">
      <p className="text-body font-semibold text-neutral-900">{title}</p>
      <ul className="flex flex-col gap-xs">
        {items.map((item, i) => (
          <li key={i}>
            <a
              href={item.url}
              download
              className="flex items-center gap-xs text-body text-primary-700 underline-offset-4 hover:underline"
            >
              <Download aria-hidden="true" className="size-4 shrink-0" />
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </Card>
  );
}
