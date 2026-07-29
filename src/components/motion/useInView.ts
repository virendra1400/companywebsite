"use client";
// Phase 9 D-04/D-06/D-12: IntersectionObserver only (no window scroll
// listener). Fires once, then unobserves — no replay on scroll-up-and-
// back-down. Reduced-motion users skip the observer entirely and start
// "revealed" so content is never gated behind a JS trigger that
// intentionally never animates.
import { useEffect, useRef, useState } from "react";

export function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // window.matchMedia is a browser-only API unavailable during SSR/render;
      // this one-time reduced-motion short-circuit (D-12) has no derived-state
      // alternative that stays hydration-safe (initial state must be false to
      // match server markup).
      setInView(true); // eslint-disable-line react-hooks/set-state-in-effect
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el); // D-06: no replay
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
