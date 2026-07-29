"use client";

import { useInView } from "./useInView";

// D-03/D-05: the transition list names `translate`, NOT `transform`.
// Verified against the installed compiler (tailwindcss 4.3.2): `translate-y-6`
// compiles to `--tw-translate-y: ...; translate: var(--tw-translate-x)
// var(--tw-translate-y);` — Tailwind v4 emits translate-* utilities as the
// standalone `translate` CSS property, so naming only `transform` here would
// animate nothing and the reveal would snap instead of fade.
export function Reveal({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      data-motion="reveal"
      data-revealed={inView || undefined}
      className="translate-y-6 opacity-0 transition-[opacity,translate] duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] data-[revealed]:translate-y-0 data-[revealed]:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none"
    >
      {children}
    </div>
  );
}
