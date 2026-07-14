#!/usr/bin/env node
// RTL guard (UI-SPEC / FOUND-03): fail the build if any physical-direction
// Tailwind utility appears under src/. Use logical properties only
// (ms-/me-/ps-/pe-/start-/end-/text-start/text-end/border-s/border-e).
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

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

const hits = [];
for (const file of walk(ROOT)) {
  if (file.endsWith("check-physical-direction.mjs")) continue;
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) return;
    for (const re of BANNED) {
      if (re.test(line)) { hits.push(`${file}:${i + 1}  ${line.trim()}`); break; }
    }
  });
}

if (hits.length) {
  console.error("Physical-direction Tailwind classes found (use logical properties):");
  for (const h of hits) console.error("  " + h);
  process.exit(1);
}
console.log("RTL guard: no physical-direction classes under src/.");
