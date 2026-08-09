// Google Maps "search" URL scheme — the officially documented, key-less form
// (developers.google.com/maps/documentation/urls/get-started#search-action).
// Opens the native Maps app on mobile and maps.google.com on desktop.
//
// Deliberately NOT a Google Business Profile / place_id link: VNP Global has
// no GBP listing yet (SEO_PLAYBOOK §11 tracks creating one as an open task).
// A query-by-address link is correct today and keeps working unchanged once a
// GBP exists, since Google resolves a matching listing for the query itself.
export function googleMapsSearchUrl(...parts: (string | null | undefined)[]): string | null {
  const query = parts
    .map((p) => p?.trim())
    .filter((p): p is string => Boolean(p))
    .join(", ");
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
