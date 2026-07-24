// TEMPORARY — one-time prod content-migration route for Phase 7.
// Reseeds the 'home' Pages document with the new 11-block homepage narrative
// (TrustBar/ExportProcess/Testimonials + reused blocks) because the existing
// prod 'home' doc predates these blocks and scripts/seed-pages.ts skips any
// slug that already exists. Runs inside Vercel's own runtime so it uses the
// real DATABASE_URL/PAYLOAD_SECRET already injected there — no secret
// extraction needed. Delete this file (and the RESEED_TOKEN env var) after
// use; it is not part of the permanent app surface.
import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { PAGES_EN_SEED } from "@/lib/seed-content";

const FACILITY_PHOTOS: Record<string, string> = {
  "Processing Floor": "scripts/seed-assets/facility-processing-floor.svg",
  "Quality Control Lab": "scripts/seed-assets/facility-quality-lab.svg",
  "Cold Storage": "scripts/seed-assets/facility-cold-storage.svg",
  "Packing & Dispatch": "scripts/seed-assets/facility-packing-dispatch.svg",
};

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-reseed-token");
  if (!process.env.RESEED_TOKEN || token !== process.env.RESEED_TOKEN) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const payload = await getPayload({ config });

  async function upsertMediaByAlt(alt: string, filePath: string) {
    const existing = await payload.find({
      collection: "media",
      where: { alt: { equals: alt } },
      limit: 1,
      overrideAccess: true,
    });
    if (existing.docs[0]) return existing.docs[0];
    const fs = await import("fs");
    const path = await import("path");
    return payload.create({
      collection: "media",
      data: { alt },
      filePath: path.join(process.cwd(), filePath),
      overrideAccess: true,
    });
  }

  const homeEntry = PAGES_EN_SEED.find((p) => p.slug === "home");
  if (!homeEntry) {
    return NextResponse.json({ error: "no 'home' entry in PAGES_EN_SEED" }, { status: 500 });
  }

  // Inject facility photos into home's mediaGallery block(s) only.
  const galleryBlocks = homeEntry.layout.filter(
    (b): b is Extract<(typeof homeEntry.layout)[number], { blockType: "mediaGallery" }> =>
      b.blockType === "mediaGallery",
  );
  for (const galleryBlock of galleryBlocks) {
    for (const item of galleryBlock.items) {
      const assetPath = FACILITY_PHOTOS[item.caption];
      if (!assetPath) continue;
      const media = await upsertMediaByAlt(`${item.caption} placeholder photo`, assetPath);
      item.image = media.id;
    }
  }

  const existing = await payload.find({
    collection: "pages",
    where: { slug: { equals: "home" } },
    locale: "en",
    fallbackLocale: false,
    overrideAccess: true,
    limit: 1,
  });

  let deletedId: string | number | null = null;
  if (existing.docs[0]) {
    deletedId = existing.docs[0].id;
    await payload.delete({ collection: "pages", id: deletedId, overrideAccess: true });
  }

  const created = await payload.create({
    collection: "pages",
    locale: "en",
    data: { title: homeEntry.title, slug: homeEntry.slug, layout: homeEntry.layout },
    overrideAccess: true,
    context: { disableRevalidate: true },
  });

  return NextResponse.json({ deletedId, createdId: created.id, blockCount: homeEntry.layout.length });
}
