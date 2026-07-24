import { getTranslations } from "next-intl/server";
import { sectionBg } from "./RenderBlocks";
import { WORLD_MAP_SVG } from "@/lib/world-map-svg";
import { COUNTRY_NAMES } from "@/lib/country-names";
import type { Page } from "../../../payload-types";

type ExportMapData = Extract<NonNullable<Page["layout"]>[number], { blockType: "exportMap" }>;
type Stat = { value: string; label: string };

// src/app/globals.css --color-primary-500 — served countries take the
// primary brand color, NOT gold (UI-SPEC: "a flood-filled map... takes the
// primary brand color", accent is reserved for trim/badges/dividers only).
const PRIMARY_500 = "#3D8266";

// Fills each world-map-svg.ts tile whose `id="<ISO_CODE>"` is in the served
// set. Plain string replace against our own self-authored, known-shape SVG
// (T-02-13) — not a map library, no interactivity/JS.
function highlightSvg(svg: string, codes: string[]): string {
  return codes.reduce(
    (acc, code) =>
      acc.replace(new RegExp(`(id="${code}"[^>]*fill=")[^"]*(")`), `$1${PRIMARY_500}$2`),
    svg,
  );
}

function StatTiles({ stats, className }: { stats: Stat[]; className: string }) {
  return (
    <div className={className}>
      {stats.map((stat, i) => (
        <div key={i} className="text-center">
          <p className="text-display font-semibold text-primary-700">{stat.value}</p>
          <p className="text-label text-neutral-600">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// UI-SPEC Block Library #8 (D-06) — static, non-interactive SVG world map.
// A11y (mandatory, T-02-14): the SVG is wrapped in role="img" + an
// aria-label summarizing the count; served-country NAMES are ALWAYS also
// rendered as a visible text chip list below the map in BOTH variants — the
// map illustrates, it never gatekeeps information a screen-reader user
// can't otherwise get. RTL Extensions: geographic maps do not mirror — no
// dir-based transform is ever applied to the SVG here.
export async function ExportMapBlock({ block, index }: { block: ExportMapData; index: number }) {
  const t = await getTranslations("blocks");
  const codes = (block.highlightedCountryCodes ?? []).filter((c): c is string => Boolean(c));
  const countryNames = codes
    .map((code) => COUNTRY_NAMES[code] ?? code)
    .sort((a, b) => a.localeCompare(b));
  const stats: Stat[] = block.stats ?? [];
  const isCompact = block.variant === "compact";
  const svgMarkup = highlightSvg(WORLD_MAP_SVG, codes);
  const ariaLabel = t("exportMapAriaLabel", { count: codes.length });

  const map = (
    <div
      role="img"
      aria-label={ariaLabel}
      // w-full + a fixed 2:1 aspect (matches the SVG's 1000x500 viewBox)
      // gives this div a definite, non-zero box in every parent layout
      // context (block, CSS grid item, flex item) — a bare inline <svg>
      // with no width/height otherwise resolves to a 0x0 box inside a
      // shrink-to-fit grid item.
      className={
        isCompact
          ? "mx-auto aspect-[2/1] w-full max-w-[480px]"
          : "mx-auto aspect-[2/1] w-full max-w-[900px]"
      }
    >
      <div aria-hidden="true" className="h-full w-full" dangerouslySetInnerHTML={{ __html: svgMarkup }} />
    </div>
  );

  const statsNode =
    stats.length > 0 ? (
      <StatTiles
        stats={stats}
        className={
          isCompact ? "grid grid-cols-2 gap-lg" : "mt-2xl grid grid-cols-2 gap-lg md:grid-cols-4"
        }
      />
    ) : null;

  const chips = (
    <div className="mt-lg flex flex-wrap justify-center gap-sm" data-testid="export-map-chips">
      {countryNames.length === 0 ? (
        // UI-SPEC Copywriting Contract — generic empty-state fallback.
        <p className="text-body text-neutral-600">{t("emptyState")}</p>
      ) : (
        countryNames.map((name) => (
          <span
            key={name}
            className="rounded-full bg-neutral-100 px-md py-xs text-label text-neutral-900"
          >
            {name}
          </span>
        ))
      )}
    </div>
  );

  return (
    <section className={`${sectionBg(index)} px-md py-2xl md:px-lg md:py-3xl xl:px-xl xl:py-4xl`}>
      <div className="mx-auto max-w-[1280px]">
        {block.sectionTitle ? (
          <h2 className="mb-lg text-center text-heading font-semibold">{block.sectionTitle}</h2>
        ) : null}
        {isCompact ? (
          <div className="grid grid-cols-1 items-center gap-xl lg:grid-cols-2">
            {map}
            {statsNode}
          </div>
        ) : (
          <>
            {map}
            {statsNode}
          </>
        )}
        {chips}
      </div>
    </section>
  );
}
