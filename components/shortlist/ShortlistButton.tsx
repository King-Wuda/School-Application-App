"use client";

import { HeartIcon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import { useShortlist } from "./ShortlistProvider";
import { track } from "@/lib/analytics/client";

interface Props {
  schoolId: string;
  schoolName?: string;
  variant?: "icon" | "full";
  className?: string;
}

export function ShortlistButton({ schoolId, schoolName, variant = "icon", className }: Props) {
  const { has, toggle, isAuthed, notify, ids } = useShortlist();
  const saved = has(schoolId);
  const name = schoolName ?? "School";

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wasSaved = saved;
    const res = await toggle(schoolId);
    if (!res.ok) {
      notify(res.reason ?? "Couldn't save that school.", { href: "/account/shortlist", label: "Manage" });
      return;
    }
    track(wasSaved ? "shortlist_remove" : "shortlist_add", { school: schoolName, count: wasSaved ? ids.size - 1 : ids.size + 1 });
    if (wasSaved) {
      notify(`Removed ${name} from your shortlist.`);
    } else {
      const count = ids.size + 1;
      notify(
        isAuthed
          ? `Saved · ${count} school${count === 1 ? "" : "s"} on your shortlist`
          : `Saved on this device · ${count} on your shortlist`,
        count >= 2 ? { href: "/compare", label: "Compare" } : { href: "/account/shortlist", label: "View" },
      );
    }
  };

  const label = saved ? `Remove ${name} from shortlist` : `Save ${name} to shortlist`;

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={label}
        title={saved ? "Saved — tap to remove" : "Save to shortlist"}
        className={cn(
          "inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors",
          saved ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "text-navy/50 hover:bg-navy/5 hover:text-navy",
          className,
        )}
      >
        <HeartIcon filled={saved} size={20} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={label}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors",
        saved
          ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
          : "border-navy/15 bg-white text-navy hover:bg-cream",
        className,
      )}
    >
      <HeartIcon filled={saved} size={18} />
      {saved ? "Saved" : "Save"}
    </button>
  );
}
