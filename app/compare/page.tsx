"use client";

import { useEffect, useState } from "react";
import { CompareClient } from "@/components/compare/CompareClient";
import { useShortlist } from "@/components/shortlist/ShortlistProvider";
import type { SchoolWithRelations } from "@/lib/types";

export default function ComparePage() {
  const { ids } = useShortlist();
  const [schools, setSchools] = useState<SchoolWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const arr = Array.from(ids);
    if (arr.length === 0) {
      setSchools([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/schools?ids=${arr.join(",")}`)
      .then((r) => r.json())
      .then((json) => setSchools(json.schools ?? []))
      .finally(() => setLoading(false));
  }, [ids]);

  return (
    <div className="container-page py-6 sm:py-10">
      <header className="mb-6">
        <h1 className="font-serif text-hero text-navy">Compare schools</h1>
        <p className="mt-1 text-navy/70">
          Select up to 3 shortlisted schools to compare side-by-side.
        </p>
      </header>
      {loading ? (
        <p className="text-navy/60">Loading…</p>
      ) : (
        <CompareClient schools={schools} />
      )}
    </div>
  );
}
