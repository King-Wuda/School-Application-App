"use client";

import { useEffect, useState } from "react";

interface Pos {
  lat: number;
  lng: number;
}

const STORAGE_KEY = "sf.userpos";
let inflight: Promise<Pos | null> | null = null;

/**
 * Single-flight geolocation: only one prompt per session, cached in
 * sessionStorage. Returns null on deny/error/unsupported.
 */
export function getUserPosition(): Promise<Pos | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  const cached = sessionStorage.getItem(STORAGE_KEY);
  if (cached) {
    if (cached === "deny") return Promise.resolve(null);
    const [lat, lng] = cached.split(",").map(Number);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return Promise.resolve({ lat, lng });
    }
  }
  if (inflight) return inflight;
  if (!navigator.geolocation) return Promise.resolve(null);

  inflight = new Promise<Pos | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        sessionStorage.setItem(
          STORAGE_KEY,
          `${p.coords.latitude},${p.coords.longitude}`,
        );
        resolve({ lat: p.coords.latitude, lng: p.coords.longitude });
      },
      () => {
        sessionStorage.setItem(STORAGE_KEY, "deny");
        resolve(null);
      },
      { maximumAge: 10 * 60 * 1000, timeout: 5000 },
    );
  }).finally(() => {
    inflight = null;
  });

  return inflight;
}

export function useUserPosition(): Pos | null {
  const [pos, setPos] = useState<Pos | null>(null);
  useEffect(() => {
    let mounted = true;
    getUserPosition().then((p) => {
      if (mounted) setPos(p);
    });
    return () => {
      mounted = false;
    };
  }, []);
  return pos;
}
