import { Fragment } from "react";
import { Card } from "@/components/ui/card";

type PackagingOption = {
  format?: string | null;
  netWeight?: string | null;
  unitsPerCarton?: number | null;
  cartonsPerPallet?: number | null;
};

// T-103/T-105/COMPONENT_LIBRARY C-14: packaging FORMATS table. Distinct from
// SpecTable's single packaging text row (the old flat field, still used as a
// fallback by ProductSpecSections when this array is empty) — this renders
// each real option as its own row across format/net weight/units-per-carton/
// cartons-per-pallet. Self-omits when empty (CAT-04).
export function ProductPackagingOptions({
  options,
  title,
}: {
  options: PackagingOption[];
  title: string;
}) {
  if (options.length === 0) return null;

  return (
    <Card className="gap-sm rounded-card border border-neutral-300 bg-white p-lg shadow-card">
      <p className="text-body font-semibold text-neutral-900">{title}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-start text-body">
          <tbody>
            {options.map((opt, i) => (
              <Fragment key={i}>
                <tr className={i === 0 ? "" : "border-t border-neutral-300"}>
                  <td className="py-sm pe-md font-semibold text-neutral-900">{opt.format}</td>
                  <td className="py-sm pe-md text-neutral-600">{opt.netWeight}</td>
                  <td className="py-sm pe-md tabular-nums text-neutral-600">
                    {opt.unitsPerCarton ? `${opt.unitsPerCarton}/carton` : null}
                  </td>
                  <td className="py-sm tabular-nums text-neutral-600">
                    {opt.cartonsPerPallet ? `${opt.cartonsPerPallet}/pallet` : null}
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
