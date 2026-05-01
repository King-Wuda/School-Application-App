import Link from "next/link";
import type { School } from "@/lib/types";
import { SCHOOL_TYPE_BADGE_CLASSES, SCHOOL_TYPE_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { SchoolAvatar } from "@/components/ui/SchoolAvatar";
import { ShortlistButton } from "@/components/shortlist/ShortlistButton";
import { formatFeeRange, formatGradeRange } from "@/lib/utils";
import { ExternalLinkIcon, MapPinIcon, StarIcon } from "@/components/ui/Icon";
import { DistanceBadge } from "./DistanceBadge";

interface Props {
  school: School;
  showFeatured?: boolean;
}

export function SchoolCard({ school, showFeatured = true }: Props) {
  const detailHref =
    school.type === "university"
      ? `/universities/${school.slug}`
      : `/schools/${school.slug}`;

  return (
    <article className="group relative flex flex-col rounded-xl border border-navy/10 bg-white p-4 shadow-card transition-shadow hover:shadow-card-hover sm:p-5">
      <div className="flex items-start gap-4">
        <SchoolAvatar name={school.name} logoUrl={school.logo_url} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <Link
                href={detailHref}
                className="block truncate font-serif text-lg font-semibold leading-tight text-navy hover:underline"
              >
                {school.name}
              </Link>
              <p className="mt-0.5 flex items-center gap-1 text-sm text-navy/60">
                <MapPinIcon size={14} />
                <span className="truncate">
                  {[school.suburb, school.province].filter(Boolean).join(", ")}
                </span>
              </p>
            </div>
            <div className="shrink-0">
              <ShortlistButton schoolId={school.id} />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge className={SCHOOL_TYPE_BADGE_CLASSES[school.type]}>
              {SCHOOL_TYPE_LABELS[school.type]}
            </Badge>
            {showFeatured && school.is_featured && (
              <Badge className="bg-amber/20 text-amber-700">
                <StarIcon size={12} /> Featured
              </Badge>
            )}
            <DistanceBadge
              lat={school.latitude ?? null}
              lng={school.longitude ?? null}
            />
          </div>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-navy/50">Fees</dt>
          <dd className="mt-0.5 font-medium text-navy">
            {school.type === "university"
              ? "See website"
              : formatFeeRange(school.fee_monthly_min, school.fee_monthly_max)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-navy/50">
            Grades
          </dt>
          <dd className="mt-0.5 font-medium text-navy">
            {formatGradeRange(school.grades_from, school.grades_to)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center justify-between border-t border-navy/5 pt-3">
        <span className="text-xs text-navy/40">No ratings yet</span>
        <div className="flex items-center gap-2">
          <Link
            href={detailHref}
            className="inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium text-navy hover:bg-navy/5"
          >
            View details
          </Link>
          {school.website_url && (
            <a
              href={school.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1 rounded-md bg-navy px-3 text-sm font-medium text-cream hover:bg-navy/90"
            >
              Visit site <ExternalLinkIcon size={14} />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
