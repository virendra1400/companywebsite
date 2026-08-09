// T-209/D-46: replaces the old hand-authored world-map-svg.ts rectangle
// placeholder with real country geometry. Runs server-side only (Node,
// inside the async ExportMapBlock Server Component) — d3-geo/topojson-client
// just compute plain SVG `d` path strings from world-atlas's TopoJSON, no
// map-rendering library ships to the client.
//
// T-206/D-63 — RESOLUTION IS PER-COUNTRY, NOT GLOBAL. The original "50m
// everywhere" choice (D-46: 110m omits Bahrain/Singapore/Maldives entirely)
// was right about the small states but wrong to apply 50m to all 241
// countries: it emitted 1,473KB of path data at 3-decimal precision, and
// because the App Router ships every page as BOTH SSR'd HTML and an RSC
// flight payload, that geometry was serialized twice — measured at 1.56MB of
// <svg> plus 1.62MB of self.__next_f.push() on a 3.2MB homepage, i.e. ~95% of
// the document was map coordinates. That is the actual cause of T-206's slow
// FCP/LCP; the "Payload CMS code in a client chunk" theory in D-58 was a false
// positive from grepping the generic string "payload", which React's own
// reconciler uses (update.payload / lazy._payload).
//
// Fix: 110m for the base map (visually identical at a 1000x500 viewBox) and
// 50m only for the countries actually highlighted, so the small Gulf/SEA
// states keep their real shapes and D-46's finding still holds. Combined with
// 1-decimal coordinates (0.1 viewBox units ≈ 0.09px at the 900px render
// width, i.e. sub-pixel), this measured 1,473KB -> 169KB, an 89% cut, with
// all 10 served countries present.
import { geoNaturalEarth1, geoPath, geoCentroid } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, Geometry, GeoJsonProperties } from "geojson";
import worldTopology50m from "../../node_modules/world-atlas/countries-50m.json";
import worldTopology110m from "../../node_modules/world-atlas/countries-110m.json";

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 500;

// Coordinates are consumed only as SVG `d` strings in a 1000x500 viewBox that
// renders at most ~900px wide, so anything past the first decimal is
// sub-pixel. d3-geo defaults to 3.
const COORD_DIGITS = 1;

export type CountryPath = { id: string; d: string; cx: number; cy: number; size: number };

type CountryFeature = Feature<Geometry, GeoJsonProperties>;

const cachedFeatures: Partial<Record<"50m" | "110m", CountryFeature[]>> = {};

// Parsing/converting the topology is the one genuinely non-trivial cost here
// (path generation itself is cheap, pure math) — memoize just that part so
// both the "full" world fit and any "compact" regional fit reuse it.
function getFeatures(resolution: "50m" | "110m"): CountryFeature[] {
  const hit = cachedFeatures[resolution];
  if (hit) return hit;
  const topology = (resolution === "50m" ? worldTopology50m : worldTopology110m) as unknown as Topology;
  const geometries = topology.objects.countries as GeometryCollection;
  const geo = feature(topology, geometries);
  const features = "features" in geo ? geo.features : [geo];
  cachedFeatures[resolution] = features;
  return features;
}

// 110m base + 50m for `detailIds`. A country present in both is taken from
// 50m; one that exists only at 50m (Bahrain, Singapore, Maldives) is added,
// which is exactly why D-46 rejected 110m outright.
function getMixedFeatures(detailIds?: string[]): CountryFeature[] {
  const detail = new Set(detailIds ?? []);
  if (detail.size === 0) return getFeatures("110m");
  const base = getFeatures("110m").filter((f) => !detail.has(String(f.id)));
  const detailed = getFeatures("50m").filter((f) => detail.has(String(f.id)));
  return [...base, ...detailed];
}

// T-209/D-46 follow-up: the "compact" ExportMap variant (Southeast Asia)
// was fitting the SAME whole-world projection as "full" and just shrinking
// the box — Singapore rendered as a barely-visible dot with no other
// highlighted country nearby large enough to anchor the eye. `focusIds`
// fits the projection to just the highlighted countries' own extent (then
// zooms out ~35% for neighboring-country context) instead of the whole
// world, so a regional map actually reads as a regional map.
// `detailIds` (T-206/D-63) are the countries to render at 50m; everything
// else comes from 110m. Callers should pass the highlighted set — those are
// the shapes a buyer actually looks at.
export function getWorldCountryPaths(focusIds?: string[], detailIds?: string[]): CountryPath[] {
  const features = getMixedFeatures(detailIds?.length ? detailIds : focusIds);
  const focusSet = focusIds?.length ? new Set(focusIds) : null;
  const fitTarget = focusSet
    ? { type: "FeatureCollection" as const, features: features.filter((f) => focusSet.has(String(f.id))) }
    : { type: "FeatureCollection" as const, features };

  let projection = geoNaturalEarth1().fitSize([VIEWBOX_WIDTH, VIEWBOX_HEIGHT], fitTarget);
  if (focusSet) {
    // fitSize's translate is only correct for the scale active when it was
    // called — scaling afterward without recomputing translate shifts the
    // effective center (confirmed as the cause of a real bug: Maldives was
    // rendering cropped off the edge of the Southeast Asia regional map).
    // Re-center properly instead: reuse the tight-fit scale, zoomed out for
    // neighboring-country context, but anchor via the focus set's actual
    // geographic centroid + an explicit translate to the viewBox center.
    const tightScale = projection.scale();
    const centroid = geoCentroid(fitTarget);
    projection = geoNaturalEarth1()
      .scale(tightScale * 0.65)
      .center(centroid)
      .translate([VIEWBOX_WIDTH / 2, VIEWBOX_HEIGHT / 2]);
  }
  const path = geoPath(projection).digits(COORD_DIGITS);

  return features
    .map((f) => {
      const d = path(f) ?? "";
      const [cx, cy] = path.centroid(f);
      const bounds = path.bounds(f);
      // min, not max: an elongated archipelago (e.g. the Maldives — a ~750km
      // north-south atoll chain) has a tall bounding box but is only ever a
      // near-zero-width sliver, so max(w,h) wrongly reads as "big enough to
      // see." min(w,h) catches "thin in some dimension" regardless of length.
      const size = Math.min(bounds[1][0] - bounds[0][0], bounds[1][1] - bounds[0][1]);
      return { id: String(f.id), d, cx, cy, size };
    })
    .filter((c) => c.d.length > 0);
}

export const WORLD_MAP_VIEWBOX = `0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`;
