"use client";

import { useState } from "react";
import { requestUserPosition } from "@/components/location/useUserPosition";
import { useShortlist } from "@/components/shortlist/ShortlistProvider";
import { LocateIcon, XIcon } from "@/components/ui/Icon";
import { RADIUS_OPTIONS } from "@/lib/search-params";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics/client";
import { useSearchNav } from "./SearchNav";

interface Props {
  near?: { lat: number; lng: number };
  radiusKm?: number;
}

/**
 * "Near me": asks for location only when tapped, then sorts every matching
 * school by distance (not just the current page).
 */
export function NearMeButton({ near, radiusKm }: Props) {
  const { update } = useSearchNav();
  const { notify } = useShortlist();
  const [locating, setLocating] = useState(false);

  const locate = async () => {
    setLocating(true);
    const res = await requestUserPosition();
    setLocating(false);
    track("near_me", { result: res.ok ? "ok" : res.reason, source: "search" });
    if (!res.ok) {
      notify(
        res.reason === "denied"
          ? "Location is blocked for this site. Allow it in your browser settings, or search by suburb instead."
          : "We couldn't find your location. Try searching by suburb or town instead.",
      );
      return;
    }
    update({
      near: `${res.pos.lat.toFixed(3)},${res.pos.lng.toFixed(3)}`,
      radius: String(radiusKm ?? 10),
      sort: "distance",
      province: null,
      area: null,
    });
  };

  if (!near) {
    return (
      <button
        type="button"
        onClick={locate}
        disabled={locating}
        className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full border border-navy/15 bg-white px-4 text-sm font-semibold text-navy shadow-sm transition hover:bg-cream disabled:opacity-60"
      >
        <LocateIcon size={18} className={cn(locating && "animate-spin")} />
        <span>{locating ? "Finding you…" : "Near me"}</span>
      </button>
    );
  }

  return (
    <div className="flex h-12 shrink-0 items-center gap-1 rounded-full border border-navy bg-navy pl-3 pr-1 text-sm text-cream shadow-sm">
      <LocateIcon size={16} className="text-amber" />
      <label htmlFor="radius" className="sr-only">
        Distance from you
      </label>
      <select
        id="radius"
        value={radiusKm ?? 10}
        onChange={(e) => update({ radius: e.target.value })}
        className="h-10 cursor-pointer appearance-none bg-transparent bg-none !pr-1 pl-1 font-semibold outline-none [&>option]:text-navy"
      >
        {RADIUS_OPTIONS.map((r) => (
          <option key={r} value={r}>
            Within {r} km
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => update({ near: null, radius: null, sort: null })}
        aria-label="Stop searching near me"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
      >
        <XIcon size={16} />
      </button>
    </div>
  );
}
