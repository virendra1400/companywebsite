// T-209/D-46: replaces the old hand-authored world-map-svg.ts rectangle
// placeholder with real country geometry. Runs server-side only (Node,
// inside the async ExportMapBlock Server Component) — d3-geo/topojson-client
// just compute plain SVG `d` path strings from world-atlas's TopoJSON, no
// map-rendering library ships to the client. Natural Earth 50m resolution
// (not 110m): confirmed the small Gulf states (Bahrain, Qatar) are only
// present at 50m, and 50m's ~740KB parses server-side in single-digit ms —
// irrelevant to client bundle size either way.
import { geoNaturalEarth1, geoPath, geoCentroid } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, Geometry, GeoJsonProperties } from "geojson";
import worldTopology from "../../node_modules/world-atlas/countries-50m.json";

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 500;

export type CountryPath = { id: string; d: string; cx: number; cy: number; size: number };

type CountryFeature = Feature<Geometry, GeoJsonProperties>;

let cachedFeatures: CountryFeature[] | null = null;

// Parsing/converting the topology is the one genuinely non-trivial cost here
// (path generation itself is cheap, pure math) — memoize just that part so
// both the "full" world fit and any "compact" regional fit reuse it.
function getFeatures(): CountryFeature[] {
  if (cachedFeatures) return cachedFeatures;
  const topology = worldTopology as unknown as Topology;
  const geometries = topology.objects.countries as GeometryCollection;
  const geo = feature(topology, geometries);
  cachedFeatures = "features" in geo ? geo.features : [geo];
  return cachedFeatures;
}

// T-209/D-46 follow-up: the "compact" ExportMap variant (Southeast Asia)
// was fitting the SAME whole-world projection as "full" and just shrinking
// the box — Singapore rendered as a barely-visible dot with no other
// highlighted country nearby large enough to anchor the eye. `focusIds`
// fits the projection to just the highlighted countries' own extent (then
// zooms out ~35% for neighboring-country context) instead of the whole
// world, so a regional map actually reads as a regional map.
export function getWorldCountryPaths(focusIds?: string[]): CountryPath[] {
  const features = getFeatures();
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
  const path = geoPath(projection);

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
