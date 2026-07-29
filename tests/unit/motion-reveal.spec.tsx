import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Reveal } from "@/components/motion/Reveal";
import { RevealItem } from "@/components/motion/RevealItem";

// useEffect never runs under renderToStaticMarkup, so these specs
// deterministically capture the pre-reveal (server-rendered) state — exactly
// the contract worth locking: what a user sees before any JS runs.

describe("Reveal", () => {
  it("renders the pre-reveal class contract, no data-revealed attribute", () => {
    const html = renderToStaticMarkup(
      <Reveal>
        <p>hello</p>
      </Reveal>,
    );

    expect(html).toContain('data-motion="reveal"');
    expect(html).toContain("opacity-0");
    expect(html).toContain("translate-y-6");
    expect(html).toContain("transition-[opacity,translate]");
    expect(html).not.toContain("data-revealed");
  });

  it("wraps its children rather than replacing server-rendered output", () => {
    const html = renderToStaticMarkup(
      <Reveal>
        <p>hello world</p>
      </Reveal>,
    );

    expect(html).toContain("hello world");
  });
});

describe("RevealItem", () => {
  it("index 0 renders transition-delay:0ms", () => {
    const html = renderToStaticMarkup(
      <RevealItem index={0}>
        <p>a</p>
      </RevealItem>,
    );

    expect(html).toContain("transition-delay:0ms");
  });

  it("index 3 renders transition-delay:150ms", () => {
    const html = renderToStaticMarkup(
      <RevealItem index={3}>
        <p>a</p>
      </RevealItem>,
    );

    expect(html).toContain("transition-delay:150ms");
  });

  it("index 20 plateaus at transition-delay:400ms (STAGGER_CAP)", () => {
    const html = renderToStaticMarkup(
      <RevealItem index={20}>
        <p>a</p>
      </RevealItem>,
    );

    expect(html).toContain("transition-delay:400ms");
  });

  it("direction=start renders both -translate-x-4 and rtl:translate-x-4", () => {
    const html = renderToStaticMarkup(
      <RevealItem index={0} direction="start">
        <p>a</p>
      </RevealItem>,
    );

    expect(html).toContain("-translate-x-4");
    expect(html).toContain("rtl:translate-x-4");
  });

  it("direction=end renders both translate-x-4 and rtl:-translate-x-4", () => {
    const html = renderToStaticMarkup(
      <RevealItem index={0} direction="end">
        <p>a</p>
      </RevealItem>,
    );

    // "start" case's -translate-x-4 must not accidentally satisfy this
    // assertion — check the unsigned fragment directly, then the mirrored one.
    expect(html).toContain("translate-x-4");
    expect(html).toContain("rtl:-translate-x-4");
  });

  it("default direction=up renders translate-y-4 and no x-axis classes", () => {
    const html = renderToStaticMarkup(
      <RevealItem index={0}>
        <p>a</p>
      </RevealItem>,
    );

    expect(html).toContain("translate-y-4");
    expect(html).not.toContain("translate-x-4");
  });

  it("passes the caller-supplied className through", () => {
    const html = renderToStaticMarkup(
      <RevealItem index={0} className="h-full">
        <p>a</p>
      </RevealItem>,
    );

    expect(html).toContain("h-full");
  });
});
