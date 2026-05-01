import Link from "next/link";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/server";
import { SCHOOL_TYPE_BADGE_CLASSES, SCHOOL_TYPE_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export default async function AdminSchoolsPage() {
  if (!hasSupabaseEnv()) {
    return (
      <div className="rounded-xl border border-amber/40 bg-amber/10 p-6 text-navy">
        <p className="font-serif text-lg font-semibold">Supabase not configured</p>
        <p className="mt-1 text-sm">
          Set <code className="rounded bg-white px-1">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
          <code className="rounded bg-white px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> and{" "}
          <code className="rounded bg-white px-1">SUPABASE_SERVICE_ROLE_KEY</code> in{" "}
          <code>.env.local</code>, run the migration in{" "}
          <code>supabase/migrations/0001_init.sql</code>, then{" "}
          <code>npm run seed</code>.
        </p>
      </div>
    );
  }

  const supabase = getSupabaseAdminClient();
  const { data: schools, error } = await supabase
    .from("schools")
    .select("id, slug, name, type, province, suburb, is_featured")
    .order("name", { ascending: true });

  if (error) {
    return <p className="text-red-600">Failed to load schools: {error.message}</p>;
  }

  return (
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
          No schools yet. Run <code>npm run seed</code> or add one via <em>New school</em>.
        </p>
      )}
    </div>
  );
}
