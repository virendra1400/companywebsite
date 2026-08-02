import { Card } from "@/components/ui/card";

// T-103/T-105/COMPONENT_LIBRARY C-15: container-loading facts, shown to
// buyers sizing a shipment. Self-omits when every field is empty (CAT-04).
export function ProductContainerCard({
  teu20Units,
  teu20NetMT,
  palletNote,
  unitsLabel,
  netMtLabel,
  title,
}: {
  teu20Units?: number | null;
  teu20NetMT?: number | null;
  palletNote?: string | null;
  unitsLabel: string;
  netMtLabel: string;
  title: string;
}) {
  if (!teu20Units && !teu20NetMT && !palletNote) return null;

  return (
    <Card className="gap-sm rounded-card border border-neutral-300 bg-white p-lg shadow-card">
      <p className="text-body font-semibold text-neutral-900">{title}</p>
      <div className="flex flex-wrap gap-lg">
        {teu20Units ? (
          <div>
            <p className="text-display font-semibold tabular-nums text-primary-700">{teu20Units}</p>
            <p className="text-label text-neutral-600">{unitsLabel}</p>
          </div>
        ) : null}
        {teu20NetMT ? (
          <div>
            <p className="text-display font-semibold tabular-nums text-primary-700">{teu20NetMT}</p>
            <p className="text-label text-neutral-600">{netMtLabel}</p>
          </div>
        ) : null}
      </div>
      {palletNote ? <p className="text-label text-neutral-600">{palletNote}</p> : null}
    </Card>
  );
}
