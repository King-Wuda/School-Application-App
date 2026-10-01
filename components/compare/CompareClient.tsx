"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { SchoolAvatar } from "@/components/ui/SchoolAvatar";
import { TrackEvent } from "@/components/analytics/Analytics";
import { Badge } from "@/components/ui/Badge";
import { useShortlist } from "@/components/shortlist/ShortlistProvider";
import { useUserPosition } from "@/components/location/useUserPosition";
import { phaseLabel, schoolHref } from "@/components/schools/SchoolCard";
import { CheckIcon, ExternalLinkIcon, HeartIcon, PhoneIcon, XIcon } from "@/components/ui/Icon";
import { SCHOOL_TYPE_BADGE_CLASSES, SCHOOL_TYPE_LABELS, type SchoolWithRelations } from "@/lib/types";
import {
  cn,
  distanceKm,
  formatDistance,
  formatGradeRange,
  formatNumber,
  formatSchoolFees,
  telHref,
  todayInSa,
} from "@/lib/utils";

interface Props {
  schools: SchoolWithRelations[];
}

const MAX_COMPARE = 3;

export function CompareClient({ schools }: Props) {
  const { remove } = useShortlist();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    setSelected((cur) => {
      const still = cur.filter((id) => schools.some((s) => s.id === id));
      return still.length ? still : schools.slice(0, MAX_COMPARE).map((s) => s.id);
    });
  }, [schools]);

  const visible = useMemo(
    () => selected.map((id) => schools.find((s) => s.id === id)).filter(Boolean) as SchoolWithRelations[],
    [schools, selected],
  );

  if (schools.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-navy/20 bg-white px-6 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <HeartIcon size={26} />
        </div>
        <p className="mt-5 font-serif text-2xl text-navy">Nothing to compare yet</p>
        <p className="mx-auto mt-2 max-w-md text-navy/65">
          Tap the heart on any school to save it to your shortlist. Save two or more and they&apos;ll
          appear here side by side.
        </p>
        <Link
          href="/search"
          className="mt-6 inline-flex h-12 items-center rounded-xl bg-navy px-6 font-semibold text-cream hover:bg-navy/90"
        >
          Find schools
        </Link>
      </div>
    );
  }

  const toggle = (id: string) => {
    setSelected((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= MAX_COMPARE) return [...cur.slice(1), id];
      return [...cur, id];
    });
  };

  return (
    <div className="space-y-6">
      <TrackEvent name="compare_view" props={{ saved: schools.length }} />
      <div className="rounded-2xl border border-navy/10 bg-white p-4 sm:p-5">
        <p className="text-sm font-medium text-navy">
          Your shortlist <span className="text-navy/50">· choose up to {MAX_COMPARE}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {schools.map((s) => {
            const picked = selected.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggle(s.id)}
                aria-pressed={picked}
                className={cn("chip max-w-full", picked && "chip-active")}
              >
                {picked && <CheckIcon size={14} />}
                <span className="truncate">{s.name}</span>
              </button>
            );
          })}
        </div>
        {schools.length === 1 && (
          <p className="mt-3 text-sm text-navy/60">
            Save at least one more school to compare.{" "}
            <Link href="/search" className="font-medium text-navy underline">
              Find schools
            </Link>
          </p>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="text-navy/60">Pick a school above to compare.</p>
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
  const pos = useUserPosition();
  const today = todayInSa();

  const rows: { label: string; render: (s: SchoolWithRelations) => React.ReactNode }[] = [
    {
      label: "Type",
      render: (s) => (
        <Badge className={SCHOOL_TYPE_BADGE_CLASSES[s.type]}>
          {s.type === "private" ? "Independent" : SCHOOL_TYPE_LABELS[s.type]}
        </Badge>
      ),
    },
    { label: "Level", render: (s) => phaseLabel(s) ?? "—" },
    { label: "Grades", render: (s) => formatGradeRange(s.grades_from, s.grades_to) },
    { label: "Monthly fees", render: (s) => <span className="font-medium">{formatSchoolFees(s)}</span> },
    ...(pos
      ? [
          {
            label: "Distance from you",
            render: (s: SchoolWithRelations) =>
              s.latitude != null && s.longitude != null
                ? formatDistance(distanceKm(pos.lat, pos.lng, s.latitude, s.longitude)).replace(" away", "")
                : "—",
          },
        ]
      : []),
    { label: "Area", render: (s) => [s.suburb, s.town !== s.suburb ? s.town : null].filter(Boolean).join(", ") || s.province },
    { label: "Learners", render: (s) => (s.learner_count ? formatNumber(s.learner_count) : "—") },
    {
      label: "Learners per educator",
      render: (s) =>
        s.learner_count && s.educator_count ? `About ${Math.round(s.learner_count / s.educator_count)}` : "—",
    },
    { label: "Language", render: (s) => s.language ?? "—" },
    { label: "Curriculum", render: (s) => s.curriculum ?? "—" },
    { label: "Boarding", render: (s) => (s.boarding ? "Yes" : "No") },
    {
      label: "Next deadline",
      render: (s) => {
        const upcoming = s.deadlines
          .filter((d) => d.close_date && d.close_date >= today)
          .sort((a, b) => a.close_date!.localeCompare(b.close_date!))[0];
        if (!upcoming) return <span className="text-navy/50">Not announced</span>;
        return (
          <span>
            <span className="font-medium">{upcoming.grade_group ?? "Applications"}</span>
            <br />
            <span className="text-navy/70">closes {format(parseISO(upcoming.close_date!), "d MMM yyyy")}</span>
          </span>
        );
      },
    },
    {
      label: "Contact",
      render: (s) => {
        const tel = telHref(s.phone);
        return (
          <div className="flex flex-col items-start gap-1.5">
            {tel && (
              <a href={tel} className="inline-flex items-center gap-1.5 font-medium text-navy hover:underline">
                <PhoneIcon size={13} /> {s.phone}
              </a>
            )}
            {s.website_url && (
              <a
                href={s.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-navy hover:underline"
              >
                Website <ExternalLinkIcon size={12} />
              </a>
            )}
            {!tel && !s.website_url && "—"}
          </div>
        );
      },
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-separate border-spacing-0 overflow-hidden rounded-2xl border border-navy/10 bg-white text-sm sm:table-auto sm:min-w-[640px]">
        <caption className="sr-only">Side-by-side comparison of shortlisted schools</caption>
        <thead>
          <tr>
            <td className="sticky left-0 z-10 hidden w-40 border-b border-navy/10 bg-white p-4 sm:table-cell" />
            {schools.map((s) => (
              <th key={s.id} scope="col" className="border-b border-navy/10 p-3 text-left align-top font-normal sm:p-4">
                <div className="flex items-start gap-3">
                  <SchoolAvatar name={s.name} logoUrl={s.logo_url} size={40} className="hidden sm:flex" />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={schoolHref(s)}
                      className="line-clamp-2 font-serif text-base font-semibold leading-snug text-navy hover:underline"
                    >
                      {s.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => onRemove(s.id)}
                      className="mt-1 inline-flex items-center gap-1 text-xs text-navy/50 hover:text-rose-600"
                    >
                      <XIcon size={12} /> Remove from shortlist
                    </button>
                  </div>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <Fragment key={row.label}>
              {/* Phones: the label sits above the values so every school fits on screen. */}
              <tr className={cn("sm:hidden", i % 2 ? "bg-cream/50" : "bg-white")}>
                <th
                  colSpan={schools.length}
                  scope="colgroup"
                  className="px-3 pb-0 pt-3 text-left text-[11px] font-semibold uppercase tracking-wide text-navy/50"
                >
                  {row.label}
                </th>
              </tr>
              <tr className={i % 2 ? "bg-cream/50" : "bg-white"}>
                <th
                  scope="row"
                  className="sticky left-0 z-10 hidden bg-inherit p-4 text-left align-top text-xs font-semibold uppercase tracking-wide text-navy/50 sm:table-cell"
                >
                  {row.label}
                </th>
                {schools.map((s) => (
                  <td key={s.id} className="break-words px-3 pb-3 pt-1 align-top text-navy sm:p-4">
                    {row.render(s)}
                  </td>
                ))}
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
