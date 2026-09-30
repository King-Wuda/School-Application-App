"use client";

import { useEffect, useState } from "react";

export interface Pos {
  lat: number;
  lng: number;
}

const STORAGE_KEY = "sf.userpos";
const EVENT = "sf:userpos";
let inflight: Promise<Pos | null> | null = null;

function readCached(): Pos | null {
  try {
    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (!cached || cached === "deny") return null;
    const [lat, lng] = cached.split(",").map(Number);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  } catch {
    return null;
  }
}

export type LocateResult =
  | { ok: true; pos: Pos }
  | { ok: false; reason: "unsupported" | "denied" | "unavailable" };

/**
 * Asks the browser for the user's location. Only call this in response to a
 * user action (e.g. tapping "Near me") — browsers and parents both dislike a
 * location prompt that appears as soon as a page loads.
 */
export function requestUserPosition(): Promise<LocateResult> {
  if (typeof window === "undefined" || !navigator.geolocation) {
    return Promise.resolve({ ok: false, reason: "unsupported" });
  }
  const cached = readCached();
  if (cached) return Promise.resolve({ ok: true, pos: cached });
  if (!inflight) {
    inflight = new Promise<Pos | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
        (err) => {
          if (err.code === err.PERMISSION_DENIED) {
            try {
              sessionStorage.setItem(STORAGE_KEY, "deny");
            } catch {}
          }
          resolve(null);
        },
        { maximumAge: 10 * 60 * 1000, timeout: 10000, enableHighAccuracy: false },
      );
    }).finally(() => {
      inflight = null;
    });
  }
  return inflight.then((pos) => {
    if (!pos) {
      let denied = false;
      try {
        denied = sessionStorage.getItem(STORAGE_KEY) === "deny";
        // Let the user try again next time they tap the button.
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {}
      return { ok: false, reason: denied ? "denied" : "unavailable" } as const;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, `${pos.lat},${pos.lng}`);
    } catch {}
    window.dispatchEvent(new CustomEvent(EVENT));
    return { ok: true, pos } as const;
  });
}

/**
 * The user's position if they have already shared it this session, else
 * null. Never triggers a permission prompt.
 */
export function useUserPosition(): Pos | null {
  const [pos, setPos] = useState<Pos | null>(null);
  useEffect(() => {
    const update = () => setPos(readCached());
    update();
    window.addEventListener(EVENT, update);
    return () => window.removeEventListener(EVENT, update);
  }, []);
  return pos;
}
