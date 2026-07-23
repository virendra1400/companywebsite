// WR-03: /insights/[slug]'s notFound() was falling through to Next's generic
// boundary instead of the documented insights.notFoundHeading/notFoundBody
// copy (05-04-PLAN must-have) — this segment not-found.tsx is what Next
// renders instead.
//
// Next's App Router does NOT pass route params to not-found.tsx (verified:
// destructuring params throws "Cannot destructure property 'locale' of
// undefined" during prerender). Worse: once generateStaticParams enumerates
// at least one real slug, Next classifies [slug] as static-with-fallback, and
// any dynamic-context API (getTranslations() with no explicit locale,
// next-intl's <Link>) called from this boundary during an on-demand static
// render for an unlisted slug throws DYNAMIC_SERVER_USAGE — a real 500 in
// production (confirmed live), not just a dev-only static/dynamic nuance.
// Fix: no next-intl APIs here at all — hardcoded English copy + a plain
// <a> tag. Matches the project's English-first priority for this rarely-hit
// error boundary; every other user-facing surface stays fully localized.
export default function InsightsNotFound() {
  return (
    <main className="px-md py-3xl text-center md:px-lg xl:px-xl">
      <div className="mx-auto max-w-[640px]">
        <h1 className="text-display font-semibold text-neutral-900">Article not found.</h1>
        <p className="mt-sm text-body text-neutral-600">
          This article may have been removed or is no longer available. Browse all insights.
        </p>
        <a href="/insights" className="mt-lg inline-block text-primary-700 underline">
          Insights
        </a>
      </div>
    </main>
  );
}
