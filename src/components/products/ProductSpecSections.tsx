import { Fragment } from "react";
import { Card } from "@/components/ui/card";
import { SpecTable, type SpecRow } from "@/components/products/SpecTable";

type StructuredSpecRow = {
  parameter?: string | null;
  value?: string | null;
  unit?: string | null;
  method?: string | null;
};

type CategoryDef = { key: string; title: string; rows?: StructuredSpecRow[] | null };

// T-103/T-105/COMPONENT_LIBRARY C-13: 4-category structured spec table
// (physico-chemical/organoleptic/microbiological/contaminants). Falls back
// to the old flat `specifications` shape when every new category is still
// empty — T-110 hasn't migrated real product data into the new fields yet
// (D-30), so a hard cutover would silently drop the only spec data that
// currently exists on the live catalog. Each populated category renders as
// its own titled SpecTable; each row's optional unit is appended to the
// value, method shown as a smaller note (never invented — only rendered
// when the CMS row actually has one).
export function ProductSpecSections({
  categories,
  legacyRows,
  legacyPackaging,
  packagingLabel,
}: {
  categories: CategoryDef[];
  legacyRows: SpecRow[];
  legacyPackaging?: string;
  packagingLabel: string;
}) {
  const populated = categories.filter((c) => (c.rows?.length ?? 0) > 0);

  if (populated.length === 0) {
    return (
      <SpecTable rows={legacyRows} packaging={legacyPackaging} packagingLabel={packagingLabel} />
    );
  }

  return (
    <div className="flex flex-col gap-lg">
      {populated.map((category) => {
        const rows: SpecRow[] = (category.rows ?? []).map((row) => ({
          label: row.parameter ?? "",
          value: row.unit ? `${row.value ?? ""} ${row.unit}` : (row.value ?? ""),
        }));
        const methods = (category.rows ?? []).filter((row) => row.method);
        return (
          <Card
            key={category.key}
            className="gap-sm rounded-card border border-neutral-300 bg-neutral-100 p-lg shadow-card"
          >
            <p className="text-body font-semibold text-neutral-900">{category.title}</p>
            <SpecTable rows={rows} packagingLabel={packagingLabel} />
            {methods.length > 0 ? (
              <p className="mt-xs text-label text-neutral-600">
                {methods.map((row, i) => (
                  <Fragment key={row.parameter ?? i}>
                    {i > 0 ? " · " : null}
                    {row.parameter}: {row.method}
                  </Fragment>
                ))}
              </p>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
