import { afterAll, describe, expect, it } from "vitest";
import type { Payload } from "payload";
import { existsSync } from "fs";
import path from "path";
import { getTestPayload } from "./config";

// CMS-04: Media accepts image/* and application/pdf, stores bytes on local
// disk in dev (staticDir "media"; swaps to the EU S3 bucket at deploy —
// see payload.config.ts). Other mime types must be rejected (T-01-06).

// Smallest possible valid 1x1 transparent PNG.
const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

// Minimal well-formed single-page PDF (valid magic bytes, xref + trailer +
// %%EOF, per Payload's validatePDF byte-signature check).
const MINIMAL_PDF = Buffer.from(
  [
    "%PDF-1.1",
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 3 3] >>\nendobj",
    "xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n ",
    "trailer\n<< /Size 4 /Root 1 0 R >>",
    "startxref\n180\n%%EOF",
  ].join("\n"),
  "utf-8",
);

describe("Media upload collection", () => {
  let payload: Payload;

  afterAll(async () => {
    await payload.destroy();
  });

  it("accepts an image upload and stores it on local disk", async () => {
    payload = await getTestPayload();
    const doc = await payload.create({
      collection: "media",
      data: { alt: "Test image" },
      file: {
        data: Buffer.from(PNG_BASE64, "base64"),
        mimetype: "image/png",
        name: "test.png",
        size: Buffer.from(PNG_BASE64, "base64").length,
      },
      overrideAccess: true,
    });

    expect(doc.mimeType).toBe("image/png");
    expect(doc.filename).toBeTruthy();
    const onDisk = path.resolve(process.cwd(), "media", doc.filename!);
    expect(existsSync(onDisk)).toBe(true);
  });

  it("accepts a PDF upload and stores it on local disk", async () => {
    const doc = await payload.create({
      collection: "media",
      data: { alt: "Test certificate" },
      file: {
        data: MINIMAL_PDF,
        mimetype: "application/pdf",
        name: "test.pdf",
        size: MINIMAL_PDF.length,
      },
      overrideAccess: true,
    });

    expect(doc.mimeType).toBe("application/pdf");
    const onDisk = path.resolve(process.cwd(), "media", doc.filename!);
    expect(existsSync(onDisk)).toBe(true);
  });

  it("rejects a disallowed mime type", async () => {
    await expect(
      payload.create({
        collection: "media",
        data: { alt: "Not allowed" },
        file: {
          data: Buffer.from("hello world", "utf-8"),
          mimetype: "text/plain",
          name: "test.txt",
          size: 11,
        },
        overrideAccess: true,
      }),
    ).rejects.toThrow();
  });
});
