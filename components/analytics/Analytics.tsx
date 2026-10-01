"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/analytics/client";

/**
 * Records page views, and clicks on any link marked `data-track="kind"`
 * (school website, phone, directions, admissions portal…), which is how we
 * know a visit led to a parent actually contacting a school.
 */
export function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    track("page_view");
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("a[data-track]");
      if (!el) return;
      track("outbound", {
        kind: el.getAttribute("data-track") ?? "link",
        school: el.getAttribute("data-school") ?? undefined,
      });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}

/** Fires one event when a component mounts (or its key props change). */
export function TrackEvent({ name, props }: { name: string; props?: Record<string, string | number | boolean | null | undefined> }) {
  const key = JSON.stringify(props ?? {});
  useEffect(() => {
    track(name, props);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, key]);
  return null;
}
