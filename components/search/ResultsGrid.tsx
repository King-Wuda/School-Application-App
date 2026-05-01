"use client";

import { useMemo } from "react";
import type { School } from "@/lib/types";
import { SchoolCard } from "@/components/schools/SchoolCard";
import { useUserPosition } from "@/components/location/useUserPosition";
import { distanceKm } from "@/lib/utils";

interface Props {
  rows: School[];
  sort: string;
}

/**
 * When sort=distance and we have a user position, re-orders the current
 * page client-side. Server-side ordering by distance isn't practical
 * without PostGIS, so we sort per-page on the client.
 */
export function ResultsGrid({ rows, sort }: Props) {
  const pos = useUserPosition();

  const sorted = useMemo(() => {
    if (sort !== "distance" || !pos) return rows;
    return [...rows].sort((a, b) => {
      const da =
        a.latitude != null && a.longitude != null
          ? distanceKm(pos.lat, pos.lng, a.latitude, a.longitude)
          : Infinity;
      const db =
        b.latitude != null && b.longitude != null
          ? distanceKm(pos.lat, pos.lng, b.latitude, b.longitude)
          : Infinity;
      return da - db;
    });
  }, [rows, sort, pos]);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {sorted.map((s) => (
        <SchoolCard key={s.id} school={s} />
      ))}
    </div>
  );
}
