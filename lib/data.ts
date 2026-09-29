import { cache } from "react";
import { unstable_cache } from "next/cache";
import { PROVINCES } from "./types";
import type {
  Deadline,
  OpenDay,
  School,
  SchoolLevel,
  SchoolType,
  SchoolWithRelations,
} from "./types";
import { hasSupabaseEnv } from "./supabase/server";
import { getSupabasePublicClient } from "./supabase/public";
import { gradeNumber, sanitiseLike } from "./utils";
import seedSchoolsJson from "@/data/seed-schools.json";
import { DIRECTORY_LOADERS } from "@/data/schools";

// ─── Caching ───────────────────────────────────────────────────────────────
// Public school data changes rarely (admin edits, monthly imports), so every
// read is cached across requests for an hour and tagged so admin actions can
// purge it instantly with `revalidateTag(SCHOOLS_CACHE_TAG)`.

export const SCHOOLS_CACHE_TAG = "schools";
const CACHE_SECONDS = 3600;

function cached<T extends (...args: any[]) => Promise<unknown>>(key: string, fn: T): T {
  return cache(
    unstable_cache(fn, [key], { tags: [SCHOOLS_CACHE_TAG], revalidate: CACHE_SECONDS }),
  ) as T;
}

// ─── Fallback / mock source ────────────────────────────────────────────────
// When NEXT_PUBLIC_SUPABASE_URL is not set, we serve from the bundled JSON
// (curated seed + imported province directories) so the site still renders.
// These are the same files `npm run seed` inserts into Supabase.

interface SeedSchool extends Omit<School, "created_at"> {
  deadlines: Omit<Deadline, "id" | "school_id">[];
  open_days: Omit<OpenDay, "id" | "school_id">[];
  created_at?: string;
}

type DirectorySchool = Partial<School> & Pick<School, "slug" | "name" | "type" | "province">;

function toSchool(s: DirectorySchool, id: string): School {
  return {
    id,
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
    created_at: s.created_at ?? "2026-01-01T00:00:00.000Z",
    emis_number: s.emis_number ?? null,
    phase: s.phase ?? null,
    special_needs: Boolean(s.special_needs),
    no_fee_school: s.no_fee_school ?? null,
    quintile: s.quintile ?? null,
    learner_count: s.learner_count ?? null,
    educator_count: s.educator_count ?? null,
    town: s.town ?? null,
    district: s.district ?? null,
    phone: s.phone ?? null,
    urban_rural: s.urban_rural ?? null,
    data_source: s.data_source ?? null,
    grade_min: gradeNumber(s.grades_from),
    grade_max: gradeNumber(s.grades_to),
  };
}

let fallbackPromise: Promise<SchoolWithRelations[]> | null = null;

function fallbackSchools(): Promise<SchoolWithRelations[]> {
  fallbackPromise ??= (async () => {
    const curated = (seedSchoolsJson as unknown as SeedSchool[]).map((s, i) => {
      const id = s.id ?? `seed-${i}`;
      return {
        ...toSchool(s, id),
        deadlines: s.deadlines.map((d, j) => ({
          id: `seed-d-${i}-${j}`,
          school_id: id,
          grade_group: d.grade_group ?? null,
          open_date: d.open_date ?? null,
          close_date: d.close_date ?? null,
          application_fee: d.application_fee ?? null,
          application_url: d.application_url ?? null,
          notes: d.notes ?? null,
        })),
        open_days: s.open_days.map((o, j) => ({
          id: `seed-o-${i}-${j}`,
          school_id: id,
          event_date: o.event_date,
          start_time: o.start_time ?? null,
          end_time: o.end_time ?? null,
          location: o.location ?? null,
          is_virtual: Boolean(o.is_virtual),
          rsvp_url: o.rsvp_url ?? null,
        })),
      };
    });

    const bySlug = new Map(curated.map((s) => [s.slug, s]));
    const all: SchoolWithRelations[] = [...curated];
    const files = await Promise.all(DIRECTORY_LOADERS.map((load) => load()));
    for (const file of files) {
      for (const d of file.default as DirectorySchool[]) {
        const existing = bySlug.get(d.slug);
        if (existing) {
          // Curated school: keep curated content, add the official fields.
          Object.assign(existing, {
            emis_number: d.emis_number ?? null,
            phase: d.phase ?? null,
            special_needs: Boolean(d.special_needs),
            no_fee_school: d.no_fee_school ?? null,
            quintile: d.quintile ?? null,
            learner_count: d.learner_count ?? null,
            educator_count: d.educator_count ?? null,
            town: d.town ?? null,
            district: d.district ?? null,
            phone: d.phone ?? null,
            urban_rural: d.urban_rural ?? null,
            data_source: d.data_source ?? null,
          });
          continue;
        }
        const school = { ...toSchool(d, `emis-${d.emis_number}`), deadlines: [], open_days: [] };
        bySlug.set(school.slug, school);
        all.push(school);
      }
    }
    return all;
  })();
  return fallbackPromise;
}

// ─── Query shape ────────────────────────────────────────────────────────────

export interface SchoolFilters {
  q?: string;
  province?: string;
  type?: SchoolType;
  level?: SchoolLevel;
  feeMin?: number;
  feeMax?: number;
  grade?: string;
  sort?: "relevance" | "fee_asc" | "fee_desc" | "alpha" | "distance";
  page?: number;
  pageSize?: number;
}

export interface SchoolListResult {
  rows: School[];
  total: number;
  page: number;
  pageSize: number;
}

// Level → grade span a school must cover.
const LEVEL_GRADES: Record<Exclude<SchoolLevel, "special_needs">, [number, number]> = {
  primary: [1, 7],
  high: [8, 12],
};

// Columns needed for result cards — keeps search payloads small.
const LIST_COLUMNS =
  "id,name,slug,type,province,suburb,town,latitude,longitude,website_url,logo_url,grades_from,grades_to,fee_monthly_min,fee_monthly_max,is_featured,phase,special_needs,no_fee_school,created_at,address,description,language,boarding,curriculum,extracurriculars";

// ─── Fetchers ───────────────────────────────────────────────────────────────

export const listSchools = cached(
  "listSchools",
  async (filters: SchoolFilters = {}): Promise<SchoolListResult> => {
    const pageSize = filters.pageSize ?? 20;
    const page = Math.max(1, filters.page ?? 1);
    const grade = gradeNumber(filters.grade);
    const span = filters.level && filters.level !== "special_needs" ? LEVEL_GRADES[filters.level] : null;

    if (hasSupabaseEnv()) {
      const supabase = getSupabasePublicClient();
      let query = supabase.from("schools").select(LIST_COLUMNS, { count: "exact" });
      if (filters.q) {
        const q = sanitiseLike(filters.q);
        if (q) {
          query = query.or(
            `name.ilike.%${q}%,suburb.ilike.%${q}%,town.ilike.%${q}%,address.ilike.%${q}%`,
          );
        }
      }
      if (filters.province) query = query.eq("province", filters.province);
      if (filters.type) query = query.eq("type", filters.type);
      if (filters.feeMin != null) query = query.gte("fee_monthly_min", filters.feeMin);
      if (filters.feeMax != null) query = query.lte("fee_monthly_max", filters.feeMax);
      if (grade != null) query = query.lte("grade_min", grade).gte("grade_max", grade);
      if (span) query = query.lte("grade_min", span[0]).gte("grade_max", span[1]);
      if (filters.level === "special_needs") query = query.eq("special_needs", true);

      if (filters.sort === "fee_asc") query = query.order("fee_monthly_min", { ascending: true, nullsFirst: false });
      else if (filters.sort === "fee_desc") query = query.order("fee_monthly_max", { ascending: false, nullsFirst: false });
      else if (filters.sort === "alpha") query = query.order("name", { ascending: true });
      else query = query.order("is_featured", { ascending: false }).order("name", { ascending: true });

      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data, count, error } = await query;
      if (error) throw new Error(error.message);
      return { rows: (data ?? []) as unknown as School[], total: count ?? 0, page, pageSize };
    }

    // Fallback — in-memory filter over bundled data
    let rows: School[] = (await fallbackSchools()).map(({ deadlines, open_days, ...s }) => s);
    const q = filters.q?.toLowerCase();
    if (q) {
      rows = rows.filter((s) =>
        [s.name, s.suburb, s.town, s.address].some((f) => (f ?? "").toLowerCase().includes(q)),
      );
    }
    if (filters.province) rows = rows.filter((s) => s.province === filters.province);
    if (filters.type) rows = rows.filter((s) => s.type === filters.type);
    if (filters.feeMin != null) rows = rows.filter((s) => s.fee_monthly_min != null && s.fee_monthly_min >= filters.feeMin!);
    if (filters.feeMax != null) rows = rows.filter((s) => s.fee_monthly_max != null && s.fee_monthly_max <= filters.feeMax!);
    const covers = (s: School, lo: number, hi: number) =>
      s.grade_min != null && s.grade_max != null && s.grade_min <= lo && s.grade_max >= hi;
    if (grade != null) rows = rows.filter((s) => covers(s, grade, grade));
    if (span) rows = rows.filter((s) => covers(s, span[0], span[1]));
    if (filters.level === "special_needs") rows = rows.filter((s) => s.special_needs);

    const nullsLast = (v: number | null, fallback: number) => (v == null ? fallback : v);
    if (filters.sort === "fee_asc") rows.sort((a, b) => nullsLast(a.fee_monthly_min, Infinity) - nullsLast(b.fee_monthly_min, Infinity));
    else if (filters.sort === "fee_desc") rows.sort((a, b) => nullsLast(b.fee_monthly_max, -Infinity) - nullsLast(a.fee_monthly_max, -Infinity));
    else if (filters.sort === "alpha") rows.sort((a, b) => a.name.localeCompare(b.name));
    else rows.sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.name.localeCompare(b.name));

    const total = rows.length;
    const from = (page - 1) * pageSize;
    return { rows: rows.slice(from, from + pageSize), total, page, pageSize };
  },
);

export const getSchoolBySlug = cached(
  "getSchoolBySlug",
  async (slug: string): Promise<SchoolWithRelations | null> => {
    if (hasSupabaseEnv()) {
      const supabase = getSupabasePublicClient();
      const { data: school, error } = await supabase
        .from("schools")
        .select("*, deadlines(*), open_days(*)")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw new Error(error.message);
      if (!school) return null;
      const today = new Date().toISOString().slice(0, 10);
      return {
        ...(school as SchoolWithRelations),
        deadlines: (school.deadlines ?? []) as Deadline[],
        open_days: ((school.open_days ?? []) as OpenDay[])
          .filter((o) => o.event_date >= today)
          .sort((a, b) => a.event_date.localeCompare(b.event_date)),
      };
    }
    return (await fallbackSchools()).find((s) => s.slug === slug) ?? null;
  },
);

export const getFeaturedSchools = cached(
  "getFeaturedSchools",
  async (limit = 6): Promise<School[]> => {
    if (hasSupabaseEnv()) {
      const supabase = getSupabasePublicClient();
      const { data } = await supabase
        .from("schools")
        .select(LIST_COLUMNS)
        .eq("is_featured", true)
        .limit(limit);
      return (data ?? []) as unknown as School[];
    }
    return (await fallbackSchools()).filter((s) => s.is_featured).slice(0, limit);
  },
);

export const getAllSlugs = cached(
  "getAllSlugs",
  async (type?: SchoolType | "non-university", limit = 1000): Promise<string[]> => {
    if (hasSupabaseEnv()) {
      const supabase = getSupabasePublicClient();
      // Featured and curated (described) schools first — the pages people land on most.
      let q = supabase
        .from("schools")
        .select("slug")
        .order("is_featured", { ascending: false })
        .order("description", { ascending: true, nullsFirst: false })
        .limit(limit);
      if (type === "university") q = q.eq("type", "university");
      else if (type === "non-university") q = q.neq("type", "university");
      const { data } = await q;
      return (data ?? []).map((r: { slug: string }) => r.slug);
    }
    const all = await fallbackSchools();
    const match = all.filter((s) =>
      type === "university" ? s.type === "university" : type === "non-university" ? s.type !== "university" : true,
    );
    return match.slice(0, limit).map((s) => s.slug);
  },
);

export const getSchoolsByIds = cached(
  "getSchoolsByIds",
  async (ids: string[]): Promise<SchoolWithRelations[]> => {
    if (!ids.length) return [];
    if (hasSupabaseEnv()) {
      const supabase = getSupabasePublicClient();
      const { data } = await supabase
        .from("schools")
        .select("*, deadlines(*), open_days(*)")
        .in("id", ids);
      return (data ?? []) as SchoolWithRelations[];
    }
    const all = await fallbackSchools();
    return all.filter((s) => ids.includes(s.id));
  },
);

export const getStats = cached(
  "getStats",
  async (): Promise<{ schoolCount: number; provinceCount: number }> => {
    if (hasSupabaseEnv()) {
      const supabase = getSupabasePublicClient();
      const [{ count }, ...perProvince] = await Promise.all([
        supabase.from("schools").select("id", { count: "exact", head: true }),
        ...PROVINCES.map((p) =>
          supabase.from("schools").select("id", { count: "exact", head: true }).eq("province", p),
        ),
      ]);
      const provinceCount = perProvince.filter((r) => (r.count ?? 0) > 0).length;
      return { schoolCount: count ?? 0, provinceCount: provinceCount || 9 };
    }
    const all = await fallbackSchools();
    const unique = new Set(all.map((s) => s.province));
    return { schoolCount: all.length, provinceCount: unique.size || 9 };
  },
);
