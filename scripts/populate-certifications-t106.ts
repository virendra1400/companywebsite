// One-off content population (not a schema migration) — T-106: creates the
// 7 real in-progress certifications named in PROJECT_MEMORY.md §3 (APEDA,
// FSSAI, IEC, GST, ISO 22000, HALAL, KOSHER — "all IN PROGRESS as of
// 2026-07", explicitly not a fabrication). Every entry: status
// "in-certification", no number/dates/logo — none are confirmed yet, and
// PROJECT_MEMORY explicitly forbids rendering a cert as "held" until the
// owner confirms a real number (D-01). issuingBody uses generic descriptors
// ("Accredited Certification Body" etc.) rather than naming a specific
// certifying company where PROJECT_MEMORY itself says the choice isn't
// confirmed (ISO/Halal/Kosher) — the government-authority ones (APEDA/
// FSSAI/IEC/GST) are unambiguous regardless of registration status, so
// those name the real authority.
// Idempotent by name — safe to re-run, skips any cert that already exists.
import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const { getPayload } = await import("payload");
const { default: config } = await import("../src/payload.config");

const payload = await getPayload({ config });

const CERTS = [
  {
    name: "Agricultural & Processed Food Products Export Development Authority (APEDA)",
    issuingBody: "Government of India",
    displayOrder: 1,
  },
  {
    name: "Food Safety and Standards Authority of India (FSSAI) License",
    issuingBody: "Food Safety and Standards Authority of India",
    displayOrder: 2,
  },
  {
    name: "Importer-Exporter Code (IEC)",
    issuingBody: "Directorate General of Foreign Trade (DGFT)",
    displayOrder: 3,
  },
  {
    name: "GST Registration",
    issuingBody: "Government of India",
    displayOrder: 4,
  },
  {
    name: "ISO 22000:2018 Food Safety Management System",
    issuingBody: "Accredited Certification Body",
    scope: "Frozen vegetables and fruit pulp processing",
    displayOrder: 5,
  },
  {
    name: "Halal Certification",
    issuingBody: "Halal Certification Body",
    scope: "Frozen vegetables and fruit pulp processing",
    halal: true,
    displayOrder: 6,
  },
  {
    name: "Kosher Certification",
    issuingBody: "Kosher Certification Agency",
    scope: "Frozen vegetables and fruit pulp processing",
    displayOrder: 7,
  },
];

for (const cert of CERTS) {
  const existing = await payload.find({
    collection: "certifications",
    where: { name: { equals: cert.name } },
    locale: "en",
    fallbackLocale: false,
    overrideAccess: true,
    limit: 1,
  });

  if (existing.docs[0]) {
    console.log(`Certification '${cert.name}' already exists — skipping.`);
    continue;
  }

  await payload.create({
    collection: "certifications",
    locale: "en",
    data: {
      name: cert.name,
      issuingBody: cert.issuingBody,
      scope: cert.scope,
      halal: cert.halal ?? false,
      status: "in-certification",
      displayOrder: cert.displayOrder,
    },
    overrideAccess: true,
    context: { disableRevalidate: true },
  });
  console.log(`Created certification '${cert.name}' (in-certification).`);
}

console.log("Done.");
await payload.destroy();
process.exit(0);
