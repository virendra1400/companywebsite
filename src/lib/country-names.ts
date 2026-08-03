// ISO alpha-2 -> English display name, covering the ExportMap's currently
// seeded served set plus a reasonable buffer for likely future highlights.
// Not all 249 ISO codes (YAGNI) — only the world-map-geo.ts served/drawn set,
// plus a small buffer of common non-drawn codes an editor might add later
// (falls back to the raw code if genuinely missing, see ExportMapBlock.tsx).
// Kept in lockstep with country-iso-numeric.ts — same key set.
export const COUNTRY_NAMES: Record<string, string> = {
  // Served set (seeded)
  AE: "United Arab Emirates",
  SA: "Saudi Arabia",
  QA: "Qatar",
  KW: "Kuwait",
  BH: "Bahrain",
  OM: "Oman",
  DE: "Germany",
  FR: "France",
  GB: "United Kingdom",
  NL: "Netherlands",
  IT: "Italy",
  ES: "Spain",
  US: "United States",
  EG: "Egypt",
  ZA: "South Africa",
  SG: "Singapore",
  VN: "Vietnam",
  ID: "Indonesia",
  MV: "Maldives",
  // Drawn on the map but not (yet) highlighted in the current seed
  BR: "Brazil",
  RU: "Russia",
  CN: "China",
  JP: "Japan",
  AU: "Australia",
  MY: "Malaysia",
  // Buffer — not drawn on the current map, available for future highlights
  CA: "Canada",
  MX: "Mexico",
  TR: "Turkey",
  PK: "Pakistan",
  BD: "Bangladesh",
  NG: "Nigeria",
  KE: "Kenya",
  KR: "South Korea",
  TH: "Thailand",
};
