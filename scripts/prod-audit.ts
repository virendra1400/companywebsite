// READ-ONLY audit of the real production DB.
import "./prod-env";

const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");
const payload = await getPayload({ config });

const emdash = (s: string) => (s.match(/—/g) ?? []).length;

console.log("\n=== PAGES ===");
const pages = await payload.find({
  collection: "pages",
  locale: "en",
  fallbackLocale: false,
  overrideAccess: true,
  limit: 100,
  sort: "id",
});
let totalDashes = 0;
for (const doc of pages.docs) {
  const layout = doc.layout ?? [];
  const n = emdash(JSON.stringify(layout));
  totalDashes += n;
  console.log(
    `${String(doc.slug).padEnd(16)} blocks=${String(layout.length).padEnd(3)} emDashes=${n}`,
  );
}
console.log(`TOTAL em dashes across pages: ${totalDashes}`);

console.log("\n=== INSIGHTS ===");
const insights = await payload.find({
  collection: "insights",
  locale: "en",
  fallbackLocale: false,
  overrideAccess: true,
  limit: 100,
  sort: "id",
});
let insDashes = 0;
for (const doc of insights.docs) {
  const n = emdash(JSON.stringify(doc.body));
  insDashes += n;
  console.log(`${String(doc.slug).slice(0, 45).padEnd(47)} emDashes=${n}`);
}
console.log(`TOTAL em dashes across insights: ${insDashes}`);

console.log("\n=== CERTIFICATIONS ===");
const certs = await payload.find({
  collection: "certifications",
  locale: "en",
  fallbackLocale: false,
  overrideAccess: true,
  limit: 100,
  sort: "id",
});
for (const c of certs.docs) {
  console.log(`${String(c.name).slice(0, 60).padEnd(62)} ${c.status ?? "(unset)"}`);
}

console.log("\n=== SITE SETTINGS ===");
const s = await payload.findGlobal({ slug: "site-settings", locale: "en", overrideAccess: true });
console.log("contact:      ", JSON.stringify(s.contact));
console.log("address:      ", JSON.stringify(s.address));
console.log("factoryAddress:", JSON.stringify(s.factoryAddress));
console.log("legalIdentity:", JSON.stringify(s.legalIdentity));

console.log("\n=== COMPANY REGISTRATION COPY ===");
const company = pages.docs.find((d: any) => d.slug === "company");
for (const b of (company as any).layout) {
  if (b.blockType === "richText") {
    const txt = b.content.root.children[0].children.map((c: any) => c.text).join("");
    if (/IEC|APEDA/.test(txt)) console.log(txt);
  }
  if (b.blockType === "hero") console.log("hero subhead:", b.subhead);
}

console.log("\n=== CONTACT ADDRESS ===");
const contact = pages.docs.find((d: any) => d.slug === "contact");
for (const b of (contact as any).layout) {
  if (b.blockType === "contactBlock") console.log(b.address);
}

await payload.destroy();
process.exit(0);
