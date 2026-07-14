import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { Payload } from "payload";

// CMS-03: publishing the Home global must invoke revalidatePath for every
// locale path. Mock next/cache before any module in the import chain
// (config -> payload.config -> globals/Home -> hooks/revalidateHome) pulls
// it in, so the hook calls our spy instead of the real Next.js cache API
// (which throws outside a request/render context).
const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath }));

const { getTestPayload } = await import("./config");

describe("revalidateHome afterChange hook", () => {
  let payload: Payload;

  beforeAll(async () => {
    payload = await getTestPayload();
  });

  afterAll(async () => {
    await payload.destroy();
  });

  it("calls revalidatePath for all four locale paths on publish", async () => {
    revalidatePath.mockClear();

    await payload.updateGlobal({
      slug: "home",
      locale: "en",
      data: { heroHeadline: "Revalidate me" },
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

    await payload.updateGlobal({
      slug: "home",
      locale: "en",
      data: { heroHeadline: "No revalidate" },
      overrideAccess: true,
      context: { disableRevalidate: true },
    });

    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
