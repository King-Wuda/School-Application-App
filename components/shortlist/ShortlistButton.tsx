"use client";

import { useState } from "react";
import { HeartIcon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { useShortlist } from "./ShortlistProvider";

interface Props {
  schoolId: string;
  variant?: "icon" | "full";
  className?: string;
}

export function ShortlistButton({ schoolId, variant = "icon", className }: Props) {
  const { has, toggle, isAuthed } = useShortlist();
  const [msg, setMsg] = useState<string | null>(null);
  const saved = has(schoolId);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMsg(null);
    const wasSaved = saved;
    const res = await toggle(schoolId);
    if (!res.ok && res.reason) {
      setMsg(res.reason);
      return;
    }
    if (!wasSaved && !isAuthed) {
      setMsg("Saved locally. Sign in to keep it across devices.");
      setTimeout(() => setMsg(null), 4000);
    }
  };

  if (variant === "icon") {
    return (
      <div className="inline-flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={onClick}
          aria-pressed={saved}
          aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
          title={saved ? "Remove from shortlist" : "Save to shortlist"}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-full border border-navy/15 bg-white transition-colors hover:bg-cream",
            saved ? "text-red-500" : "text-navy/70",
            className,
          )}
        >
          <HeartIcon filled={saved} />
        </button>
        {msg && (
          <span role="status" className="max-w-[220px] text-right text-xs text-navy/60">
            {msg}
          </span>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors",
          saved
            ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            : "border-navy/15 bg-white text-navy hover:bg-cream",
          className,
        )}
      >
        <HeartIcon filled={saved} size={18} />
        {saved ? "Saved to shortlist" : "Save to shortlist"}
      </button>
      {msg && (
        <p role="status" className="mt-1 text-sm text-navy/60">
          {msg}
        </p>
      )}
    </div>
  );
}
