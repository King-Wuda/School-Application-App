"use client";

import { useEffect, useState } from "react";
import type { SchoolWithRelations } from "@/lib/types";
import { useShortlist } from "./ShortlistProvider";

/** Loads full details for every shortlisted school, in the order they were saved. */
export function useShortlistSchools() {
  const { ids, ready } = useShortlist();
  const [schools, setSchools] = useState<SchoolWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const key = Array.from(ids).join(",");

  useEffect(() => {
    if (!ready) return;
    if (!key) {
      setSchools([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/schools?ids=${encodeURIComponent(key)}`)
      .then((r) => r.json())
      .then((json: { schools?: SchoolWithRelations[] }) => {
        if (cancelled) return;
        const order = key.split(",");
        setSchools((json.schools ?? []).sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id)));
      })
      .catch(() => !cancelled && setSchools([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [key, ready]);

  return { schools, loading: loading || !ready };
}
