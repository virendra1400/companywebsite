"use client";

import dynamic from "next/dynamic";

// T-206/PERF (D-57): next/dynamic() only actually code-splits when the call
// site is a Client Component — a documented Next.js App Router limitation
// (vercel/next.js#54935: "Server side dynamic imports will not split client
// modules into multiple chunks"). RenderBlocks.tsx previously called
// dynamic() on ContactBlockView from itself (a Server Component), which
// looked correct but never actually split anything — react-hook-form/zod/
// Turnstile stayed in the bundle loaded on every page regardless, confirmed
// under both Turbopack and webpack. Moving the dynamic() call into this
// dedicated "use client" file, one level deeper (around ContactForm
// specifically, not the whole ContactBlockView — ContactBlockView itself
// needs to stay server-rendered for next-intl/server's getTranslations),
// is the actual fix: the boundary now originates from client code.
// A genuine network fetch now happens here that didn't before (the whole
// point of the fix) — on a slow connection (this site's own target
// audience per CLAUDE.md: "varied networks", Gulf/SEA buyers), a `null`
// fallback would show nothing while a real ~360KB chunk loads. Minimal
// pulse placeholder sized to roughly the form's real footprint, not a
// full skeleton component — this is the only call site.
function ContactFormLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-md" aria-hidden="true">
      <div className="h-9 rounded-md bg-neutral-200" />
      <div className="h-9 rounded-md bg-neutral-200" />
      <div className="h-9 rounded-md bg-neutral-200" />
      <div className="h-24 rounded-md bg-neutral-200" />
      <div className="h-9 w-32 rounded-md bg-neutral-200" />
    </div>
  );
}

export const ContactFormLazy = dynamic(
  () => import("./ContactForm").then((m) => m.ContactForm),
  { loading: ContactFormLoading },
);
