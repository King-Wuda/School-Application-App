"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { daysUntilSa } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BellIcon, XIcon } from "@/components/ui/Icon";

interface DeadlineRow {
  reminderId: string;
  grade: string | null;
  closeDate: string | null;
  applicationUrl: string | null;
  schoolName: string;
  schoolSlug: string;
}

export default function DeadlinesPage() {
  const [rows, setRows] = useState<DeadlineRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          setLoading(false);
          return;
        }
        setEmail(userData.user.email ?? null);
        const { data } = await supabase
          .from("reminders")
          .select(
            "id, grade_applying_for, deadline:deadlines(close_date, application_url, grade_group, school:schools(name, slug))",
          )
          .eq("user_id", userData.user.id);
        const mapped: DeadlineRow[] = (data ?? []).map((r: any) => ({
          reminderId: r.id,
          grade: r.grade_applying_for ?? r.deadline?.grade_group ?? null,
          closeDate: r.deadline?.close_date ?? null,
          applicationUrl: r.deadline?.application_url ?? null,
          schoolName: r.deadline?.school?.name ?? "School",
          schoolSlug: r.deadline?.school?.slug ?? "",
        }));
        mapped.sort((a, b) => (a.closeDate ?? "").localeCompare(b.closeDate ?? ""));
        setRows(mapped);
      } catch {
        // Supabase not configured
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const remove = async (id: string) => {
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.from("reminders").delete().eq("id", id);
      setRows((r) => r.filter((x) => x.reminderId !== id));
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-hero text-navy">My deadlines</h1>
        <p className="mt-1 text-navy/70">
          Reminders sent 30 and 7 days before each deadline.
        </p>
      </header>

      {loading ? (
        <p className="text-navy/60">Loading…</p>
      ) : !email ? (
        <EmptyCTA />
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-navy/20 bg-white p-10 text-center">
          <p className="font-serif text-xl text-navy">No reminders yet</p>
          <p className="mt-2 text-navy/60">
            Click <span className="font-medium">Remind me</span> on any school's deadline to save it here.
          </p>
          <Link
            href="/search"
            className="mt-4 inline-flex h-10 items-center rounded-lg bg-navy px-4 text-sm font-medium text-cream"
          >
            Browse schools
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const days = r.closeDate ? daysUntilSa(r.closeDate) : null;
            const urgent = days != null && days >= 0 && days <= 30;
            const closed = days != null && days < 0;
            return (
              <li
                key={r.reminderId}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-navy/10 bg-white p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/schools/${r.schoolSlug}`}
                      className="font-serif text-lg font-semibold text-navy hover:underline"
                    >
                      {r.schoolName}
                    </Link>
                    {urgent && (
                      <Badge className="bg-red-600 text-white">
                        Closing in {days} day{days === 1 ? "" : "s"}
                      </Badge>
                    )}
                    {closed && <Badge className="bg-navy/10 text-navy/60">Closed</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-navy/70">
                    {r.grade ?? "Application"} · closes{" "}
                    {r.closeDate
                      ? format(parseISO(r.closeDate), "d MMM yyyy")
                      : "date unknown"}
                  </p>
                </div>
                <div className="flex gap-2">
                  {r.applicationUrl && (
                    <a
                      href={r.applicationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 items-center rounded-md bg-navy px-3 text-sm font-medium text-cream hover:bg-navy/90"
                    >
                      Apply
                    </a>
                  )}
                  <button
                    onClick={() => remove(r.reminderId)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-navy/15 text-navy/60 hover:bg-navy/5"
                    aria-label="Remove reminder"
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function EmptyCTA() {
  return (
    <div className="rounded-xl border border-dashed border-navy/20 bg-white p-10 text-center">
      <BellIcon className="mx-auto text-navy/40" size={32} />
      <p className="mt-2 font-serif text-xl text-navy">Sign in to track deadlines</p>
      <p className="mt-2 text-navy/60">
        Save reminders and we'll email you before they close.
      </p>
      <Link
        href="/login"
        className="mt-4 inline-flex h-10 items-center rounded-lg bg-navy px-4 text-sm font-medium text-cream"
      >
        Sign in
      </Link>
    </div>
  );
}
