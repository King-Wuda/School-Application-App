import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/server";
import { SCHOOL_TYPE_BADGE_CLASSES, SCHOOL_TYPE_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { refreshPublicData } from "@/lib/admin-actions";
import { formatNumber, sanitiseLike } from "@/lib/utils";

const PAGE_LIMIT = 100;

export const dynamic = "force-dynamic";

export default async function AdminSchoolsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  if (!hasSupabaseEnv()) {
    return (
      <div className="rounded-xl border border-amber/40 bg-amber/10 p-6 text-navy">
        <p className="font-serif text-lg font-semibold">Supabase not configured</p>
        <p className="mt-1 text-sm">
          Set <code className="rounded bg-white px-1">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
          <code className="rounded bg-white px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{" "}
          <code className="rounded bg-white px-1">SUPABASE_SERVICE_ROLE_KEY</code> in{" "}
          <code>.env.local</code>, run the migrations in{" "}
          <code>supabase/migrations/</code> (in order), then{" "}
          <code>npm run seed</code>.
        </p>
      </div>
    );
  }

  const supabase = getSupabaseAdminClient();
  const q = sanitiseLike(searchParams.q ?? "");
  let query = supabase
    .from("schools")
    .select("id, slug, name, type, province, suburb, is_featured", { count: "exact" })
    .order("is_featured", { ascending: false })
    .order("name", { ascending: true })
    .limit(PAGE_LIMIT);
  if (q) query = query.or(`name.ilike.%${q}%,suburb.ilike.%${q}%,town.ilike.%${q}%`);
  const { data: schools, count, error } = await query;

  if (error) {
    return <p className="text-red-600">Failed to load schools: {error.message}</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <form className="flex flex-1 gap-2" role="search">
          <input
            name="q"
            defaultValue={searchParams.q ?? ""}
            placeholder="Search by name, suburb or town"
            className="h-10 w-full max-w-sm rounded-lg border border-navy/15 bg-white px-3 text-sm"
          />
          <button className="h-10 rounded-lg bg-navy px-4 text-sm font-medium text-cream">Search</button>
        </form>
        <form action={refreshPublicData}>
          <button
            className="h-10 rounded-lg border border-navy/15 px-4 text-sm font-medium text-navy hover:bg-navy/5"
            title="Clear cached pages and search results, e.g. after running npm run seed"
          >
            Refresh site data
          </button>
        </form>
      </div>
      <p className="text-sm text-navy/60">
        Showing {schools?.length ?? 0} of {formatNumber(count ?? 0)} schools
        {q ? ` matching “${q}”` : ""}. Featured first, then A–Z.
      </p>
      <div className="overflow-hidden rounded-xl border border-navy/10 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-cream/50 text-left text-xs uppercase tracking-wide text-navy/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Province</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(schools ?? []).map((s: any) => (
              <tr key={s.id} className="border-t border-navy/5">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/${s.slug}`}
                    className="font-medium text-navy hover:underline"
                  >
                    {s.name}
                  </Link>
                  <div className="text-xs text-navy/50">{s.suburb}</div>
                </td>
                <td className="px-4 py-3">
                  <Badge className={SCHOOL_TYPE_BADGE_CLASSES[s.type as keyof typeof SCHOOL_TYPE_BADGE_CLASSES]}>
                    {SCHOOL_TYPE_LABELS[s.type as keyof typeof SCHOOL_TYPE_LABELS]}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-navy/70">{s.province}</td>
                <td className="px-4 py-3">
                  {s.is_featured ? (
                    <Badge className="bg-amber/20 text-amber-700">Yes</Badge>
                  ) : (
                    <span className="text-navy/40">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/${s.slug}`}
                    className="text-navy hover:underline"
                  >
                    Edit →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!schools || schools.length === 0) && (
          <p className="p-6 text-center text-navy/60">
            {q ? "No schools match that search." : (
              <>No schools yet. Run <code>npm run seed</code> or add one via <em>New school</em>.</>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
