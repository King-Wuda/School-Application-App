"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { requestUserPosition } from "@/components/location/useUserPosition";
import { useShortlist } from "@/components/shortlist/ShortlistProvider";
import { LocateIcon, SearchIcon } from "@/components/ui/Icon";
import { LEVEL_OPTIONS } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics/client";

/** The home page's main search: pick a level, type a place or name, or use "near me". */
export function SearchForm() {
  const router = useRouter();
  const { notify } = useShortlist();
  const [q, setQ] = useState("");
  const [level, setLevel] = useState<string>("");
  const [locating, setLocating] = useState(false);
  const [pending, startTransition] = useTransition();

  const go = (params: Record<string, string>) => {
    const sp = new URLSearchParams();
    if (level) sp.set("level", level);
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    const qs = sp.toString();
    startTransition(() => router.push(qs ? `/search?${qs}` : "/search"));
  };

  const nearMe = async () => {
    setLocating(true);
    const res = await requestUserPosition();
    setLocating(false);
    track("near_me", { result: res.ok ? "ok" : res.reason, source: "home" });
    if (!res.ok) {
      notify(
        res.reason === "denied"
          ? "Location is blocked for this site. Type your suburb or town instead."
          : "We couldn't find your location. Type your suburb or town instead.",
      );
      return;
    }
    go({ near: `${res.pos.lat.toFixed(3)},${res.pos.lng.toFixed(3)}`, radius: "10", sort: "distance" });
  };

  return (
    <div className="rounded-3xl bg-white p-2 shadow-search ring-1 ring-navy/10 sm:p-3">
      <div role="radiogroup" aria-label="School level" className="scroll-row px-1 pb-2 pt-1 sm:pb-3">
        {[{ value: "", label: "All schools" }, ...LEVEL_OPTIONS].map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={level === o.value}
            onClick={() => setLevel(o.value)}
            className={cn(
              "h-9 shrink-0 rounded-full px-4 text-sm font-medium transition-colors",
              level === o.value ? "bg-navy text-cream" : "text-navy/70 hover:bg-navy/5 hover:text-navy",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go({ q: q.trim() });
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <label className="relative flex-1">
          <span className="sr-only">School name, suburb or town</span>
          <SearchIcon size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy/40" />
          <input
            type="search"
            enterKeyHint="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Suburb, town or school name"
            className="h-14 w-full rounded-2xl border border-navy/10 bg-cream/60 pl-12 pr-4 text-base text-navy outline-none transition placeholder:text-navy/45 focus:border-navy/30 focus:bg-white focus:ring-4 focus:ring-amber/20"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-navy px-7 text-base font-semibold text-cream transition hover:bg-navy/90 disabled:opacity-70"
        >
          {pending && !locating ? "Searching…" : "Search"}
        </button>
      </form>
      <div className="flex items-center justify-center gap-3 px-2 pb-1 pt-3 text-sm text-navy/50">
        <span className="h-px flex-1 bg-navy/10" />
        <span>or</span>
        <span className="h-px flex-1 bg-navy/10" />
      </div>
      <button
        type="button"
        onClick={nearMe}
        disabled={locating || pending}
        className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold text-navy transition hover:bg-cream disabled:opacity-70"
      >
        <LocateIcon size={20} className={cn("text-amber-600", locating && "animate-spin")} />
        {locating ? "Finding your location…" : "Show schools near me"}
      </button>
    </div>
  );
}
