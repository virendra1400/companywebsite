import { describe, expect, it } from "vitest";
import { resolveSocialLinks } from "@/components/chrome/social-links";

// Quick task 260725-68r — resolveSocialLinks lives in a pure .ts module (no
// React/next-intl imports), so this test needs no mocks: it exercises the
// empty-state, recognized-platform, unknown-skip, and scheme-guard behaviors
// the footer's icon row depends on.
describe("resolveSocialLinks", () => {
  it("returns [] for empty input — footer renders no social row", () => {
    expect(resolveSocialLinks([])).toEqual([]);
  });

  it("resolves instagram + linkedin URLs to the right platform, in input order", () => {
    const result = resolveSocialLinks([
      "https://instagram.com/vnpglobal",
      "https://www.linkedin.com/company/vnpglobal",
    ]);

    expect(result).toEqual([
      { href: "https://instagram.com/vnpglobal", platform: "instagram", label: "Instagram" },
      {
        href: "https://www.linkedin.com/company/vnpglobal",
        platform: "linkedin",
        label: "LinkedIn",
      },
    ]);
  });

  it("skips an unrecognized URL", () => {
    const result = resolveSocialLinks(["https://example.com/x"]);
    expect(result).toEqual([]);
  });

  it("rejects a non-https value that merely contains a platform substring (scheme guard)", () => {
    const result = resolveSocialLinks(["javascript:instagram.com"]);
    expect(result).toEqual([]);
  });
});
