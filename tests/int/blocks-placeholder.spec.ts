import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import en from "../../src/i18n/messages/en.json";

// FeatureGridBlock/StatsBandBlock are async Server Components — they only
// need next-intl's getTranslations, not a real Next.js request context, so
// a lightweight mock backed by the real en.json catalog is enough to render
// them with react-dom/server (already a Next.js dependency, no new package)
// outside of the app runtime. next/image and shadcn Card render as plain
// server-safe markup with no client-only APIs, so renderToStaticMarkup is
// sufficient — no jsdom/RTL needed for this resilience check.
vi.mock("next-intl/server", () => ({
  getTranslations: async (namespace: string) => {
    const dict = (en as Record<string, Record<string, string>>)[namespace] ?? {};
    return (key: string) => dict[key] ?? key;
  },
}));

// FeatureGridBlock/StatsBandBlock import `sectionBg` from ./RenderBlocks,
// which also (for unrelated blocks) imports CertStripBlock -> next-intl's
// navigation helpers -> `next/navigation` — a module Vite/Vitest can't
// resolve outside an actual Next.js build. Mocking RenderBlocks to its real,
// trivial `sectionBg` implementation avoids pulling in that unrelated import
// graph for this test file.
vi.mock("@/components/blocks/RenderBlocks", () => ({
  sectionBg: (index: number) => (index % 2 === 0 ? "bg-white" : "bg-neutral-100"),
}));

const { FeatureGridBlock } = await import("@/components/blocks/FeatureGridBlock");
const { StatsBandBlock } = await import("@/components/blocks/StatsBandBlock");
const { TrustBarBlock } = await import("@/components/blocks/TrustBarBlock");
const { ExportProcessBlock } = await import("@/components/blocks/ExportProcessBlock");
const { TestimonialsBlock } = await import("@/components/blocks/TestimonialsBlock");
const { FaqBlock } = await import("@/components/blocks/FaqBlock");

const EMPTY_STATE_TEXT = "This section is being updated";

// TRUST-06 resilience: FeatureGrid/StatsBand must never crash the page,
// whether an editor leaves items[]/stats[] empty or authors an unusually
// long placeholder string (Pitfall 4 — stress-test wrapping).
describe("FeatureGrid/StatsBand placeholder resilience", () => {
  it("FeatureGrid renders long placeholder strings without throwing", async () => {
    const block = {
      blockType: "featureGrid",
      variant: "icon",
      sectionTitle: "Why Buyers Choose Us",
      items: [{ icon: "shieldCheck", title: "Q".repeat(80), body: "B".repeat(400) }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const html = renderToStaticMarkup(await FeatureGridBlock({ block, index: 0 }));
    expect(html).toContain("Q".repeat(80));
    expect(html).toContain("B".repeat(400));
  });

  it("FeatureGrid renders the empty-state line for an empty items[], never crashes", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const block = { blockType: "featureGrid", variant: "icon", items: [] } as any;

    const html = renderToStaticMarkup(await FeatureGridBlock({ block, index: 0 }));
    expect(html).toContain(EMPTY_STATE_TEXT);
  });

  it("FeatureGrid photo variant with no photo uploaded renders without throwing", async () => {
    const block = {
      blockType: "featureGrid",
      variant: "photo",
      items: [{ title: "Managing Director", body: "Oversees company strategy." }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const html = renderToStaticMarkup(await FeatureGridBlock({ block, index: 0 }));
    expect(html).toContain("Managing Director");
  });

  it("StatsBand renders long placeholder strings without throwing", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const block = { blockType: "statsBand", stats: [{ value: "500,000+", label: "C".repeat(200) }] } as any;

    const html = renderToStaticMarkup(await StatsBandBlock({ block, index: 1 }));
    expect(html).toContain("C".repeat(200));
  });

  it("StatsBand renders the empty-state line for an empty stats[], never crashes", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const block = { blockType: "statsBand", stats: [] } as any;

    const html = renderToStaticMarkup(await StatsBandBlock({ block, index: 1 }));
    expect(html).toContain(EMPTY_STATE_TEXT);
  });
});

// Phase 7 Plan 2: TrustBar/ExportProcess/Testimonials resilience (D-05).
describe("TrustBar/ExportProcess/Testimonials placeholder resilience", () => {
  it("TrustBar renders the empty-state line for an empty items[], never crashes", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const block = { blockType: "trustBar", items: [] } as any;

    const html = renderToStaticMarkup(await TrustBarBlock({ block, index: 0 }));
    expect(html).toContain(EMPTY_STATE_TEXT);
  });

  it("TrustBar with a logo-less item renders the text-chip fallback, never a broken image", async () => {
    const block = {
      blockType: "trustBar",
      items: [{ name: "Gulf & Middle East Importers" }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const html = renderToStaticMarkup(await TrustBarBlock({ block, index: 0 }));
    expect(html).toContain("Gulf &amp; Middle East Importers");
  });

  it("ExportProcess renders the empty-state line for an empty steps[], never crashes", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const block = { blockType: "exportProcess", steps: [] } as any;

    const html = renderToStaticMarkup(await ExportProcessBlock({ block, index: 1 }));
    expect(html).toContain(EMPTY_STATE_TEXT);
  });

  it("ExportProcess with two steps renders literal '01'/'02' badge text", async () => {
    const block = {
      blockType: "exportProcess",
      steps: [
        { title: "Inquiry", body: "Share your product and target quantity." },
        { title: "Quote", body: "Receive a detailed quote." },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const html = renderToStaticMarkup(await ExportProcessBlock({ block, index: 1 }));
    expect(html).toContain("01");
    expect(html).toContain("02");
  });

  it("Testimonials renders the empty-state line for an empty items[], never crashes", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const block = { blockType: "testimonials", items: [] } as any;

    const html = renderToStaticMarkup(await TestimonialsBlock({ block, index: 0 }));
    expect(html).toContain(EMPTY_STATE_TEXT);
  });

  it("Testimonials renders a quote with full attribution without throwing", async () => {
    const block = {
      blockType: "testimonials",
      items: [
        {
          quote: "Consistent grading and on-time dispatch, shipment after shipment.",
          name: "Procurement Lead",
          company: "GCC-Based Food Importer",
          country: "United Arab Emirates",
        },
      ],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const html = renderToStaticMarkup(await TestimonialsBlock({ block, index: 0 }));
    expect(html).toContain("Procurement Lead");
    expect(html).toContain("GCC-Based Food Importer · United Arab Emirates");
  });
});

// Phase 8 Plan 3: FaqBlock resilience (FAQ-01).
describe("FaqBlock placeholder resilience", () => {
  it("renders the empty-state line for an empty items[], never crashes", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const block = { blockType: "faq", items: [] } as any;

    const html = renderToStaticMarkup(await FaqBlock({ block, index: 0 }));
    expect(html).toContain(EMPTY_STATE_TEXT);
  });

  it("renders a long question without throwing; the closed-state answer stays present in the DOM (09-04: forceMount keeps content mounted so the grid-template-rows close transition can play, guarded by data-[state=closed]:invisible for a11y — verified against the edited accordion.tsx, not assumed)", async () => {
    const block = {
      blockType: "faq",
      items: [{ question: "Q".repeat(80), answer: "A".repeat(400) }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const html = renderToStaticMarkup(await FaqBlock({ block, index: 0 }));
    expect(html).toContain("Q".repeat(80));
    // forceMount: closed-state content renders (not unmounted), with
    // data-state="closed" so the a11y-hiding class targets it correctly.
    expect(html).toContain("A".repeat(400));
    expect(html).toContain('data-state="closed"');
  });
});
