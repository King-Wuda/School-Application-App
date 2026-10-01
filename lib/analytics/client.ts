"use client";

/**
 * Tiny first-party analytics. No cookies, no third parties, no personal data:
 * a random ID per browser tab, the event name, the page, and a few
 * non-identifying details (e.g. "searched for high schools, 24 results").
 */

type Props = Record<string, string | number | boolean | null | undefined>;
interface QueuedEvent {
  n: string;
  p?: Props;
  path: string;
}

const SESSION_KEY = "sf.sid";
const ATTRIB_KEY = "sf.attrib";
let queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let listening = false;

function enabled(): boolean {
  if (typeof window === "undefined") return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  if (nav.doNotTrack === "1" || nav.globalPrivacyControl === true) return false;
  // Never track the operator's own admin screens.
  return !/^\/(admin|owner)(\/|$)/.test(location.pathname);
}

function sessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "no-storage-session";
  }
}

/** Where this visit came from — captured once, on the first page of the visit. */
function attribution(): { r: string | null; u: { source?: string; medium?: string; campaign?: string } } {
  try {
    const saved = sessionStorage.getItem(ATTRIB_KEY);
    if (saved) return JSON.parse(saved);
    const sp = new URLSearchParams(location.search);
    const value = {
      r: document.referrer || null,
      u: {
        source: sp.get("utm_source") ?? (sp.has("fbclid") ? "facebook" : undefined),
        medium: sp.get("utm_medium") ?? undefined,
        campaign: sp.get("utm_campaign") ?? undefined,
      },
    };
    sessionStorage.setItem(ATTRIB_KEY, JSON.stringify(value));
    return value;
  } catch {
    return { r: null, u: {} };
  }
}

function flush() {
  if (timer) clearTimeout(timer);
  timer = null;
  if (!queue.length) return;
  const { r, u } = attribution();
  const body = JSON.stringify({ s: sessionId(), r, u, e: queue.splice(0, 25) });
  try {
    const sent = navigator.sendBeacon?.("/api/events", new Blob([body], { type: "application/json" }));
    if (!sent) void fetch("/api/events", { method: "POST", body, keepalive: true, headers: { "content-type": "application/json" } });
  } catch {
    // Tracking must never break the page.
  }
  if (queue.length) flush();
}

export function track(name: string, props?: Props) {
  if (!enabled()) return;
  attribution(); // pin the landing referrer before any client-side navigation
  const clean: Props = {};
  for (const [k, v] of Object.entries(props ?? {})) if (v != null && v !== "") clean[k] = v;
  queue.push({ n: name, p: clean, path: location.pathname });
  if (!listening) {
    listening = true;
    addEventListener("pagehide", flush);
    addEventListener("visibilitychange", () => document.visibilityState === "hidden" && flush());
  }
  if (!timer) timer = setTimeout(flush, 1500);
}

/** Session ID to attach to feedback, so it can be read alongside the visit. */
export function currentSessionId(): string | null {
  return enabled() ? sessionId() : null;
}
