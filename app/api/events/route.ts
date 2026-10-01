import { NextResponse } from "next/server";
import {
  EVENT_NAMES,
  canStore,
  clean,
  cleanProps,
  clientKey,
  deviceFromUserAgent,
  insertRows,
  isBot,
  rateLimited,
  referrerDomain,
} from "@/lib/analytics/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const NAMES = new Set<string>(EVENT_NAMES);
const MAX_BODY = 16_000;

/**
 * Receives batched, anonymous usage events from the browser (see
 * lib/analytics/client.ts). Always answers 204 so tracking can never break
 * the page, and silently drops anything malformed.
 */
export async function POST(req: Request) {
  const done = new NextResponse(null, { status: 204 });
  if (!canStore()) return done;

  const ua = req.headers.get("user-agent");
  if (isBot(ua)) return done;
  if (rateLimited(`ev:${clientKey(req)}`, 120, 60_000)) return done;

  const text = await req.text().catch(() => "");
  if (!text || text.length > MAX_BODY) return done;

  let body: {
    s?: unknown;
    r?: unknown;
    u?: { source?: unknown; medium?: unknown; campaign?: unknown };
    e?: { n?: unknown; p?: unknown; path?: unknown }[];
  };
  try {
    body = JSON.parse(text);
  } catch {
    return done;
  }

  const session = clean(body.s, 64);
  if (!session || !/^[a-z0-9-]{8,64}$/i.test(session) || !Array.isArray(body.e)) return done;

  const ownHost = (() => {
    try {
      return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "").hostname;
    } catch {
      return req.headers.get("host");
    }
  })();

  const shared = {
    session_id: session,
    referrer: referrerDomain(body.r, ownHost),
    utm_source: clean(body.u?.source, 100)?.toLowerCase() ?? null,
    utm_medium: clean(body.u?.medium, 100)?.toLowerCase() ?? null,
    utm_campaign: clean(body.u?.campaign, 100) ?? null,
    device: deviceFromUserAgent(ua),
  };

  const rows = body.e
    .slice(0, 25)
    .filter((e) => typeof e?.n === "string" && NAMES.has(e.n))
    .map((e) => ({
      ...shared,
      name: e.n as string,
      path: clean(e.path, 300),
      props: cleanProps(e.p),
    }));

  await insertRows("analytics_events", rows);

  // Roughly 1 request in 500 also enforces the 24-month retention promise
  // made in the privacy policy.
  if (Math.random() < 0.002) {
    const { error } = await getSupabaseAdminClient().rpc("purge_old_analytics");
    if (error) console.error(`[analytics] purge failed: ${error.message}`);
  }
  return done;
}
