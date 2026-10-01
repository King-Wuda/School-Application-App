"use client";

import { SORT_OPTIONS } from "@/lib/search-params";
import { useSearchNav } from "./SearchNav";

export function SortSelect({ current, hasLocation }: { current: string; hasLocation: boolean }) {
  const { update } = useSearchNav();
  const options = SORT_OPTIONS.filter((o) => !o.needsLocation || hasLocation);

  return (
    <label className="inline-flex items-center gap-2 text-sm text-navy/60">
      <span className="hidden sm:inline">Sort</span>
      <select
        value={current}
        onChange={(e) => update({ sort: e.target.value === "relevance" ? null : e.target.value })}
        className="h-10 cursor-pointer rounded-full border border-navy/15 bg-white pl-3.5 pr-8 text-sm font-medium text-navy shadow-sm outline-none focus:border-navy/40"
        aria-label="Sort results"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
