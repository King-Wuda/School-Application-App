"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useShortlist } from "@/components/shortlist/ShortlistProvider";
import { SchoolCard } from "@/components/schools/SchoolCard";
import { ExportPdfButton } from "@/components/shortlist/ExportPdfButton";
import type { SchoolWithRelations } from "@/lib/types";

export default function ShortlistPage() {
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
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-hero text-navy">My shortlist</h1>
          <p className="mt-1 text-navy/70">
            {ids.size} of 10 schools saved
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/compare"
            className="inline-flex h-10 items-center rounded-lg bg-navy px-4 text-sm font-medium text-cream hover:bg-navy/90"
          >
            Compare →
          </Link>
          <ExportPdfButton schools={schools} />
        </div>
      </header>

      {loading ? (
        <p className="text-navy/60">Loading…</p>
      ) : schools.length === 0 ? (
        <div className="rounded-xl border border-dashed border-navy/20 bg-white p-10 text-center">
          <p className="font-serif text-xl text-navy">No schools yet</p>
          <p className="mt-2 text-navy/60">
            Save schools to your shortlist as you browse.
          </p>
          <Link
            href="/search"
            className="mt-4 inline-flex h-10 items-center rounded-lg bg-navy px-4 text-sm font-medium text-cream"
          >
            Browse schools
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map((s) => (
            <SchoolCard key={s.id} school={s} />
          ))}
        </div>
      )}
    </div>
  );
}
