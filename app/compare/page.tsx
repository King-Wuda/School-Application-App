"use client";

import { CompareClient } from "@/components/compare/CompareClient";
import { useShortlistSchools } from "@/components/shortlist/useShortlistSchools";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ComparePage() {
  const { schools, loading } = useShortlistSchools();

  return (
    <div className="container-page py-8 sm:py-12">
      <header className="mb-8">
        <h1 className="font-serif text-hero text-navy">Compare schools</h1>
        <p className="mt-2 max-w-2xl text-navy/70">
          Pick up to three schools from your shortlist to see them side by side.
        </p>
      </header>
      {loading ? (
        <div className="space-y-4" role="status" aria-label="Loading your shortlist">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      ) : (
        <CompareClient schools={schools} />
      )}
    </div>
  );
}
