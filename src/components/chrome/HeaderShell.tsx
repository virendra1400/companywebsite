"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// T-102/COMPONENT_LIBRARY C-01: sticky header shrinks 72->60px (64->56px
// mobile) after 80px scroll. IntersectionObserver on a sentinel rather than
// a raw scroll listener (RESEARCH: no per-frame JS, matches this codebase's
// existing useInView pattern) — the sentinel is pinned 80px down the PAGE
// (not the header), in normal flow, default rootMargin/threshold: it starts
// inside the viewport (intersecting -> not shrunk) and scrolls out of view
// only once the page has actually moved 80px (not intersecting -> shrunk).
// A rootMargin-shrunk observation window on a sentinel fixed at y:0 does NOT
// produce this "N px scrolled" behavior — the sentinel itself has to be the
// one positioned at the threshold depth.
export function HeaderShell({ children }: { children: ReactNode }) {
  const [shrunk, setShrunk] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setShrunk(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={sentinelRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-[80px] h-px w-px"
      />
      <header
        data-shrunk={shrunk}
        className="sticky top-0 z-40 flex h-16 items-center border-b border-neutral-300 bg-white px-md transition-[height] duration-200 lg:px-xl data-[shrunk=false]:lg:h-[72px] data-[shrunk=true]:lg:h-[60px]"
      >
        {children}
      </header>
    </>
  );
}
