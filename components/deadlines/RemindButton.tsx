"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { BellIcon, CheckIcon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

interface Props {
  deadlineId: string;
  gradeGroup: string | null;
  schoolName: string;
  closeDate: string;
  className?: string;
}

type ButtonState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "need-login" }
  | { kind: "error"; msg: string };

export function RemindButton({ deadlineId, gradeGroup, className }: Props) {
  const [state, setState] = useState<ButtonState>({ kind: "idle" });

  useEffect(() => {
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) return;
        const { data } = await supabase
          .from("reminders")
          .select("id")
          .eq("user_id", user.user.id)
          .eq("deadline_id", deadlineId)
          .maybeSingle();
        if (data) setState({ kind: "saved" });
      } catch {
        // Supabase not configured — stay idle
      }
    })();
  }, [deadlineId]);

  const onClick = async () => {
    let supabase: ReturnType<typeof getSupabaseBrowserClient>;
    try {
      supabase = getSupabaseBrowserClient();
    } catch {
      setState({ kind: "error", msg: "Supabase is not configured." });
      return;
    }

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) {
      setState({ kind: "error", msg: "Could not verify your session." });
      return;
    }
    if (!userData.user) {
      setState({ kind: "need-login" });
      return;
    }

    setState({ kind: "saving" });
    try {
      if (state.kind === "saved") {
        const { error } = await supabase
          .from("reminders")
          .delete()
          .eq("user_id", userData.user.id)
          .eq("deadline_id", deadlineId);
        if (error) throw error;
        setState({ kind: "idle" });
      } else {
        const { error } = await supabase.from("reminders").upsert(
          {
            user_id: userData.user.id,
            deadline_id: deadlineId,
            grade_applying_for: gradeGroup,
          },
          { onConflict: "user_id,deadline_id" },
        );
        if (error) throw error;
        setState({ kind: "saved" });
      }
    } catch (e: any) {
      setState({ kind: "error", msg: e?.message ?? "Couldn't save reminder." });
    }
  };

  if (state.kind === "need-login") {
    return (
      <Link
        href="/login"
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-lg border border-navy/15 bg-white px-4 text-sm font-medium text-navy hover:bg-cream",
          className,
        )}
      >
        <BellIcon size={16} /> Sign in to set a reminder
      </Link>
    );
  }

  const saved = state.kind === "saved";
  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={state.kind === "saving"}
        className={cn(
          "inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors disabled:opacity-60",
          saved
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-navy/15 bg-white text-navy hover:bg-cream",
          className,
        )}
        aria-pressed={saved}
      >
        {saved ? (
          <>
            <CheckIcon size={16} /> Reminder set
          </>
        ) : (
          <>
            <BellIcon size={16} /> {state.kind === "saving" ? "Saving…" : "Remind me"}
          </>
        )}
      </button>
      {state.kind === "error" && (
        <p role="alert" className="text-xs text-red-600">
          {state.msg}
        </p>
      )}
    </div>
  );
}
