// Same self-authored/license-safe schematic shapes as public/maps/world.svg
// (see that file's README for the license note) — duplicated here as a
// plain string constant rather than read via fs at request time, since
// public/ assets aren't guaranteed to be on the server filesystem in a
// serverless deploy (Vercel). Each `<rect id="ISO_CODE" ... fill="...">` is
// swapped to primary-500 by ExportMapBlock.tsx for served countries; the
// default fill below is neutral-300 (see src/app/globals.css).
//
// T-209/D-46: user-reported "incomplete map" — floating gray blocks with no
// canvas and no labels read as an unfinished loading skeleton, not a map.
// Added a neutral-100 canvas rect (gives the blocks a "surface" to sit on),
// a white stroke per block (definition against the canvas), and centered
// ISO-code labels on every block wide/tall enough to hold 2-letter text
// (the four smallest Gulf micro-states — KW/BH/QA/SG — stay label-less; their
// full names are already always rendered in the text-chip list below the map,
// per this block's own a11y contract that the map never gatekeeps info).
// Each label carries id="XX-label" so ExportMapBlock.tsx's highlightSvg() can
// flip it to white when its country is highlighted — the default dark-on-gray
// text drops to ~3.2:1 contrast on the highlighted primary-500 fill (fails
// WCAG AA 4.5:1), which T-205 locked in as a zero-violations regression gate.
export const WORLD_MAP_SVG = `<svg viewBox="0 0 1000 500" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="1000" height="500" fill="#EFF1EE"/>
<rect id="US" x="90" y="110" width="110" height="70" rx="6" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<text id="US-label" x="145" y="145" text-anchor="middle" dominant-baseline="central" font-size="14" font-family="sans-serif" fill="#1A1D1A">US</text>
<rect id="BR" x="190" y="280" width="70" height="90" rx="6" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<text id="BR-label" x="225" y="325" text-anchor="middle" dominant-baseline="central" font-size="14" font-family="sans-serif" fill="#1A1D1A">BR</text>
<rect id="GB" x="430" y="75" width="30" height="22" rx="4" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<text id="GB-label" x="445" y="86" text-anchor="middle" dominant-baseline="central" font-size="9" font-family="sans-serif" fill="#1A1D1A">GB</text>
<rect id="FR" x="440" y="105" width="35" height="30" rx="4" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<text id="FR-label" x="457" y="120" text-anchor="middle" dominant-baseline="central" font-size="10" font-family="sans-serif" fill="#1A1D1A">FR</text>
<rect id="DE" x="478" y="85" width="32" height="25" rx="4" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<text id="DE-label" x="494" y="97" text-anchor="middle" dominant-baseline="central" font-size="10" font-family="sans-serif" fill="#1A1D1A">DE</text>
<rect id="NL" x="460" y="72" width="22" height="16" rx="4" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<rect id="IT" x="478" y="118" width="24" height="35" rx="4" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<text id="IT-label" x="490" y="135" text-anchor="middle" dominant-baseline="central" font-size="9" font-family="sans-serif" fill="#1A1D1A">IT</text>
<rect id="ES" x="405" y="128" width="40" height="28" rx="4" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<text id="ES-label" x="425" y="142" text-anchor="middle" dominant-baseline="central" font-size="10" font-family="sans-serif" fill="#1A1D1A">ES</text>
<rect id="SA" x="555" y="165" width="65" height="45" rx="6" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<text id="SA-label" x="587" y="187" text-anchor="middle" dominant-baseline="central" font-size="13" font-family="sans-serif" fill="#1A1D1A">SA</text>
<rect id="KW" x="570" y="148" width="16" height="12" rx="3" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<rect id="BH" x="590" y="168" width="10" height="9" rx="2" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<rect id="QA" x="600" y="160" width="14" height="16" rx="3" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<rect id="AE" x="612" y="175" width="28" height="20" rx="4" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<text id="AE-label" x="626" y="185" text-anchor="middle" dominant-baseline="central" font-size="9" font-family="sans-serif" fill="#1A1D1A">AE</text>
<rect id="OM" x="628" y="190" width="32" height="24" rx="4" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<text id="OM-label" x="644" y="202" text-anchor="middle" dominant-baseline="central" font-size="10" font-family="sans-serif" fill="#1A1D1A">OM</text>
<rect id="EG" x="505" y="165" width="42" height="32" rx="4" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<text id="EG-label" x="526" y="181" text-anchor="middle" dominant-baseline="central" font-size="10" font-family="sans-serif" fill="#1A1D1A">EG</text>
<rect id="ZA" x="515" y="335" width="55" height="45" rx="4" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<text id="ZA-label" x="542" y="357" text-anchor="middle" dominant-baseline="central" font-size="12" font-family="sans-serif" fill="#1A1D1A">ZA</text>
<rect id="RU" x="555" y="35" width="260" height="45" rx="6" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<text id="RU-label" x="685" y="57" text-anchor="middle" dominant-baseline="central" font-size="15" font-family="sans-serif" fill="#1A1D1A">RU</text>
<rect id="CN" x="700" y="125" width="90" height="58" rx="6" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<text id="CN-label" x="745" y="154" text-anchor="middle" dominant-baseline="central" font-size="14" font-family="sans-serif" fill="#1A1D1A">CN</text>
<rect id="JP" x="830" y="135" width="24" height="34" rx="4" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<text id="JP-label" x="842" y="152" text-anchor="middle" dominant-baseline="central" font-size="9" font-family="sans-serif" fill="#1A1D1A">JP</text>
<rect id="SG" x="728" y="245" width="14" height="11" rx="2" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<rect id="AU" x="800" y="315" width="90" height="70" rx="6" fill="#D5D9D4" stroke="#FFFFFF" stroke-width="1.5"/>
<text id="AU-label" x="845" y="350" text-anchor="middle" dominant-baseline="central" font-size="14" font-family="sans-serif" fill="#1A1D1A">AU</text>
</svg>`;
