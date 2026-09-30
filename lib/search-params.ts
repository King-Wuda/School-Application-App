import type { SchoolFilters } from "./data";
import { PROVINCES, type SchoolLevel, type SchoolType } from "./types";

/** Everything the search page understands, parsed from the URL. */
export interface SearchState extends SchoolFilters {
  sort: NonNullable<SchoolFilters["sort"]>;
  page: number;
}

type RawParams = { [key: string]: string | string[] | undefined };

export const LEVEL_OPTIONS: { value: SchoolLevel; label: string }[] = [
  { value: "primary", label: "Primary" },
  { value: "high", label: "High school" },
  { value: "special_needs", label: "Special needs" },
];

export const TYPE_OPTIONS: { value: SchoolType; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "model_c", label: "Model C" },
  { value: "private", label: "Independent" },
];

export const GRADE_OPTIONS = ["Grade R", ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)];

export const FEE_MAX_OPTIONS = [1000, 2500, 5000, 10000, 20000];

export const RADIUS_OPTIONS = [2, 5, 10, 25];

export const SORT_OPTIONS: { value: SearchState["sort"]; label: string; needsLocation?: boolean }[] = [
  { value: "relevance", label: "Recommended" },
  { value: "distance", label: "Nearest first", needsLocation: true },
  { value: "alpha", label: "Name A–Z" },
  { value: "fee_asc", label: "Fees: low to high" },
  { value: "fee_desc", label: "Fees: high to low" },
];

function one(sp: RawParams, key: string): string | undefined {
  const v = sp[key];
  const s = Array.isArray(v) ? v[0] : v;
  return s?.trim() || undefined;
}

function num(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export function parseSearchParams(sp: RawParams): SearchState {
  const level = one(sp, "level");
  const type = one(sp, "type");
  const sort = one(sp, "sort");
  const province = one(sp, "province");
  const [lat, lng] = (one(sp, "near") ?? "").split(",").map(Number);
  const near =
    Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && (lat !== 0 || lng !== 0)
      ? { lat: Math.round(lat * 1000) / 1000, lng: Math.round(lng * 1000) / 1000 }
      : undefined;
  const radius = num(one(sp, "radius"));
  const grade = one(sp, "grade");

  return {
    q: one(sp, "q")?.slice(0, 80),
    area: one(sp, "area")?.slice(0, 60),
    province: PROVINCES.find((p) => p === province),
    type: (["public", "model_c", "private", "university"] as const).find((t) => t === type),
    level: LEVEL_OPTIONS.find((l) => l.value === level)?.value,
    grade: GRADE_OPTIONS.find((g) => g === grade),
    noFee: one(sp, "fees") === "none",
    feeMin: num(one(sp, "fee_min")),
    feeMax: num(one(sp, "fee_max")),
    near,
    radiusKm: near ? Math.min(50, Math.max(1, radius ?? 10)) : undefined,
    sort: SORT_OPTIONS.find((o) => o.value === sort)?.value ?? (near ? "distance" : "relevance"),
    page: Math.max(1, Math.floor(num(one(sp, "page")) ?? 1)),
  };
}

/** Human description of the current search, used for headings and titles. */
export function describeSearch(s: SearchState): { title: string; where: string | null } {
  const level =
    s.level === "primary"
      ? "primary schools"
      : s.level === "high"
        ? "high schools"
        : s.level === "special_needs"
          ? "special needs schools"
          : "schools";
  const sector =
    s.type === "private" ? "independent " : s.type === "public" ? "public " : s.type === "model_c" ? "Model C " : "";
  const fee = s.noFee ? "no-fee " : "";
  const noun = s.type === "university" ? "universities" : `${fee}${sector}${level}`;
  const where = s.near
    ? `within ${s.radiusKm} km of you`
    : s.area
      ? `in ${s.area}`
      : s.province
        ? `in ${s.province}`
        : null;
  const title = noun.charAt(0).toUpperCase() + noun.slice(1);
  return { title, where };
}

/** Number of filters applied (for the mobile "Filters (3)" button). */
export function activeFilterCount(s: SearchState): number {
  return [s.province, s.type, s.level, s.grade, s.noFee || undefined, s.feeMax, s.feeMin, s.area].filter(
    (v) => v != null,
  ).length;
}
