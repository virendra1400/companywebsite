#!/usr/bin/env node
// RTL guard (UI-SPEC / FOUND-03): fail the build if any physical-direction
// Tailwind utility appears under src/. Use logical properties only
// (ms-/me-/ps-/pe-/start-/end-/text-start/text-end/border-s/border-e).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, sep } from "node:path";

const ROOT = "src";
// Word-boundary patterns for banned physical-direction utilities, incl.
// responsive/variant prefixes (e.g. sm:ml-2, hover:text-left) via [\w:]* .
const BANNED = [
  /\b[\w:]*-?ml-/, /\b[\w:]*-?mr-/,
  /\b[\w:]*-?pl-/, /\b[\w:]*-?pr-/,
  /\b[\w:]*-?left-/, /\b[\w:]*-?right-/,
  /\btext-left\b/, /\btext-right\b/,
  /\bbg-gradient-to-r\b/, /\bbg-gradient-to-l\b/,
  /\brounded-l\b/, /\brounded-r\b/,
  /\bborder-l\b/, /\bborder-r\b/,
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (/\.(tsx?|css|jsx?|mjs)$/.test(name)) yield p;
  }
}

// src/components/ui/** is shadcn's own officially-sanctioned registry output
// (Button/DropdownMenu/Sheet, added via `npx shadcn add`, never hand-edited —
// see UI-SPEC Registry Safety). Radix's Sheet/DropdownMenu primitives use
// left-0/right-0/border-l/border-r internally for viewport-relative overlay
// positioning (which physical screen edge a floating panel is anchored to),
// not reading-direction text layout — our own wrapper components choose
// which literal side to pass in based on computed `dir` (see
// MobileNavPanel.tsx), which is the actual RTL-correctness requirement.
const VENDOR_PREFIX = join(ROOT, "components", "ui") + sep;

const hits = [];
for (const file of walk(ROOT)) {
  if (file.endsWith("check-physical-direction.mjs")) continue;
  if (file.startsWith(VENDOR_PREFIX)) continue;
  // Strip block comments (whole file) then line comments per line, so
  // documentation mentioning banned class names does not false-positive.
  const src = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  src.split("\n").forEach((raw, i) => {
    const line = raw.replace(/\/\/.*$/, "");
    if (!line.trim()) return;
    for (const re of BANNED) {
      if (re.test(line)) { hits.push(`${file}:${i + 1}  ${raw.trim()}`); break; }
    }
  });
}

if (hits.length) {
  console.error("Physical-direction Tailwind classes found (use logical properties):");
  for (const h of hits) console.error("  " + h);
  process.exit(1);
}
console.log("RTL guard: no physical-direction classes under src/.");
