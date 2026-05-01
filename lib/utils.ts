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

export function formatGradeRange(from: string | null, to: string | null): string {
  if (!from && !to) return "Grades not listed";
  if (from && to) {
    if (from === to) return from;
    return `${from} – ${to}`;
  }
  return from ?? to ?? "";
}

function fmt(n: number): string {
  return n.toLocaleString("en-ZA");
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

export function formatDistance(km: number | null): string {
  if (km == null) return "Distance unknown";
  if (km < 1) return `${Math.round(km * 1000)} m away`;
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
