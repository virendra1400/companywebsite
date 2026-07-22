import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { Payload } from "payload";

// Mirrors products-revalidate-hook.spec.ts: mock next/cache before any module
// in the import chain (config -> payload.config -> collections/Insights ->
// hooks/revalidateInsights) pulls it in, so the hook calls our spy instead of
// the real Next.js cache API (which throws outside a request/render context).
const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath }));

const { getTestPayload } = await import("./config");

// Minimal Lexical editor-state JSON (root > paragraph > text) — same shape as
// src/lib/seed-content.ts's richText() helper, inlined here since Insights.body
// stores the root object directly (not wrapped in a richText block).
function lexicalRoot(text: string) {
  return {
    root: {
      type: "root",
      format: "" as const,
      indent: 0,
      version: 1,
      direction: "ltr" as const,
      children: [
        {
          type: "paragraph",
          format: "" as const,
          indent: 0,
          version: 1,
          direction: "ltr" as const,
          textFormat: 0,
          children: [
            { type: "text", detail: 0, format: 0, mode: "normal", style: "", text, version: 1 },
          ],
        },
      ],
    },
  };
}

describe("revalidateInsight afterChange hook", () => {
  let payload: Payload;
  let mediaId: number;
  let insightId: number;

  beforeAll(async () => {
    payload = await getTestPayload();

    const media = await payload.create({
      collection: "media",
      data: { alt: "Basmati rice sample" },
      filePath: "scripts/seed-assets/product-basmati-rice.svg",
      overrideAccess: true,
    });
    mediaId = media.id;

    const insight = await payload.create({
      collection: "insights",
      data: {
        title: "Revalidate Test Insight",
        slug: "revalidate-test-insight",
        excerpt: "Revalidate hook fixture.",
        coverImage: mediaId,
        body: lexicalRoot("Revalidate hook fixture body."),
      },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    insightId = insight.id;
  });

  afterAll(async () => {
    await payload.delete({ collection: "insights", id: insightId, overrideAccess: true });
    await payload.delete({ collection: "media", id: mediaId, overrideAccess: true });
    await payload.destroy();
  });

  it("revalidates the 4 index paths AND the 4 detail paths", async () => {
    revalidatePath.mockClear();

    await payload.update({
      collection: "insights",
      id: insightId,
      data: { title: "Revalidate Test Insight Updated" },
      overrideAccess: true,
    });

    expect(revalidatePath).toHaveBeenCalledWith("/insights");
    expect(revalidatePath).toHaveBeenCalledWith("/ar/insights");
    expect(revalidatePath).toHaveBeenCalledWith("/fr/insights");
    expect(revalidatePath).toHaveBeenCalledWith("/ru/insights");
    expect(revalidatePath).toHaveBeenCalledWith("/insights/revalidate-test-insight");
    expect(revalidatePath).toHaveBeenCalledWith("/ar/insights/revalidate-test-insight");
    expect(revalidatePath).toHaveBeenCalledWith("/fr/insights/revalidate-test-insight");
    expect(revalidatePath).toHaveBeenCalledWith("/ru/insights/revalidate-test-insight");
    expect(revalidatePath).toHaveBeenCalledTimes(8);
  });

  it("skips revalidation entirely when context.disableRevalidate is set", async () => {
    revalidatePath.mockClear();

    await payload.update({
      collection: "insights",
      id: insightId,
      data: { title: "Revalidate Test Insight No Revalidate" },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });

    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
