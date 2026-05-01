"use client";

import { useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function TrackView({ schoolId }: { schoolId: string }) {
  useEffect(() => {
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
  }, [schoolId]);
  return null;
}
