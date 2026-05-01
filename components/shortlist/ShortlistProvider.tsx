"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const STORAGE_KEY = "sf.shortlist.v1";
const MAX = 10;

interface ShortlistContextValue {
  ids: Set<string>;
  has: (schoolId: string) => boolean;
  add: (schoolId: string) => Promise<{ ok: boolean; reason?: string }>;
  remove: (schoolId: string) => Promise<void>;
  toggle: (schoolId: string) => Promise<{ ok: boolean; reason?: string }>;
  isAuthed: boolean;
  loading: boolean;
}

const ShortlistContext = createContext<ShortlistContextValue | null>(null);

function readLocal(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(arr: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch {
    // storage full / disabled — swallow
  }
}

export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [isAuthed, setIsAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const syncedFor = useRef<string | null>(null);

  const syncWithUser = useCallback(async (userId: string) => {
    if (syncedFor.current === userId) return;
    syncedFor.current = userId;
    try {
      const supabase = getSupabaseBrowserClient();
      const local = readLocal();
      if (local.length > 0) {
        // Push local additions first (respect MAX by trimming oldest).
        const rows = local
          .slice(0, MAX)
          .map((school_id) => ({ user_id: userId, school_id }));
        await supabase
          .from("shortlists")
          .upsert(rows, { onConflict: "user_id,school_id" });
      }
      const { data: fetched } = await supabase
        .from("shortlists")
        .select("school_id")
        .eq("user_id", userId);
      const remote = new Set((fetched ?? []).map((r: any) => r.school_id as string));
      setIds(remote);
      writeLocal(Array.from(remote));
    } catch {
      // network / RLS — keep local state
    }
  }, []);

  useEffect(() => {
    setIds(new Set(readLocal()));

    let unsub: (() => void) | undefined;
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          setIsAuthed(true);
          await syncWithUser(data.user.id);
        } else {
          setIsAuthed(false);
        }
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
          const u = session?.user;
          setIsAuthed(Boolean(u));
          if (u) {
            void syncWithUser(u.id);
          } else {
            syncedFor.current = null;
            // On explicit sign-out, clear local cache too so the next
            // (different) user doesn't briefly see the prior user's shortlist.
            if (event === "SIGNED_OUT") {
              setIds(new Set());
              writeLocal([]);
            }
          }
        });
        unsub = () => listener.subscription.unsubscribe();
      } catch {
        // Supabase not configured — local-only mode
      } finally {
        setLoading(false);
      }
    })();

    return () => unsub?.();
  }, [syncWithUser]);

  const has = useCallback((id: string) => ids.has(id), [ids]);

  const add = useCallback(
    async (schoolId: string) => {
      if (ids.has(schoolId)) return { ok: true };
      if (ids.size >= MAX) {
        return { ok: false, reason: `You can shortlist up to ${MAX} schools.` };
      }
      const next = new Set(ids);
      next.add(schoolId);
      setIds(next);
      writeLocal(Array.from(next));

      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          await supabase
            .from("shortlists")
            .upsert(
              { user_id: data.user.id, school_id: schoolId },
              { onConflict: "user_id,school_id" },
            );
        }
        // Not authed → kept locally; synced on sign-in.
      } catch {
        // ignore — local state persists
      }
      return { ok: true };
    },
    [ids],
  );

  const remove = useCallback(
    async (schoolId: string) => {
      const next = new Set(ids);
      next.delete(schoolId);
      setIds(next);
      writeLocal(Array.from(next));
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          await supabase
            .from("shortlists")
            .delete()
            .eq("user_id", data.user.id)
            .eq("school_id", schoolId);
        }
      } catch {
        // ignore
      }
    },
    [ids],
  );

  const toggle = useCallback(
    async (schoolId: string) => {
      if (ids.has(schoolId)) {
        await remove(schoolId);
        return { ok: true };
      }
      return add(schoolId);
    },
    [ids, add, remove],
  );

  const value = useMemo(
    () => ({ ids, has, add, remove, toggle, isAuthed, loading }),
    [ids, has, add, remove, toggle, isAuthed, loading],
  );

  return (
    <ShortlistContext.Provider value={value}>
      {children}
    </ShortlistContext.Provider>
  );
}

export function useShortlist() {
  const ctx = useContext(ShortlistContext);
  if (!ctx) throw new Error("useShortlist must be used inside ShortlistProvider");
  return ctx;
}
