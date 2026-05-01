import { cache } from "react";
import type { Deadline, OpenDay, School, SchoolType, SchoolWithRelations } from "./types";
import { hasSupabaseEnv, getSupabaseServerClient } from "./supabase/server";
import { sanitiseLike } from "./utils";
import seedSchoolsJson from "@/data/seed-schools.json";

// ─── Fallback / mock source ────────────────────────────────────────────────
// When NEXT_PUBLIC_SUPABASE_URL is not set, we serve from the bundled JSON
// so the site still renders. The JSON is also what `npm run seed` inserts
// into Supabase, so the UI looks identical either way.

interface SeedSchool extends Omit<School, "created_at"> {
  deadlines: Omit<Deadline, "id" | "school_id">[];
  open_days: Omit<OpenDay, "id" | "school_id">[];
  created_at?: string;
}

function seedSchools(): SchoolWithRelations[] {
  const raw = seedSchoolsJson as unknown as SeedSchool[];
  return raw.map((s, i) => ({
    id: s.id ?? `seed-${i}`,
    name: s.name,
    slug: s.slug,
    type: s.type,
    province: s.province,
    suburb: s.suburb ?? null,
    address: s.address ?? null,
    latitude: s.latitude ?? null,
    longitude: s.longitude ?? null,
    website_url: s.website_url ?? null,
    logo_url: s.logo_url ?? null,
    description: s.description ?? null,
    grades_from: s.grades_from ?? null,
    grades_to: s.grades_to ?? null,
    fee_monthly_min: s.fee_monthly_min ?? null,
    fee_monthly_max: s.fee_monthly_max ?? null,
    language: s.language ?? null,
    boarding: Boolean(s.boarding),
    curriculum: s.curriculum ?? null,
    extracurriculars: s.extracurriculars ?? null,
    is_featured: Boolean(s.is_featured),
    created_at: s.created_at ?? new Date().toISOString(),
    deadlines: s.deadlines.map((d, j) => ({
      id: `seed-d-${i}-${j}`,
      school_id: s.id ?? `seed-${i}`,
      grade_group: d.grade_group ?? null,
      open_date: d.open_date ?? null,
      close_date: d.close_date ?? null,
      application_fee: d.application_fee ?? null,
      application_url: d.application_url ?? null,
      notes: d.notes ?? null,
    })),
    open_days: s.open_days.map((o, j) => ({
      id: `seed-o-${i}-${j}`,
      school_id: s.id ?? `seed-${i}`,
      event_date: o.event_date,
      start_time: o.start_time ?? null,
      end_time: o.end_time ?? null,
      location: o.location ?? null,
      is_virtual: Boolean(o.is_virtual),
      rsvp_url: o.rsvp_url ?? null,
    })),
  }));
}

// ─── Query shape ────────────────────────────────────────────────────────────

export interface SchoolFilters {
  q?: string;
  province?: string;
  type?: SchoolType;
  feeMin?: number;
  feeMax?: number;
  grade?: string;
  sort?: "relevance" | "fee_asc" | "fee_desc" | "alpha" | "distance";
  page?: number;
  pageSize?: number;
  userLat?: number;
  userLng?: number;
}

export interface SchoolListResult {
  rows: School[];
  total: number;
  page: number;
  pageSize: number;
}

// ─── Fetchers ───────────────────────────────────────────────────────────────

export const listSchools = cache(async (filters: SchoolFilters = {}): Promise<SchoolListResult> => {
  const pageSize = filters.pageSize ?? 20;
  const page = Math.max(1, filters.page ?? 1);

  if (hasSupabaseEnv()) {
    const supabase = getSupabaseServerClient();
    let query = supabase.from("schools").select("*", { count: "exact" });
    if (filters.q) {
      const q = sanitiseLike(filters.q);
      if (q) {
        query = query.or(
          `name.ilike.%${q}%,suburb.ilike.%${q}%,address.ilike.%${q}%`,
        );
      }
    }
    if (filters.province) query = query.eq("province", filters.province);
    if (filters.type) query = query.eq("type", filters.type);
    if (filters.feeMin != null) query = query.gte("fee_monthly_min", filters.feeMin);
    if (filters.feeMax != null) query = query.lte("fee_monthly_max", filters.feeMax);

    if (filters.sort === "fee_asc") query = query.order("fee_monthly_min", { ascending: true, nullsFirst: false });
    else if (filters.sort === "fee_desc") query = query.order("fee_monthly_max", { ascending: false, nullsFirst: false });
    else if (filters.sort === "alpha") query = query.order("name", { ascending: true });
    else query = query.order("is_featured", { ascending: false }).order("name", { ascending: true });

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) throw new Error(error.message);
    return { rows: (data ?? []) as School[], total: count ?? 0, page, pageSize };
  }

  // Fallback — in-memory filter over seed data
  let rows = seedSchools() as unknown as School[];
  const q = filters.q?.toLowerCase();
  if (q) {
    rows = rows.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.suburb ?? "").toLowerCase().includes(q) ||
        (s.address ?? "").toLowerCase().includes(q),
    );
  }
  if (filters.province) rows = rows.filter((s) => s.province === filters.province);
  if (filters.type) rows = rows.filter((s) => s.type === filters.type);
  if (filters.feeMin != null) rows = rows.filter((s) => (s.fee_monthly_min ?? 0) >= filters.feeMin!);
  if (filters.feeMax != null) rows = rows.filter((s) => (s.fee_monthly_max ?? 9e9) <= filters.feeMax!);
  if (filters.sort === "fee_asc") rows = rows.sort((a, b) => (a.fee_monthly_min ?? 0) - (b.fee_monthly_min ?? 0));
  else if (filters.sort === "fee_desc") rows = rows.sort((a, b) => (b.fee_monthly_max ?? 0) - (a.fee_monthly_max ?? 0));
  else if (filters.sort === "alpha") rows = rows.sort((a, b) => a.name.localeCompare(b.name));
  else rows = rows.sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.name.localeCompare(b.name));

  const total = rows.length;
  const from = (page - 1) * pageSize;
  rows = rows.slice(from, from + pageSize);
  return { rows, total, page, pageSize };
});

export const getSchoolBySlug = cache(async (slug: string): Promise<SchoolWithRelations | null> => {
  if (hasSupabaseEnv()) {
    const supabase = getSupabaseServerClient();
    const { data: school, error } = await supabase
      .from("schools")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!school) return null;
    const [{ data: deadlines }, { data: openDays }] = await Promise.all([
      supabase.from("deadlines").select("*").eq("school_id", school.id),
      supabase
        .from("open_days")
        .select("*")
        .eq("school_id", school.id)
        .gte("event_date", new Date().toISOString().slice(0, 10))
        .order("event_date", { ascending: true }),
    ]);
    return {
      ...(school as School),
      deadlines: (deadlines ?? []) as Deadline[],
      open_days: (openDays ?? []) as OpenDay[],
    };
  }
  const all = seedSchools();
  return all.find((s) => s.slug === slug) ?? null;
});

export const getFeaturedSchools = cache(async (limit = 6): Promise<School[]> => {
  if (hasSupabaseEnv()) {
    const supabase = getSupabaseServerClient();
    const { data } = await supabase
      .from("schools")
      .select("*")
      .eq("is_featured", true)
      .limit(limit);
    return (data ?? []) as School[];
  }
  return seedSchools()
    .filter((s) => s.is_featured)
    .slice(0, limit) as School[];
});

export const getAllSlugs = cache(async (type?: SchoolType | "non-university"): Promise<string[]> => {
  if (hasSupabaseEnv()) {
    const supabase = getSupabaseServerClient();
    let q = supabase.from("schools").select("slug, type");
    if (type === "university") q = q.eq("type", "university");
    else if (type === "non-university") q = q.neq("type", "university");
    const { data } = await q;
    return (data ?? []).map((r: any) => r.slug as string);
  }
  const all = seedSchools();
  if (type === "university") return all.filter((s) => s.type === "university").map((s) => s.slug);
  if (type === "non-university") return all.filter((s) => s.type !== "university").map((s) => s.slug);
  return all.map((s) => s.slug);
});

export const getSchoolsByIds = cache(async (ids: string[]): Promise<SchoolWithRelations[]> => {
  if (!ids.length) return [];
  if (hasSupabaseEnv()) {
    const supabase = getSupabaseServerClient();
    const { data: schools } = await supabase.from("schools").select("*").in("id", ids);
    if (!schools?.length) return [];
    const [{ data: deadlines }, { data: openDays }] = await Promise.all([
      supabase.from("deadlines").select("*").in("school_id", ids),
      supabase.from("open_days").select("*").in("school_id", ids),
    ]);
    return schools.map((s: any) => ({
      ...(s as School),
      deadlines: (deadlines ?? []).filter((d: any) => d.school_id === s.id) as Deadline[],
      open_days: (openDays ?? []).filter((o: any) => o.school_id === s.id) as OpenDay[],
    }));
  }
  const all = seedSchools();
  return all.filter((s) => ids.includes(s.id));
});

export async function getStats(): Promise<{
  schoolCount: number;
  provinceCount: number;
}> {
  if (hasSupabaseEnv()) {
    const supabase = getSupabaseServerClient();
    const [{ count }, { data: provinceRows }] = await Promise.all([
      supabase.from("schools").select("id", { count: "exact", head: true }),
      supabase.from("schools").select("province"),
    ]);
    const unique = new Set((provinceRows ?? []).map((r: any) => r.province));
    return { schoolCount: count ?? 0, provinceCount: unique.size || 9 };
  }
  const all = seedSchools();
  const unique = new Set(all.map((s) => s.province));
  return { schoolCount: all.length, provinceCount: unique.size || 9 };
}
