"use client";

import { useEffect, useState } from "react";
import { SearchIcon, XIcon } from "@/components/ui/Icon";
import { useSearchNav } from "./SearchNav";

/** Free-text search on the results page (school name, suburb or town). */
export function SearchBar({ initial }: { initial?: string }) {
  const { update } = useSearchNav();
  const [q, setQ] = useState(initial ?? "");

  // Keep in sync when the query changes elsewhere (e.g. a chip is removed).
  useEffect(() => setQ(initial ?? ""), [initial]);

  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        update({ q: q.trim() || null, area: null });
      }}
      className="relative flex-1"
    >
      <label htmlFor="search-q" className="sr-only">
        School name, suburb or town
      </label>
      <SearchIcon size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" />
      <input
        id="search-q"
        type="search"
        enterKeyHint="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="School name, suburb or town"
        className="h-12 w-full rounded-full border border-navy/15 bg-white pl-11 pr-24 text-base text-navy shadow-sm outline-none transition placeholder:text-navy/40 focus:border-navy/40 focus:ring-4 focus:ring-amber/20 [&::-webkit-search-cancel-button]:hidden"
      />
      {q && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            if (initial) update({ q: null });
          }}
          aria-label="Clear search"
          className="absolute right-[4.5rem] top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-navy/40 hover:bg-navy/5 hover:text-navy"
        >
          <XIcon size={16} />
        </button>
      )}
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 inline-flex h-9 -translate-y-1/2 items-center rounded-full bg-navy px-4 text-sm font-semibold text-cream hover:bg-navy/90"
      >
        Search
      </button>
    </form>
  );
}
