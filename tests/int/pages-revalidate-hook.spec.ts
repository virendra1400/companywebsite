import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { Payload } from "payload";

// Replaces payload-revalidate-hook.spec.ts (tested the retired Home global's
// revalidateHome hook). Mock next/cache before any module in the import chain
// (config -> payload.config -> collections/Pages -> hooks/revalidatePage)
// pulls it in, so the hook calls our spy instead of the real Next.js cache API
// (which throws outside a request/render context).
const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath }));

const { getTestPayload } = await import("./config");

describe("revalidatePage afterChange hook", () => {
  let payload: Payload;
  let homeId: number;

  beforeAll(async () => {
    payload = await getTestPayload();
    const doc = await payload.create({
      collection: "pages",
      data: {
        title: "Home",
        slug: "home",
        layout: [{ blockType: "hero", variant: "full", headline: "Revalidate me" }],
      },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });
    homeId = doc.id;
  });

  afterAll(async () => {
    await payload.delete({ collection: "pages", id: homeId, overrideAccess: true });
    await payload.destroy();
  });

  it("slug 'home' revalidates the root path for all four locales", async () => {
    revalidatePath.mockClear();

    await payload.update({
      collection: "pages",
      id: homeId,
      data: { title: "Home Updated" },
      overrideAccess: true,
    });

    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/ar");
    expect(revalidatePath).toHaveBeenCalledWith("/fr");
    expect(revalidatePath).toHaveBeenCalledWith("/ru");
    expect(revalidatePath).toHaveBeenCalledTimes(4);
  });

  it("skips revalidation when context.disableRevalidate is set", async () => {
    revalidatePath.mockClear();

    await payload.update({
      collection: "pages",
      id: homeId,
      data: { title: "No revalidate" },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });

    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("a non-home slug revalidates /<slug> for all four locales", async () => {
    const aboutDoc = await payload.create({
      collection: "pages",
      data: {
        title: "About",
        slug: "about",
        layout: [{ blockType: "hero", variant: "compact", headline: "About us" }],
      },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });

    revalidatePath.mockClear();
    await payload.update({
      collection: "pages",
      id: aboutDoc.id,
      data: { title: "About Updated" },
      overrideAccess: true,
    });

    expect(revalidatePath).toHaveBeenCalledWith("/about");
    expect(revalidatePath).toHaveBeenCalledWith("/ar/about");
    expect(revalidatePath).toHaveBeenCalledWith("/fr/about");
    expect(revalidatePath).toHaveBeenCalledWith("/ru/about");

    await payload.delete({ collection: "pages", id: aboutDoc.id, overrideAccess: true });
  });
});
