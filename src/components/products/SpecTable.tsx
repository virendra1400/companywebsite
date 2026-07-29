import { Fragment } from "react";
import { Card } from "@/components/ui/card";

export type SpecRow = { label: string; value: string };

// UI-SPEC §SpecTable (D-04) — the core new primitive this phase. Semantic
// <dl>/<dt>/<dd> (screen readers associate each value with its label), laid
// out as a 2-col CSS Grid (taste-technique: grid over row-heavy borders/
// calc()). Region omits entirely when there's nothing to show (rows empty AND
// no packaging); packaging renders as one additional row, omitted on its own
// if falsy — never a whole empty-table shell.
export function SpecTable({
  rows,
  packaging,
  packagingLabel,
}: {
  rows: SpecRow[];
  packaging?: string;
  packagingLabel: string;
}) {
  const allRows = packaging ? [...rows, { label: packagingLabel, value: packaging }] : rows;
  if (allRows.length === 0) return null;

  return (
    // 08-UI-SPEC Contract §2 — hairline card recipe convergence (data-panel bg-neutral-100 retained)
    <Card className="gap-0 rounded-card border border-neutral-300 bg-neutral-100 p-lg shadow-card">
      <dl className="grid grid-cols-[minmax(120px,auto)_1fr] md:grid-cols-[minmax(160px,auto)_1fr]">
        {allRows.map((row, i) => {
          const isLast = i === allRows.length - 1;
          const borderClass = isLast ? "" : "border-b border-neutral-300";
          return (
            <Fragment key={i}>
              <dt className={`py-sm text-label text-neutral-600 text-start ${borderClass}`}>
                {row.label}
              </dt>
              <dd
                className={`py-sm text-body font-semibold text-neutral-900 text-start break-words ${borderClass}`}
              >
                {row.value}
              </dd>
            </Fragment>
          );
        })}
      </dl>
    </Card>
  );
}
