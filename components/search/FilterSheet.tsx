"use client";

import { useEffect, useRef, useState } from "react";
import type { SearchState } from "@/lib/search-params";
import { SlidersIcon, XIcon } from "@/components/ui/Icon";
import { formatNumber } from "@/lib/utils";
import { FilterPanel } from "./FilterPanel";
import { useSearchNav } from "./SearchNav";

interface Props {
  state: SearchState;
  total: number;
  activeCount: number;
}

/** Mobile: filters live in a bottom sheet so results stay on screen. */
export function FilterSheet({ state, total, activeCount }: Props) {
  const [open, setOpen] = useState(false);
  const { pending, replace } = useSearchNav();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-navy/15 bg-white px-4 text-sm font-medium text-navy shadow-sm hover:bg-cream lg:hidden"
        aria-haspopup="dialog"
      >
        <SlidersIcon size={16} />
        Filters
        {activeCount > 0 && (
          <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-navy px-1.5 text-[11px] font-semibold text-cream">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 animate-fade-in bg-navy/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] animate-sheet-in flex-col rounded-t-3xl bg-cream shadow-2xl">
            <div className="flex items-center justify-between border-b border-navy/10 px-5 py-4">
              <h2 className="font-serif text-xl text-navy">Filters</h2>
              <div className="flex items-center gap-2">
                {activeCount > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      replace({
                        q: state.q,
                        near: state.near ? `${state.near.lat},${state.near.lng}` : null,
                        radius: state.radiusKm ? String(state.radiusKm) : null,
                      })
                    }
                    className="h-9 rounded-full px-3 text-sm font-medium text-navy/70 hover:bg-navy/5"
                  >
                    Clear all
                  </button>
                )}
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-navy/5"
                >
                  <XIcon size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              <FilterPanel state={state} />
            </div>
            <div className="border-t border-navy/10 bg-white px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-navy text-base font-semibold text-cream hover:bg-navy/90"
              >
                {pending ? "Updating…" : `Show ${formatNumber(total)} school${total === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
