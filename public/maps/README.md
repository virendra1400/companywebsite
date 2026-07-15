# world.svg — license status

**Self-authored placeholder.** This file is a simplified/schematic set of
rectangular "country tile" shapes (not a traced or derived copy of any
existing atlas/topology dataset), drawn by hand for this project with
ISO alpha-2 `id` attributes on each shape. Geographic precision is
intentionally NOT attempted — the ExportMap block's visible country-name
chip list (`src/lib/country-names.ts`) carries the actual information; the
map is illustrative/structural trust evidence only (see
`02-RESEARCH.md` Open Question 1, `02-VALIDATION.md` Manual-Only item
"Export-map SVG license clearance").

**Before swapping in a more geographically precise third-party map SVG**
(e.g. any Natural Earth / world-atlas / CC BY-SA sourced file), get
written license clearance from the legal/business owner first. Many
freely-available world map SVGs (including common CC BY-SA sources) carry
share-alike or attribution terms that need review before use on a
commercial site — do not replace this file with an uncleared third-party
asset.

`src/components/blocks/ExportMapBlock.tsx` fills each tile by `id` (ISO
alpha-2 code): `primary-500` for served/highlighted countries, default
`neutral-300` otherwise. Swapping the SVG later only requires keeping the
same `id="<ISO_CODE>"` convention on each shape.
