import { getSupabaseAdminClient } from "@/lib/supabase/admin";

/** Events the site sends. Anything else is dropped. */
export const EVENT_NAMES = [
  "page_view",
  "search",
  "near_me",
  "school_view",
  "shortlist_add",
  "shortlist_remove",
  "compare_view",
  "outbound",
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

export type Device = "mobile" | "tablet" | "desktop";

export function canStore(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function deviceFromUserAgent(ua: string | null): Device {
  const s = ua ?? "";
  if (/iPad|Tablet|PlayBook|Silk|(Android(?!.*Mobile))/i.test(s)) return "tablet";
  if (/Mobi|iPhone|iPod|Android|BlackBerry|IEMobile|Opera Mini/i.test(s)) return "mobile";
  return "desktop";
}

export function isBot(ua: string | null): boolean {
  return /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|pingdom|monitor/i.test(ua ?? "");
}

/** Short, plain strings only — never trust what the browser sends. */
export function clean(v: unknown, max = 120): string | null {
  if (typeof v !== "string") return null;
  const s = v.replace(/[\u0000-\u001f]/g, "").trim().slice(0, max);
  return s || null;
}

/** Keeps a small, flat object of strings / numbers / booleans. */
export function cleanProps(input: unknown): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!input || typeof input !== "object") return out;
  for (const [k, v] of Object.entries(input).slice(0, 12)) {
    if (!/^[a-z_]{1,24}$/.test(k)) continue;
    if (typeof v === "boolean") out[k] = v;
    else if (typeof v === "number" && Number.isFinite(v)) out[k] = Math.round(v * 100) / 100;
    else if (typeof v === "string") {
      const s = clean(v, 120);
      if (s) out[k] = s;
    }
  }
  return out;
}

/** "https://m.facebook.com/groups/123" → "facebook.com". Own domain → null. */
export function referrerDomain(ref: unknown, ownHost: string | null): string | null {
  const s = clean(ref, 500);
  if (!s) return null;
  try {
    const host = new URL(s).hostname.replace(/^(www|m|l|lm|web|mobile)\./, "");
    if (ownHost && host === ownHost.replace(/^www\./, "")) return null;
    return host.slice(0, 200);
  } catch {
    return null;
  }
}

// ─── Abuse protection ──────────────────────────────────────────────────────
// A simple per-IP budget. It lives in memory, so on serverless it's per
// instance — enough to stop a script hammering one endpoint, not a DDoS shield.
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.reset < now) buckets.delete(k);
  }
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  b.count += 1;
  return b.count > limit;
}

export function clientKey(req: Request): string {
  return (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function insertRows(table: "analytics_events" | "feedback", rows: Record<string, unknown>[]) {
  if (!rows.length || !canStore()) return;
  const { error } = await getSupabaseAdminClient().from(table).insert(rows);
  if (error) console.error(`[analytics] insert into ${table} failed: ${error.message}`);
}
