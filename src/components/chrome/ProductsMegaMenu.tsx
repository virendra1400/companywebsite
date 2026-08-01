"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";

type MegaMenuCategory = {
  id: number;
  name: string;
  products: { slug: string; name: string }[];
};

// T-102/COMPONENT_LIBRARY C-02: Products mega-menu, one column per real CMS
// category (no hardcoded SKU list — new products/categories show up here for
// free). Keyboard: Escape closes and returns focus to the trigger; clicking
// outside or blurring the whole menu closes it. Category data comes from the
// server (GlobalHeader already queries getProductsByCategory for the page),
// passed down as a plain prop — this component owns only open/close state.
export function ProductsMegaMenu({
  label,
  categories,
  allProductsLabel,
}: {
  label: string;
  categories: MegaMenuCategory[];
  allProductsLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-label text-neutral-900 hover:text-primary-700"
      >
        {label}
        <ChevronDown aria-hidden="true" className="size-3.5" />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label={label}
          className="absolute top-full start-0 z-50 mt-sm grid grid-cols-2 gap-lg rounded-md border border-neutral-300 bg-white p-lg shadow-card-hover md:grid-cols-3"
          style={{ minWidth: "36rem" }}
        >
          {categories.map((category) => (
            <div key={category.id} className="flex flex-col gap-xs">
              <p className="text-label font-semibold text-neutral-900">{category.name}</p>
              {category.products.map((product) => (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  role="menuitem"
                  className="text-label text-neutral-600 hover:text-primary-700"
                  onClick={() => setOpen(false)}
                >
                  {product.name}
                </Link>
              ))}
            </div>
          ))}
          <div className="col-span-2 border-t border-neutral-300 pt-sm md:col-span-3">
            <Link
              href="/products"
              role="menuitem"
              className="text-label font-semibold text-primary-700 hover:underline"
              onClick={() => setOpen(false)}
            >
              {allProductsLabel}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
