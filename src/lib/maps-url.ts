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
    .map((p) =>
      // Addresses are authored in CMS textareas and legitimately contain
      // newlines (company name / street / city on separate lines). Left as-is
      // they encode to %0A in the query string; collapse all whitespace runs
      // to single spaces, and turn line breaks into comma separators so the
      // query still reads as a normal one-line address to Google.
      (p ?? "")
        .replace(/\s*\n+\s*/g, ", ")
        .replace(/[ \t]+/g, " ")
        // Strip separator-only leftovers, so a blank/whitespace-only field
        // can't survive as a bare "," and build a junk ?query=%2C link.
        .replace(/(^[\s,]+)|([\s,]+$)/g, ""),
    )
    .filter((p) => p.length > 0)
    .join(", ");
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
