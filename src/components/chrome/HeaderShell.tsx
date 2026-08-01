"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// T-102/COMPONENT_LIBRARY C-01: sticky header shrinks 72->60px (64->56px
// mobile) after 80px scroll. IntersectionObserver on a sentinel rather than
// a raw scroll listener (RESEARCH: no per-frame JS, matches this codebase's
// existing useInView pattern) — the sentinel sits just below the header; once
// it scrolls past the observer's negative rootMargin, we're past threshold.
export function HeaderShell({ children }: { children: ReactNode }) {
  const [shrunk, setShrunk] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShrunk(!entry.isIntersecting),
      { rootMargin: "-80px 0px 0px 0px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="pointer-events-none absolute top-0 h-px w-px" />
      <header
        data-shrunk={shrunk}
        className="sticky top-0 z-40 flex h-16 items-center border-b border-neutral-300 bg-white px-md transition-[height] duration-200 lg:px-xl data-[shrunk=false]:lg:h-[72px] data-[shrunk=true]:lg:h-[60px]"
      >
        {children}
      </header>
    </>
  );
}
