// READ-ONLY: walk EVERY field of EVERY collection + global looking for em
// dashes. Written after a targeted fix patched insights.body but missed
// insights.excerpt, which then rendered on /insights.
import "./prod-env";

const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");
const payload = await getPayload({ config });

const COLLECTIONS = [
  "pages",
  "insights",
  "products",
  "categories",
  "certifications",
  "resources",
  "facility-facts",
  "media",
] as const;

function walk(node: unknown, path: string, hit: (p: string, s: string) => void) {
  if (typeof node === "string") {
    if (node.includes("—")) hit(path, node);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((n, i) => walk(n, `${path}[${i}]`, hit));
    return;
  }
  if (node && typeof node === "object") {
    for (const [k, v] of Object.entries(node)) walk(v, path ? `${path}.${k}` : k, hit);
  }
}

let total = 0;
for (const collection of COLLECTIONS) {
  let res;
  try {
    res = await payload.find({
      collection: collection as any,
      locale: "en",
      fallbackLocale: false,
      overrideAccess: true,
      limit: 200,
    });
  } catch {
    console.log(`(skipped ${collection})`);
    continue;
  }
  for (const doc of res.docs) {
    walk(doc, "", (p, s) => {
      // Skip timestamps/ids and anything that isn't editorial copy.
      if (/^(id|updatedAt|createdAt|_)/.test(p)) return;
      total++;
      console.log(`\n${collection}/${(doc as any).slug ?? (doc as any).id}  →  ${p}`);
      console.log(`   ${s.slice(0, 150)}`);
    });
  }
}

const settings = await payload.findGlobal({
  slug: "site-settings",
  locale: "en",
  overrideAccess: true,
});
walk(settings, "", (p, s) => {
  total++;
  console.log(`\nsite-settings  →  ${p}\n   ${s.slice(0, 150)}`);
});

console.log(`\n=== TOTAL em dashes in production data: ${total} ===`);
await payload.destroy();
process.exit(0);
