"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { SchoolAvatar } from "@/components/ui/SchoolAvatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useShortlist } from "@/components/shortlist/ShortlistProvider";
import { XIcon, ExternalLinkIcon } from "@/components/ui/Icon";
import {
  SCHOOL_TYPE_BADGE_CLASSES,
  SCHOOL_TYPE_LABELS,
  type SchoolWithRelations,
} from "@/lib/types";
import { formatFeeRange, formatGradeRange, cn } from "@/lib/utils";

interface Props {
  schools: SchoolWithRelations[];
}

export function CompareClient({ schools }: Props) {
  const { remove } = useShortlist();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    // Default select the first three.
    setSelected(schools.slice(0, 3).map((s) => s.id));
  }, [schools]);

  const visible = useMemo(
    () => schools.filter((s) => selected.includes(s.id)).slice(0, 3),
    [schools, selected],
  );

  if (schools.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-navy/20 bg-white p-10 text-center">
        <p className="font-serif text-xl text-navy">Your shortlist is empty</p>
        <p className="mt-2 text-navy/60">
          Save schools to your shortlist to compare them side-by-side.
        </p>
        <Link
          href="/search"
          className="mt-4 inline-flex h-10 items-center rounded-lg bg-navy px-4 text-sm font-medium text-cream hover:bg-navy/90"
        >
          Browse schools
        </Link>
      </div>
    );
  }

  const toggle = (id: string) => {
    setSelected((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 3) return [...cur.slice(1), id];
      return [...cur, id];
    });
  };

  return (
    <div className="space-y-6">
      {/* Selector */}
      <div className="rounded-xl border border-navy/10 bg-white p-4">
        <p className="mb-3 text-sm font-medium text-navy">
          Choose up to 3 schools to compare
        </p>
        <div className="flex flex-wrap gap-2">
          {schools.map((s) => {
            const picked = selected.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggle(s.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
                  picked
                    ? "border-navy bg-navy text-cream"
                    : "border-navy/15 bg-white text-navy hover:bg-cream",
                )}
              >
                {s.name}
                {picked && <XIcon size={14} />}
              </button>
            );
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-navy/60">Select at least one school to compare.</p>
      ) : (
        <CompareTable schools={visible} onRemove={(id) => remove(id)} />
      )}
    </div>
  );
}

function CompareTable({
  schools,
  onRemove,
}: {
  schools: SchoolWithRelations[];
  onRemove: (id: string) => void;
}) {
  const rows: { label: string; render: (s: SchoolWithRelations) => React.ReactNode }[] = [
    {
      label: "Type",
      render: (s) => (
        <Badge className={SCHOOL_TYPE_BADGE_CLASSES[s.type]}>
          {SCHOOL_TYPE_LABELS[s.type]}
        </Badge>
      ),
    },
    {
      label: "Monthly fees",
      render: (s) =>
        s.type === "university"
          ? "See website"
          : formatFeeRange(s.fee_monthly_min, s.fee_monthly_max),
    },
    {
      label: "Grades",
      render: (s) => formatGradeRange(s.grades_from, s.grades_to),
    },
    {
      label: "Language",
      render: (s) => s.language ?? "—",
    },
    {
      label: "Curriculum",
      render: (s) => s.curriculum ?? "—",
    },
    {
      label: "Boarding",
      render: (s) => (s.boarding ? "Yes" : "No"),
    },
    {
      label: "Location",
      render: (s) => [s.suburb, s.province].filter(Boolean).join(", "),
    },
    {
      label: "Next deadline",
      render: (s) => {
        const upcoming = s.deadlines
          .filter((d) => d.close_date && new Date(d.close_date) >= new Date())
          .sort((a, b) => a.close_date!.localeCompare(b.close_date!))[0];
        if (!upcoming) return "—";
        return (
          <span>
            <span className="font-medium">{upcoming.grade_group ?? "Application"}</span>
            <br />
            <span className="text-navy/70">
              {format(parseISO(upcoming.close_date!), "d MMM yyyy")}
            </span>
          </span>
        );
      },
    },
    {
      label: "Apply",
      render: (s) =>
        s.website_url ? (
          <a
            href={s.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-navy hover:underline"
          >
            Visit site <ExternalLinkIcon size={12} />
          </a>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-separate border-spacing-0 rounded-xl border border-navy/10 bg-white">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 w-40 bg-white p-4 text-left text-xs font-medium uppercase tracking-wide text-navy/50">
              Attribute
            </th>
            {schools.map((s) => (
              <th key={s.id} className="p-4 text-left">
                <div className="flex items-start gap-3">
                  <SchoolAvatar name={s.name} logoUrl={s.logo_url} size={40} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/schools/${s.slug}`}
                      className="block truncate font-serif text-base font-semibold text-navy hover:underline"
                    >
                      {s.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => onRemove(s.id)}
                      className="mt-1 text-xs text-navy/50 hover:text-red-600"
                    >
                      Remove from shortlist
                    </button>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label} className={i % 2 ? "bg-cream/40" : undefined}>
              <th className="sticky left-0 bg-inherit p-4 text-left text-sm font-medium text-navy/70">
                {row.label}
              </th>
              {schools.map((s) => (
                <td key={s.id} className="p-4 align-top text-sm text-navy">
                  {row.render(s)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
