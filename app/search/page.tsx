import type { Metadata } from "next";
import Link from "next/link";
import { listSchools } from "@/lib/data";
import { activeFilterCount, describeSearch, parseSearchParams } from "@/lib/search-params";
import { formatNumber } from "@/lib/utils";
import { SchoolCard } from "@/components/schools/SchoolCard";
import { FilterPanel } from "@/components/search/FilterPanel";
import { FilterSheet } from "@/components/search/FilterSheet";
import { ActiveFilters } from "@/components/search/ActiveFilters";
import { SearchBar } from "@/components/search/SearchBar";
import { NearMeButton } from "@/components/search/NearMeButton";
import { SortSelect } from "@/components/search/SortSelect";
import { Pagination } from "@/components/search/Pagination";
import { PendingBar, PendingFrame, SearchNavProvider } from "@/components/search/SearchNav";
import { EmptyResults } from "@/components/search/EmptyResults";
import { InfoIcon } from "@/components/ui/Icon";

type SP = { [key: string]: string | string[] | undefined };

// Rendered per request (it depends on the query string), but the underlying
// database queries are cached — see lib/data.ts.
export const dynamic = "force-dynamic";

export function generateMetadata({ searchParams }: { searchParams: SP }): Metadata {
  const state = parseSearchParams(searchParams);
  const { title, where } = describeSearch(state);
  const full = where && !state.near ? `${title} ${where}` : title;
  return {
    title: state.q ? `“${state.q}” — school search` : full,
    description: `Compare ${full.toLowerCase()} in South Africa: fees, grades, contact details, directions and application deadlines.`,
    // Personal "near me" searches and deep filter combinations shouldn't be indexed.
    robots: state.near || state.q || activeFilterCount(state) > 2 ? { index: false, follow: true } : undefined,
  };
}

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const state = parseSearchParams(searchParams);
  const { rows, total, page, pageSize } = await listSchools(state);
  const { title, where } = describeSearch(state);
  const activeCount = activeFilterCount(state);
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(total, page * pageSize);
  const partialProvince = state.province && state.province !== "Western Cape";

  return (
    <SearchNavProvider>
      <PendingBar />
      <div className="border-b border-navy/10 bg-white">
        <div className="container-page py-5 sm:py-7">
          <h1 className="font-serif text-2xl text-navy sm:text-3xl">
            {title}
            {where && <span className="text-navy/55"> {where}</span>}
          </h1>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <SearchBar initial={state.q} />
            <NearMeButton near={state.near} radiusKm={state.radiusKm} />
          </div>
        </div>
      </div>

      <div className="container-page py-6 sm:py-8">
        <div className="grid gap-8 lg:grid-cols-[272px_1fr]">
          <aside className="hidden lg:block" aria-label="Filters">
            <div className="sticky top-20 rounded-2xl border border-navy/10 bg-white p-5">
              <FilterPanel state={state} />
            </div>
          </aside>

          <section aria-labelledby="results-heading" className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p id="results-heading" className="text-sm text-navy/70" aria-live="polite">
                {total === 0 ? (
                  "No schools found"
                ) : (
                  <>
                    <span className="font-semibold text-navy">{formatNumber(total)}</span>{" "}
                    school{total === 1 ? "" : "s"}
                    {total > pageSize && (
                      <span className="text-navy/50">
                        {" "}
                        · showing {formatNumber(first)}–{formatNumber(last)}
                      </span>
                    )}
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
                <FilterSheet state={state} total={total} activeCount={activeCount} />
                <SortSelect current={state.sort} hasLocation={Boolean(state.near)} />
              </div>
            </div>

            <div className="mt-3">
              <ActiveFilters state={state} />
            </div>

            {partialProvince && (
              <div className="mt-4 flex gap-3 rounded-xl border border-amber/40 bg-amber-50 p-4 text-sm text-navy">
                <InfoIcon size={18} className="mt-0.5 shrink-0 text-amber-600" />
                <p>
                  We&apos;re still adding {state.province} schools — only a handful are listed so far.{" "}
                  <Link href="/search?province=Western+Cape" className="font-semibold underline">
                    Every Western Cape school
                  </Link>{" "}
                  is already here.
                </p>
              </div>
            )}

            <PendingFrame className="mt-5">
              {rows.length === 0 ? (
                <EmptyResults state={state} />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                  {rows.map((s) => (
                    <SchoolCard key={s.id} school={s} />
                  ))}
                </div>
              )}
              <Pagination page={page} pageSize={pageSize} total={total} />
            </PendingFrame>
          </section>
        </div>
      </div>
    </SearchNavProvider>
  );
}
