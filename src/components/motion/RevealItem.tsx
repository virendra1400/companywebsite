"use client";

import { cn } from "@/lib/utils";
import { useInView } from "./useInView";

// 09-UI-SPEC Motion Contract §3: per-item stagger delay, capped so a large
// catalog grid never produces a slow item-by-item march (CAT-03 scalability).
const STAGGER_MS = 50;
const STAGGER_CAP = 8;

type Direction = "up" | "start" | "end";

export function RevealItem({
  children,
  index,
  direction = "up",
  className,
}: {
  children: React.ReactNode;
  index: number;
  direction?: Direction;
  className?: string;
}) {
  const { ref, inView } = useInView();
  const delay = Math.min(index, STAGGER_CAP) * STAGGER_MS;

  // D-10/RESEARCH Pitfall 6: the rtl: variant is what makes a directional
  // slide mirror correctly in Arabic. Verified against the installed
  // compiler: `rtl:translate-x-4` emits `:where(:dir(rtl), [dir="rtl"],
  // [dir="rtl"] *)` ordered after the base offset utility, so it wins under
  // dir="rtl". `npm run lint:rtl` cannot catch a sign mistake here
  // (translate-x-* is not in its banned list) — the e2e assertion in plan
  // 09-03 is the real gate.
  const offsetClass =
    direction === "start"
      ? "-translate-x-4 rtl:translate-x-4"
      : direction === "end"
        ? "translate-x-4 rtl:-translate-x-4"
        : "translate-y-4";

  return (
    <div
      ref={ref}
      data-motion="reveal-item"
      data-direction={direction}
      data-revealed={inView || undefined}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        offsetClass,
        // T-207/DESIGN_SYSTEM §6: entry fade-rise must be 200-300ms — was
        // 500ms, well over the spec ceiling.
        "opacity-0 transition-[opacity,translate] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] data-[revealed]:translate-x-0 data-[revealed]:translate-y-0 data-[revealed]:opacity-100 motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:opacity-100 motion-reduce:transition-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
