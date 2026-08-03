"use client";

import { useInView } from "@/components/motion/useInView";
import type { CountryPath } from "@/lib/world-map-geo";

// T-209/D-46: real country geometry (see world-map-geo.ts) rendered here as
// plain SVG paths — this component owns only the two interactive touches:
// a once-per-view staggered "light up" of the served countries (same
// fade+scale motion family as Reveal/RevealItem, 300ms ceiling, capped
// stagger so a larger served set never marches slowly) and a 150ms
// brightness bump + native <title> tooltip on hover/focus for any country.
// UI-SPEC "geographic maps do not mirror" — no dir-based transform, ever.
const STAGGER_MS = 60;
const STAGGER_CAP = 8;
// A real but tiny country (Bahrain, Maldives, Singapore...) can project to
// under a pixel at a regional map's scale — genuinely invisible even though
// it's correctly highlighted. Below this size (in the 1000x500 viewBox's own
// units), draw a small fixed-radius marker dot at its centroid on top of the
// true (if imperceptible) shape, so "served" never means "invisible."
const MIN_VISIBLE_SIZE = 8;
const MARKER_RADIUS = 5;

export function WorldMapInteractive({
  paths,
  highlightedIds,
  namesById,
  viewBox,
  ariaLabel,
}: {
  paths: CountryPath[];
  highlightedIds: Set<string>;
  namesById: Record<string, string>;
  viewBox: string;
  ariaLabel: string;
}) {
  const { ref, inView } = useInView();
  const base = paths.filter((p) => !highlightedIds.has(p.id));
  const highlighted = paths.filter((p) => highlightedIds.has(p.id));

  return (
    <div ref={ref} role="img" aria-label={ariaLabel} className="mx-auto h-full w-full">
      <svg viewBox={viewBox} aria-hidden="true" className="h-full w-full">
        {base.map((c, i) => (
          <path
            // world-atlas's topology has a handful of duplicate/undefined
            // ids (disputed-territory geometries with no ISO code, and one
            // country split across two separate polygon entries) — index
            // keeps keys unique since these paths are static, no per-item
            // state to preserve identity for.
            key={`${c.id}-${i}`}
            d={c.d}
            fill="#D5D9D4"
            stroke="#EFF1EE"
            strokeWidth={0.75}
            className="transition-[filter] duration-150 hover:brightness-90 focus-visible:brightness-90"
          >
            {namesById[c.id] ? <title>{namesById[c.id]}</title> : null}
          </path>
        ))}
        {highlighted.map((c, i) => {
          const delay = Math.min(i, STAGGER_CAP) * STAGGER_MS;
          const name = namesById[c.id];
          return (
            <g key={c.id}>
              <path
                d={c.d}
                fill="#1E7A38"
                stroke="#EFF1EE"
                strokeWidth={0.75}
                data-revealed={inView || undefined}
                style={{
                  transitionDelay: `${delay}ms`,
                  transformBox: "fill-box",
                  transformOrigin: "center",
                }}
                className="scale-90 opacity-0 transition-[opacity,scale,filter] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:brightness-110 focus-visible:brightness-110 data-[revealed]:scale-100 data-[revealed]:opacity-100 motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:transition-[filter]"
              >
                {name ? <title>{name}</title> : null}
              </path>
              {c.size < MIN_VISIBLE_SIZE ? (
                <circle
                  cx={c.cx}
                  cy={c.cy}
                  r={MARKER_RADIUS}
                  fill="#1E7A38"
                  stroke="#EFF1EE"
                  strokeWidth={1}
                  data-revealed={inView || undefined}
                  style={{ transitionDelay: `${delay}ms`, transformBox: "fill-box", transformOrigin: "center" }}
                  className="scale-50 opacity-0 transition-[opacity,scale,filter] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:brightness-110 focus-visible:brightness-110 data-[revealed]:scale-100 data-[revealed]:opacity-100 motion-reduce:scale-100 motion-reduce:opacity-100 motion-reduce:transition-[filter]"
                >
                  {name ? <title>{name}</title> : null}
                </circle>
              ) : null}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
