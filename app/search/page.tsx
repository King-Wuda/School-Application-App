import type { Metadata } from "next";
import { FilterSidebar } from "@/components/search/FilterSidebar";
import { SortSelect } from "@/components/search/SortSelect";
import { Pagination } from "@/components/search/Pagination";
import { ResultsGrid } from "@/components/search/ResultsGrid";
import { listSchools } from "@/lib/data";
import type { SchoolType } from "@/lib/types";

export const metadata: Metadata = {
  title: "Search schools",
  description:
    "Search and filter every school and university in South Africa by province, type, grades and fees.",
};

export const dynamic = "force-dynamic";

function parseQP(sp: { [key: string]: string | string[] | undefined }) {
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  return {
    q: get("q") || undefined,
    province: get("province") || undefined,
    type: (get("type") as SchoolType | undefined) || undefined,
    grade: get("grade") || undefined,
    feeMin: parseNum(get("fee_min")),
    feeMax: parseNum(get("fee_max")),
    sort: (get("sort") as any) || "relevance",
    page: parseNum(get("page")) || 1,
  };
}

function parseNum(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const parsed = parseQP(searchParams);
  const { rows, total, page, pageSize } = await listSchools(parsed);

  const activeLabel = [
    parsed.province,
    parsed.type && typeLabel(parsed.type),
    parsed.q && `"${parsed.q}"`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="container-page py-6 sm:py-10">
      <header className="mb-6">
        <h1 className="font-serif text-hero text-navy">Schools</h1>
        <p className="mt-1 text-navy/70">
          {total.toLocaleString("en-ZA")} result{total === 1 ? "" : "s"}
          {activeLabel ? ` · ${activeLabel}` : ""}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <details className="group lg:open:pointer-events-auto" open>
            <summary className="flex cursor-pointer items-center justify-between rounded-lg border border-navy/10 bg-white px-4 py-3 text-sm font-medium text-navy lg:hidden">
              Filters
              <span className="text-navy/40 group-open:hidden">+ Open</span>
              <span className="hidden text-navy/40 group-open:inline">× Close</span>
            </summary>
            <div className="mt-3 rounded-xl border border-navy/10 bg-white p-4 lg:mt-0">
              <FilterSidebar
                initial={{
                  q: parsed.q,
                  province: parsed.province,
                  type: parsed.type,
                  grade: parsed.grade,
                  feeMin: parsed.feeMin != null ? String(parsed.feeMin) : "",
                  feeMax: parsed.feeMax != null ? String(parsed.feeMax) : "",
                }}
              />
            </div>
          </details>
        </aside>

        <section>
          <div className="mb-4 flex items-center justify-end">
            <SortSelect current={parsed.sort} />
          </div>

          {rows.length === 0 ? (
            <div className="rounded-xl border border-dashed border-navy/20 bg-white p-10 text-center">
              <p className="font-serif text-xl text-navy">No schools found</p>
              <p className="mt-2 text-navy/60">
                Try broadening your filters or searching a different area.
              </p>
            </div>
          ) : (
            <ResultsGrid rows={rows} sort={parsed.sort} />
          )}

          <Pagination page={page} pageSize={pageSize} total={total} />
        </section>
      </div>
    </div>
  );
}

function typeLabel(t: SchoolType) {
  return { public: "Public", model_c: "Model C", private: "Private", university: "University" }[t];
}
