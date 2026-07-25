// Quick task 260725-68r — pure URL-to-platform resolver for GlobalFooter's
// social icon row. NO React/next-intl imports so it stays mock-free unit
// testable (tests/int/footer-social-links.spec.ts). Scheme guard (T-08q-01):
// only https/http URLs are ever eligible, so a `javascript:`/`data:` value
// that merely contains a platform substring can never become a rendered href.
export type SocialPlatform = "instagram" | "linkedin";

export function resolveSocialLinks(
  urls: string[],
): { href: string; platform: SocialPlatform; label: string }[] {
  const results: { href: string; platform: SocialPlatform; label: string }[] = [];

  for (const raw of urls ?? []) {
    const url = raw.trim();
    if (!url.startsWith("https://") && !url.startsWith("http://")) continue;

    if (url.includes("instagram.com")) {
      results.push({ href: url, platform: "instagram", label: "Instagram" });
    } else if (url.includes("linkedin.com")) {
      results.push({ href: url, platform: "linkedin", label: "LinkedIn" });
    }
  }

  return results;
}
