"use client";

import Link from "next/link";
import { useShortlist } from "@/components/shortlist/ShortlistProvider";
import { useShortlistSchools } from "@/components/shortlist/useShortlistSchools";
import { SchoolCard } from "@/components/schools/SchoolCard";
import { ExportPdfButton } from "@/components/shortlist/ExportPdfButton";
import { SchoolCardSkeleton } from "@/components/ui/Skeleton";
import { HeartIcon } from "@/components/ui/Icon";

export default function ShortlistPage() {
  const { ids, isAuthed } = useShortlist();
  const { schools, loading } = useShortlistSchools();

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-hero text-navy">My shortlist</h1>
          <p className="mt-1 text-navy/70">
            {ids.size} of 10 schools saved
            {!isAuthed && ids.size > 0 && (
              <>
                {" "}
                · saved on this device only.{" "}
                <Link href="/login" className="font-medium text-navy underline">
                  Sign in to keep it
                </Link>
              </>
            )}
          </p>
        </div>
        {schools.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {schools.length >= 2 && (
              <Link
                href="/compare"
                className="inline-flex h-10 items-center rounded-lg bg-navy px-4 text-sm font-semibold text-cream hover:bg-navy/90"
              >
                Compare side by side
              </Link>
            )}
            <ExportPdfButton schools={schools} />
          </div>
        )}
      </header>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-label="Loading shortlist">
          {Array.from({ length: Math.max(1, Math.min(ids.size, 3)) }, (_, i) => (
            <SchoolCardSkeleton key={i} />
          ))}
        </div>
      ) : schools.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-navy/20 bg-white px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <HeartIcon size={26} />
          </div>
          <p className="mt-5 font-serif text-2xl text-navy">Your shortlist is empty</p>
          <p className="mx-auto mt-2 max-w-md text-navy/65">
            Tap the heart on any school while you browse to save it here.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-flex h-12 items-center rounded-xl bg-navy px-6 font-semibold text-cream"
          >
            Find schools
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
