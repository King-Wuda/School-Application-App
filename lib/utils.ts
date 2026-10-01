import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatFeeRange(min: number | null, max: number | null): string {
  if (min == null && max == null) return "Fees not listed";
  if (min != null && max != null) {
    if (min === max) return `R${fmt(min)}/month`;
    return `R${fmt(min)} – R${fmt(max)}/month`;
  }
  if (min != null) return `From R${fmt(min)}/month`;
  return `Up to R${fmt(max!)}/month`;
}

/** Fee label for a school, falling back to the official no-fee status. */
export function formatSchoolFees(
  school: {
    type: string;
    fee_monthly_min: number | null;
    fee_monthly_max: number | null;
    no_fee_school?: boolean | null;
  },
  opts?: { compact?: boolean },
): string {
  if (school.type === "university") return "See website";
  if (school.fee_monthly_min == null && school.fee_monthly_max == null && school.no_fee_school) {
    return "No-fee school";
  }
  if (opts?.compact) return formatFeeShort(school.fee_monthly_min, school.fee_monthly_max);
  return formatFeeRange(school.fee_monthly_min, school.fee_monthly_max);
}

/** Card-sized fee label: "R3 400–3 600/mo". */
export function formatFeeShort(min: number | null, max: number | null): string {
  if (min == null && max == null) return "Fees not listed";
  if (min != null && max != null && min !== max) return `R${fmt(min)}–${fmt(max)}/mo`;
  if (min != null && max == null) return `From R${fmt(min)}/mo`;
  return `R${fmt((max ?? min)!)}/mo`;
}

/** "Grade 000" / "Grade 00" are pre-school years; show them in plain language. */
function gradeLabel(grade: string): string {
  if (/\b0{2,3}\b/.test(grade)) return "Pre-school";
  return grade;
}

export function formatGradeRange(from: string | null, to: string | null): string {
  if (!from && !to) return "Grades not listed";
  if (from && to) {
    if (from === to) return gradeLabel(from);
    return `${gradeLabel(from)} – ${gradeLabel(to)}`;
  }
  return gradeLabel((from ?? to)!);
}

/** Compact form for cards: "Gr R–7", "Gr 8–12", "Pre-school–Gr 12". */
export function formatGradeShort(from: string | null, to: string | null): string | null {
  if (!from || !to) return null;
  const short = (g: string) => (/\b0{2,3}\b/.test(g) ? "Pre-school" : g.replace(/^Grade\s*/i, ""));
  const a = short(from);
  const b = short(to);
  if (!/^(R|\d+)$/.test(b)) return formatGradeRange(from, to);
  return a === "Pre-school" ? `Pre-school–Gr ${b}` : `Gr ${a}–${b}`;
}

/**
 * Thousands-separated number, e.g. 24000 → "24 000". Deliberately not
 * `toLocaleString`: Node and browsers ship different locale data, which made
 * server and client render different text and broke hydration.
 */
export function formatNumber(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function fmt(n: number): string {
  return formatNumber(n);
}

/** Google Maps directions link to a school. */
export function directionsUrl(school: {
  name: string;
  latitude: number | null;
  longitude: number | null;
  address?: string | null;
}): string | null {
  const dest =
    school.latitude != null && school.longitude != null
      ? `${school.latitude},${school.longitude}`
      : school.address
        ? `${school.name}, ${school.address}`
        : null;
  return dest
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`
    : null;
}

/** "021 712 2051" → "tel:+27217122051" */
export function telHref(phone: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) return `tel:+27${digits.slice(1)}`;
  return digits.length >= 9 ? `tel:${digits}` : null;
}

// Haversine distance in km
export function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function formatDistance(km: number | null | undefined): string {
  if (km == null) return "Distance unknown";
  if (km < 1) return `${Math.round(km * 100) * 10} m away`;
  if (km < 10) return `${km.toFixed(1)} km away`;
  return `${Math.round(km)} km away`;
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";
}

/**
 * Returns today's date as a YYYY-MM-DD string in Africa/Johannesburg.
 * Used so "closing soon" calculations don't shift by a day around midnight UTC.
 */
export function todayInSa(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Calendar days between today (SA) and an ISO yyyy-MM-dd date. */
export function daysUntilSa(closeIso: string): number {
  const today = todayInSa();
  // Use UTC midnights for both so difference is calendar days, not hours.
  const a = new Date(`${today}T00:00:00Z`).getTime();
  const b = new Date(`${closeIso}T00:00:00Z`).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Sanitise a string for use in a PostgREST `.or()` / `.ilike()` filter value.
 * Strips PostgREST syntax chars (commas, parens, quotes, semicolons, slashes)
 * and escapes SQL LIKE wildcards. Returns an empty string for nothing usable.
 */
export function sanitiseLike(input: string): string {
  return input
    .replace(/[,()'"\\;]/g, " ")
    .replace(/[%_]/g, (m) => `\\${m}`)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

/**
 * "Grade R" → 0, "Grade 8" → 8, anything else → null. Mirrors the
 * grade_min / grade_max generated columns in the database.
 */
export function gradeNumber(grade: string | null | undefined): number | null {
  if (!grade) return null;
  if (/\bR\b/i.test(grade)) return 0;
  const m = /\d+/.exec(grade);
  return m ? Number(m[0]) : null;
}

/**
 * Lower-case, accent-free, punctuation-free text — mirrors the database's
 * `search_text` column, so "Hoërskool" and "hoerskool" match each other.
 */
export function normaliseSearch(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Words a search must all match, e.g. "Rondebosch High" → ["rondebosch", "high"]. */
export function searchWords(q: string): string[] {
  return normaliseSearch(q.replace(/[-/,.]/g, " "))
    .split(" ")
    .filter((w) => w.length > 1 || /\d/.test(w))
    .slice(0, 6);
}
