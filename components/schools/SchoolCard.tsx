import Link from "next/link";
import type { School } from "@/lib/types";
import { SCHOOL_TYPE_BADGE_CLASSES, SCHOOL_TYPE_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { SchoolAvatar } from "@/components/ui/SchoolAvatar";
import { ShortlistButton } from "@/components/shortlist/ShortlistButton";
import { formatDistance, formatGradeRange, formatGradeShort, formatSchoolFees } from "@/lib/utils";
import { ArrowRightIcon, ExternalLinkIcon, MapPinIcon, StarIcon } from "@/components/ui/Icon";
import { DistanceBadge } from "./DistanceBadge";

interface Props {
  school: School;
  showFeatured?: boolean;
}

export function schoolHref(school: Pick<School, "type" | "slug">) {
  return school.type === "university" ? `/universities/${school.slug}` : `/schools/${school.slug}`;
}

export function schoolPlace(school: Pick<School, "suburb" | "town" | "province">) {
  return [school.suburb, school.town && school.town !== school.suburb ? school.town : null, school.province]
    .filter(Boolean)
    .join(", ");
}

/** Short level label for badges: "Primary", "High school", … */
const SHORT_PHASE: Record<NonNullable<School["phase"]>, string> = {
  primary: "Primary",
  secondary: "High school",
  combined: "Primary & high",
  intermediate: "Primary & Gr 8–9",
  special_needs: "Special needs",
  school_of_skills: "School of skills",
};

export function phaseLabel(school: Pick<School, "phase" | "special_needs">): string | null {
  if (school.special_needs) return "Special needs";
  return school.phase ? SHORT_PHASE[school.phase] : null;
}

export function SchoolCard({ school, showFeatured = true }: Props) {
  const href = schoolHref(school);
  const grades = formatGradeShort(school.grades_from, school.grades_to);
  const level = phaseLabel(school);
  const fees = formatSchoolFees(school, { compact: true });

  return (
    <article className="group relative flex min-w-0 flex-col rounded-2xl border border-navy/10 bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:border-navy/20 hover:shadow-card-hover sm:p-5">
      <div className="flex items-start gap-3.5">
        <SchoolAvatar name={school.name} logoUrl={school.logo_url} size={52} />
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-[1.075rem] font-semibold leading-snug text-navy">
            <Link
              href={href}
              className="line-clamp-2 outline-none after:absolute after:inset-0 after:rounded-2xl after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-amber"
            >
              {school.name}
            </Link>
          </h3>
          <p className="mt-1 flex items-center gap-1 text-sm text-navy/60">
            <MapPinIcon size={14} className="shrink-0" />
            <span className="truncate">{schoolPlace(school)}</span>
          </p>
        </div>
        <div className="relative z-10 -mr-1 -mt-1 shrink-0">
          <ShortlistButton schoolId={school.id} schoolName={school.name} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge className={SCHOOL_TYPE_BADGE_CLASSES[school.type]}>
          {school.type === "private" ? "Independent" : SCHOOL_TYPE_LABELS[school.type]}
        </Badge>
        {level && <Badge className="bg-navy/[0.06] text-navy/80">{level}</Badge>}
        {school.no_fee_school && <Badge className="bg-teal-50 text-teal-800">No fees</Badge>}
        {showFeatured && school.is_featured && (
          <Badge className="bg-amber-50 text-amber-700">
            <StarIcon size={11} /> Featured
          </Badge>
        )}
        {school.distance_km != null ? (
          <Badge className="bg-navy text-cream">
            <MapPinIcon size={11} /> {formatDistance(school.distance_km)}
          </Badge>
        ) : (
          <DistanceBadge lat={school.latitude ?? null} lng={school.longitude ?? null} />
        )}
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-cream px-3.5 py-3 text-sm">
        <div className="min-w-0">
          <dt className="text-xs text-navy/55">Fees</dt>
          <dd
            className={
              fees === "Fees not listed" ? "mt-0.5 text-navy/50" : "mt-0.5 font-medium text-navy"
            }
          >
            {fees}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-xs text-navy/55">Grades</dt>
          <dd
            className="mt-0.5 font-medium text-navy"
            title={formatGradeRange(school.grades_from, school.grades_to)}
          >
            {grades ?? <span className="font-normal text-navy/50">Not listed</span>}
          </dd>
        </div>
      </dl>

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="inline-flex items-center gap-1 text-sm font-medium text-navy">
          View school
          <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-0.5" />
        </span>
        {school.website_url && (
          <a
            href={school.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-navy/70 hover:bg-navy/5 hover:text-navy"
          >
            Website <ExternalLinkIcon size={13} />
          </a>
        )}
      </div>
    </article>
  );
}
