// TEMPORARY — one-time prod asset-fix route. The uploaded "VNP Logo" Media
// doc's SVG has viewBox="0 0 841.8898 595.2756" (a full A4 export canvas) but
// the actual logo mark only occupies a small region within it, so any CSS
// height renders mostly transparent padding. This replaces the SAME Media
// doc's underlying file with a tightly-cropped version (viewBox recomputed
// from the SVG's own path/text coordinates, zero visual content changed) so
// every existing reference (SiteSettings.logo relationship) picks it up
// automatically. Runs inside Vercel's own runtime so it uses the real
// DATABASE_URL/PAYLOAD_SECRET/BLOB_READ_WRITE_TOKEN already injected there.
// Delete this file (and the FIXLOGO_TOKEN env var) after use.
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import path from "path";

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-fixlogo-token");
  if (!process.env.FIXLOGO_TOKEN || token !== process.env.FIXLOGO_TOKEN) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const payload = await getPayload({ config });

  const existing = await payload.find({
    collection: "media",
    where: { filename: { contains: "VNP Logo" } },
    limit: 1,
    overrideAccess: true,
  });

  if (!existing.docs[0]) {
    return NextResponse.json({ error: "no 'VNP Logo' media doc found" }, { status: 404 });
  }

  const doc = existing.docs[0];
  const filePath = path.join(process.cwd(), "scripts/seed-assets/vnp-logo-cropped.svg");

  const updated = await payload.update({
    collection: "media",
    id: doc.id,
    data: {},
    filePath,
    overrideAccess: true,
  });

  return NextResponse.json({ id: updated.id, filename: updated.filename, url: updated.url });
}
