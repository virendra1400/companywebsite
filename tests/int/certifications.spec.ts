import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Payload } from "payload";
import { getTestPayload } from "./config";
import { getCertifications } from "@/lib/payload-fetch";

// Smallest possible valid 1x1 transparent PNG (mirrors payload-media-upload.spec.ts).
const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

// TRUST-01/02: getCertifications is CertStripBlock's data source — must
// order halal certs first regardless of displayOrder, must return a
// nullish certificatePdf for the PDF-absent state, and must fall back to
// English for an untranslated locale (mirrors pages-fallback.spec.ts).
describe("getCertifications data-fetch helper", () => {
  let payload: Payload;
  let logoId: number;
  let halalCertId: number;
  let standardWithPdfId: number;
  let standardNoPdfId: number;

  beforeAll(async () => {
    payload = await getTestPayload();

    const logo = await payload.create({
      collection: "media",
      data: { alt: "Test cert logo" },
      file: {
        data: Buffer.from(PNG_BASE64, "base64"),
        mimetype: "image/png",
        name: "test-cert-logo.png",
        size: Buffer.from(PNG_BASE64, "base64").length,
      },
      overrideAccess: true,
    });
    logoId = logo.id;

    // displayOrder deliberately puts the halal cert LAST, to prove
    // getCertifications' halal-first re-sort overrides displayOrder alone.
    const standardNoPdf = await payload.create({
      collection: "certifications",
      locale: "en",
      data: {
        name: "Standard Cert Without PDF",
        issuingBody: "Test Issuing Body",
        logo: logoId,
        halal: false,
        displayOrder: 1,
      },
      overrideAccess: true,
    });
    standardNoPdfId = standardNoPdf.id;

    const standardWithPdf = await payload.create({
      collection: "certifications",
      locale: "en",
      data: {
        name: "Standard Cert With PDF",
        issuingBody: "Test Issuing Body",
        logo: logoId,
        certificatePdf: logoId,
        halal: false,
        displayOrder: 2,
      },
      overrideAccess: true,
    });
    standardWithPdfId = standardWithPdf.id;

    const halalCert = await payload.create({
      collection: "certifications",
      locale: "en",
      data: {
        name: "Halal Cert",
        issuingBody: "Test Issuing Body",
        logo: logoId,
        halal: true,
        displayOrder: 3,
      },
      overrideAccess: true,
    });
    halalCertId = halalCert.id;
  });

  afterAll(async () => {
    await payload.delete({ collection: "certifications", id: standardNoPdfId, overrideAccess: true });
    await payload.delete({ collection: "certifications", id: standardWithPdfId, overrideAccess: true });
    await payload.delete({ collection: "certifications", id: halalCertId, overrideAccess: true });
    await payload.delete({ collection: "media", id: logoId, overrideAccess: true });
    await payload.destroy();
  });

  it("orders the halal cert first regardless of displayOrder", async () => {
    const certs = await getCertifications("en");
    const ids = certs.map((c) => c.id);
    expect(ids.indexOf(halalCertId)).toBeLessThan(ids.indexOf(standardNoPdfId));
    expect(ids.indexOf(halalCertId)).toBeLessThan(ids.indexOf(standardWithPdfId));
  });

  it("the halal cert has halal === true", async () => {
    const certs = await getCertifications("en");
    const halal = certs.find((c) => c.id === halalCertId);
    expect(halal?.halal).toBe(true);
  });

  it("a cert with no certificatePdf yields a nullish pdf relation (drives the PDF-absent state)", async () => {
    const certs = await getCertifications("en");
    const noPdf = certs.find((c) => c.id === standardNoPdfId);
    expect(noPdf?.certificatePdf).toBeFalsy();
    const withPdf = certs.find((c) => c.id === standardWithPdfId);
    expect(withPdf?.certificatePdf).toBeTruthy();
  });

  it("untranslated locale falls back to the English name", async () => {
    const certs = await getCertifications("fr");
    const halal = certs.find((c) => c.id === halalCertId);
    expect(halal?.name).toBe("Halal Cert");
  });
});
