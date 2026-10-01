"use client";

import Link from "next/link";
import type { SearchState } from "@/lib/search-params";
import { SearchIcon } from "@/components/ui/Icon";
import { useSearchNav } from "./SearchNav";

/** Suggests the most useful way out of an empty search. */
export function EmptyResults({ state }: { state: SearchState }) {
  const { update, replace } = useSearchNav();
  const suggestions: { label: string; onClick: () => void }[] = [];

  if (state.near && (state.radiusKm ?? 10) < 25) {
    suggestions.push({ label: "Search within 25 km", onClick: () => update({ radius: "25" }) });
  }
  if (state.grade) suggestions.push({ label: `Any grade (not just ${state.grade})`, onClick: () => update({ grade: null }) });
  if (state.feeMax != null) suggestions.push({ label: "Any fees", onClick: () => update({ fee_max: null }) });
  if (state.type) suggestions.push({ label: "Any school type", onClick: () => update({ type: null }) });
  if (state.q) suggestions.push({ label: `Remove “${state.q}”`, onClick: () => update({ q: null }) });
  if (suggestions.length === 0 && (state.level || state.noFee || state.area || state.province)) {
    suggestions.push({ label: "Clear all filters", onClick: () => replace({}) });
  }

  return (
    <div className="rounded-2xl border border-dashed border-navy/20 bg-white px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-cream text-navy/50">
        <SearchIcon size={22} />
      </div>
      <p className="mt-4 font-serif text-xl text-navy">No schools match all of that</p>
      <p className="mx-auto mt-2 max-w-md text-navy/60">
        {state.q
          ? "Check the spelling, or try a nearby suburb or town. Official school names are sometimes shortened."
          : "Try loosening one of your filters."}
      </p>
      {suggestions.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {suggestions.slice(0, 3).map((s) => (
            <button key={s.label} type="button" onClick={s.onClick} className="chip">
              {s.label}
            </button>
          ))}
        </div>
      )}
      <Link href="/search?province=Western+Cape" className="mt-6 inline-block text-sm font-medium text-navy underline underline-offset-2">
        Browse every Western Cape school
      </Link>
    </div>
  );
}
