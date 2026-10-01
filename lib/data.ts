import { cache } from "react";
import { unstable_cache } from "next/cache";
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
import { distanceKm, gradeNumber, normaliseSearch, sanitiseLike, searchWords } from "./utils";
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
  /** Suburb or town, e.g. "Rondebosch" (used by "Browse by area"). Unlike `q`, it ignores school names. */
  area?: string;
  province?: string;
  /** Omitted → every school type except universities. */
  type?: SchoolType;
  level?: SchoolLevel;
  noFee?: boolean;
  feeMin?: number;
  feeMax?: number;
  grade?: string;
  /** Centre point for "near me" searches. */
  near?: { lat: number; lng: number };
  radiusKm?: number;
  sort?: "relevance" | "fee_asc" | "fee_desc" | "alpha" | "distance";
  page?: number;
  pageSize?: number;
}

export const DEFAULT_RADIUS_KM = 10;
// PostgREST returns at most 1 000 rows per request; a 10–25 km radius around
// any point in South Africa stays well inside that.
const NEAR_CANDIDATE_LIMIT = 1000;

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
  "id,name,slug,type,province,suburb,town,address,latitude,longitude,website_url,logo_url,grades_from,grades_to,fee_monthly_min,fee_monthly_max,is_featured,phase,special_needs,no_fee_school,learner_count,language,boarding,curriculum,created_at";

function boundingBox(lat: number, lng: number, km: number) {
  const dLat = km / 111;
  const dLng = km / (111 * Math.cos((lat * Math.PI) / 180));
  return { minLat: lat - dLat, maxLat: lat + dLat, minLng: lng - dLng, maxLng: lng + dLng };
}

type Sort = NonNullable<SchoolFilters["sort"]>;

function sortRows(rows: School[], sort: Sort) {
  const nullsLast = (v: number | null | undefined, fallback: number) => (v == null ? fallback : v);
  if (sort === "distance") rows.sort((a, b) => nullsLast(a.distance_km, Infinity) - nullsLast(b.distance_km, Infinity));
  else if (sort === "fee_asc") rows.sort((a, b) => nullsLast(a.fee_monthly_min, Infinity) - nullsLast(b.fee_monthly_min, Infinity));
  else if (sort === "fee_desc") rows.sort((a, b) => nullsLast(b.fee_monthly_max, -Infinity) - nullsLast(a.fee_monthly_max, -Infinity));
  else if (sort === "alpha") rows.sort((a, b) => a.name.localeCompare(b.name));
  else rows.sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.name.localeCompare(b.name));
}

// ─── Fetchers ───────────────────────────────────────────────────────────────

export const listSchools = cached(
  "listSchools",
  async (filters: SchoolFilters = {}): Promise<SchoolListResult> => {
    const pageSize = filters.pageSize ?? 20;
    const page = Math.max(1, filters.page ?? 1);
    const grade = gradeNumber(filters.grade);
    const span = filters.level && filters.level !== "special_needs" ? LEVEL_GRADES[filters.level] : null;
    const near = filters.near;
    const radius = filters.radiusKm ?? DEFAULT_RADIUS_KM;
    const box = near ? boundingBox(near.lat, near.lng, radius) : null;
    // "Distance" only means something with a centre point; otherwise fall back.
    const sort: Sort = filters.sort === "distance" && !near ? "relevance" : (filters.sort ?? (near ? "distance" : "relevance"));

    let rows: School[];
    let total: number;

    if (hasSupabaseEnv()) {
      const supabase = getSupabasePublicClient();
      let query = supabase.from("schools").select(LIST_COLUMNS, { count: "exact" });

      // Every word must appear somewhere in the school's name or location.
      for (const w of filters.q ? searchWords(filters.q) : []) query = query.ilike("search_text", `%${w}%`);
      const area = filters.area ? sanitiseLike(filters.area) : "";
      if (area) query = query.or(`suburb.ilike.%${area}%,town.ilike.%${area}%,address.ilike.%${area}%`);

      if (filters.province) query = query.eq("province", filters.province);
      query = filters.type ? query.eq("type", filters.type) : query.neq("type", "university");
      if (filters.noFee) query = query.eq("no_fee_school", true);
      if (filters.feeMin != null) query = query.gte("fee_monthly_min", filters.feeMin);
      if (filters.feeMax != null) query = query.lte("fee_monthly_max", filters.feeMax);
      if (grade != null) query = query.lte("grade_min", grade).gte("grade_max", grade);
      if (span) query = query.lte("grade_min", span[0]).gte("grade_max", span[1]);
      if (filters.level === "special_needs") query = query.eq("special_needs", true);

      if (box && near) {
        // Fetch everything inside the bounding box, then rank by true distance.
        query = query
          .gte("latitude", box.minLat)
          .lte("latitude", box.maxLat)
          .gte("longitude", box.minLng)
          .lte("longitude", box.maxLng)
          .limit(NEAR_CANDIDATE_LIMIT);
        const { data, error } = await query;
        if (error) throw new Error(error.message);
        rows = ((data ?? []) as unknown as School[])
          .map((s) => ({ ...s, distance_km: distanceKm(near.lat, near.lng, s.latitude!, s.longitude!) }))
          .filter((s) => s.distance_km <= radius);
        sortRows(rows, sort);
        total = rows.length;
        const from = (page - 1) * pageSize;
        return { rows: rows.slice(from, from + pageSize), total, page, pageSize };
      }

      if (sort === "fee_asc") query = query.order("fee_monthly_min", { ascending: true, nullsFirst: false });
      else if (sort === "fee_desc") query = query.order("fee_monthly_max", { ascending: false, nullsFirst: false });
      else if (sort === "alpha") query = query.order("name", { ascending: true });
      else query = query.order("is_featured", { ascending: false }).order("name", { ascending: true });

      const from = (page - 1) * pageSize;
      query = query.range(from, from + pageSize - 1);

      const { data, count, error } = await query;
      if (error) throw new Error(error.message);
      return { rows: (data ?? []) as unknown as School[], total: count ?? 0, page, pageSize };
    }

    // Fallback — in-memory filter over bundled data
    rows = (await fallbackSchools()).map(({ deadlines, open_days, ...s }) => s);
    const words = filters.q ? searchWords(filters.q) : [];
    if (words.length) {
      rows = rows.filter((s) => {
        const text = normaliseSearch([s.name, s.suburb, s.town, s.address].filter(Boolean).join(" "));
        return words.every((w) => text.includes(w));
      });
    }
    const area = filters.area?.toLowerCase();
    if (area) {
      rows = rows.filter((s) =>
        [s.suburb, s.town, s.address].some((f) => (f ?? "").toLowerCase().includes(area)),
      );
    }
    if (filters.province) rows = rows.filter((s) => s.province === filters.province);
    rows = rows.filter((s) => (filters.type ? s.type === filters.type : s.type !== "university"));
    if (filters.noFee) rows = rows.filter((s) => s.no_fee_school === true);
    if (filters.feeMin != null) rows = rows.filter((s) => s.fee_monthly_min != null && s.fee_monthly_min >= filters.feeMin!);
    if (filters.feeMax != null) rows = rows.filter((s) => s.fee_monthly_max != null && s.fee_monthly_max <= filters.feeMax!);
    const covers = (s: School, lo: number, hi: number) =>
      s.grade_min != null && s.grade_max != null && s.grade_min <= lo && s.grade_max >= hi;
    if (grade != null) rows = rows.filter((s) => covers(s, grade, grade));
    if (span) rows = rows.filter((s) => covers(s, span[0], span[1]));
    if (filters.level === "special_needs") rows = rows.filter((s) => s.special_needs);
    if (near) {
      rows = rows
        .filter((s) => s.latitude != null && s.longitude != null)
        .map((s) => ({ ...s, distance_km: distanceKm(near.lat, near.lng, s.latitude!, s.longitude!) }))
        .filter((s) => s.distance_km! <= radius);
    }

    sortRows(rows, sort);
    total = rows.length;
    const from = (page - 1) * pageSize;
    return { rows: rows.slice(from, from + pageSize), total, page, pageSize };
  },
);

/** Closest schools to a given school (excluding itself), for "Nearby schools". */
export async function getNearbySchools(school: School, limit = 6): Promise<School[]> {
  if (school.latitude == null || school.longitude == null) return [];
  const { rows } = await listSchools({
    near: { lat: round(school.latitude, 3), lng: round(school.longitude, 3) },
    radiusKm: 5,
    sort: "distance",
    pageSize: limit + 1,
  });
  return rows
    .filter((s) => s.id !== school.id)
    .slice(0, limit)
    .map((s) => ({ ...s, distance_km: distanceKm(school.latitude!, school.longitude!, s.latitude!, s.longitude!) }));
}

function round(n: number, dp: number) {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

/** How many schools each area has — shown on the home page's "Browse by area". */
export const getAreaCounts = cached(
  "getAreaCounts",
  async (areas: string[]): Promise<Record<string, number>> => {
    const counts = await Promise.all(
      areas.map(async (area) => {
        const { total } = await listSchools({ area, pageSize: 1 });
        return [area, total] as const;
      }),
    );
    return Object.fromEntries(counts);
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

/** Headline numbers for the home page. */
export const getStats = cached(
  "getStats",
  async (): Promise<{ schools: number; primary: number; high: number; specialNeeds: number; noFee: number }> => {
    const [all, primary, high, specialNeeds, noFee] = await Promise.all([
      listSchools({ pageSize: 1 }),
      listSchools({ level: "primary", pageSize: 1 }),
      listSchools({ level: "high", pageSize: 1 }),
      listSchools({ level: "special_needs", pageSize: 1 }),
      listSchools({ noFee: true, pageSize: 1 }),
    ]);
    return {
      schools: all.total,
      primary: primary.total,
      high: high.total,
      specialNeeds: specialNeeds.total,
      noFee: noFee.total,
    };
  },
);

/** Every school page, for sitemap.xml. Pages through PostgREST's 1 000-row cap. */
export const getSitemapSchools = cached(
  "getSitemapSchools",
  async (): Promise<{ slug: string; type: SchoolType }[]> => {
    if (hasSupabaseEnv()) {
      const supabase = getSupabasePublicClient();
      const out: { slug: string; type: SchoolType }[] = [];
      for (let from = 0; from < 100_000; from += 1000) {
        const { data, error } = await supabase
          .from("schools")
          .select("slug, type")
          .order("slug")
          .range(from, from + 999);
        if (error) throw new Error(error.message);
        out.push(...((data ?? []) as { slug: string; type: SchoolType }[]));
        if (!data || data.length < 1000) break;
      }
      return out;
    }
    return (await fallbackSchools()).map((s) => ({ slug: s.slug, type: s.type }));
  },
);
