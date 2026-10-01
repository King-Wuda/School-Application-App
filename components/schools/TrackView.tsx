"use client";

import { useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics/client";

export function TrackView({ schoolId, slug, name }: { schoolId: string; slug: string; name: string }) {
  useEffect(() => {
    track("school_view", { slug, name });
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (!data.user) return;
        await supabase.from("recently_viewed").upsert(
          {
            user_id: data.user.id,
            school_id: schoolId,
            viewed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,school_id" },
        );
      } catch {
        // best-effort — silent fail
      }
    })();
  }, [schoolId, slug, name]);
  return null;
}
