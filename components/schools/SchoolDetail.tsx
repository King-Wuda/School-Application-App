import Link from "next/link";
import type { SchoolWithRelations } from "@/lib/types";
import type { School } from "@/lib/types";
import {
  SCHOOL_PHASE_LABELS,
  SCHOOL_TYPE_BADGE_CLASSES,
  SCHOOL_TYPE_LABELS,
} from "@/lib/types";
import { SchoolAvatar } from "@/components/ui/SchoolAvatar";
import { Badge } from "@/components/ui/Badge";
import { ShortlistButton } from "@/components/shortlist/ShortlistButton";
import { DeadlineCard } from "@/components/schools/DeadlineCard";
import { OpenDayCard } from "@/components/schools/OpenDayCard";
import { TrackView } from "@/components/schools/TrackView";
import {
  ExternalLinkIcon,
  MapPinIcon,
  StarIcon,
} from "@/components/ui/Icon";
import { absoluteUrl, formatGradeRange, formatSchoolFees } from "@/lib/utils";

interface Props {
  school: SchoolWithRelations;
  basePath: "/schools" | "/universities";
}

/** Plain-language summary used when a school has no hand-written description. */
export function describeSchool(school: School): string {
  const kind = school.special_needs
    ? "special needs school"
    : school.phase
      ? SCHOOL_PHASE_LABELS[school.phase].split(" (")[0].toLowerCase()
      : "school";
  const sector = { public: "public", model_c: "Model C", private: "independent", university: "university" }[
    school.type
  ];
  const where = [school.suburb, school.town !== school.suburb ? school.town : null, school.province]
    .filter(Boolean)
    .join(", ");
  const size = school.learner_count
    ? ` It has about ${school.learner_count.toLocaleString("en-ZA")} learners${
        school.educator_count ? ` and ${school.educator_count.toLocaleString("en-ZA")} educators` : ""
      }.`
    : "";
  const fees = school.no_fee_school ? " It is a no-fee school." : "";
  return `${school.name} is ${/^[aeiou]/i.test(sector) ? "an" : "a"} ${sector} ${kind} in ${where}.${size}${fees}`;
}

export function SchoolDetail({ school, basePath }: Props) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type":
      school.type === "university"
        ? "CollegeOrUniversity"
        : "EducationalOrganization",
    name: school.name,
    url: school.website_url ?? absoluteUrl(`${basePath}/${school.slug}`),
    ...(school.logo_url ? { logo: school.logo_url } : {}),
    address: school.address
      ? {
          "@type": "PostalAddress",
          streetAddress: school.address,
          addressLocality: school.suburb ?? undefined,
          addressRegion: school.province,
          addressCountry: "ZA",
        }
      : undefined,
    ...(school.latitude != null && school.longitude != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: school.latitude,
            longitude: school.longitude,
          },
        }
      : {}),
    description: school.description ?? describeSchool(school),
    ...(school.phone ? { telephone: school.phone } : {}),
  };

  const mapSrc =
    school.latitude != null && school.longitude != null
      ? `https://www.google.com/maps?q=${school.latitude},${school.longitude}&z=15&output=embed`
      : school.address
        ? `https://www.google.com/maps?q=${encodeURIComponent(school.address)}&z=15&output=embed`
        : null;

  const parentCrumb =
    basePath === "/universities"
      ? { href: "/search?type=university", label: "Universities" }
      : { href: "/search", label: "Schools" };

  return (
    <article className="container-page py-6 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrackView schoolId={school.id} />

      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-navy/60">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link href={parentCrumb.href} className="hover:underline">
              {parentCrumb.label}
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="truncate text-navy">{school.name}</li>
        </ol>
      </nav>

      <header className="rounded-2xl border border-navy/10 bg-white p-5 sm:p-8">
        <div className="flex flex-wrap items-start gap-4 sm:gap-6">
          <SchoolAvatar name={school.name} logoUrl={school.logo_url} size={72} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={SCHOOL_TYPE_BADGE_CLASSES[school.type]}>
                {SCHOOL_TYPE_LABELS[school.type]}
              </Badge>
              {school.phase && (
                <Badge className="bg-navy/5 text-navy/70">
                  {SCHOOL_PHASE_LABELS[school.phase]}
                </Badge>
              )}
              {school.is_featured && (
                <Badge className="bg-amber/20 text-amber-700">
                  <StarIcon size={12} /> Featured
                </Badge>
              )}
              <span className="text-xs text-navy/40">No ratings yet</span>
            </div>
            <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight text-navy sm:text-4xl">
              {school.name}
            </h1>
            {school.address && (
              <p className="mt-2 flex items-start gap-1 text-navy/70">
                <MapPinIcon size={16} className="mt-0.5 shrink-0" />
                <span>{school.address}</span>
              </p>
            )}
          </div>
          <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-col lg:flex-row">
            <ShortlistButton schoolId={school.id} variant="full" />
            {school.website_url && (
              <a
                href={school.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-navy px-4 text-sm font-medium text-cream hover:bg-navy/90"
              >
                Visit website <ExternalLinkIcon size={14} />
              </a>
            )}
          </div>
        </div>

        <dl className="mt-6 grid gap-x-6 gap-y-3 border-t border-navy/10 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          <Info
            label="Monthly fees"
            value={formatSchoolFees(school)}
          />
          <Info
            label="Grades offered"
            value={formatGradeRange(school.grades_from, school.grades_to)}
          />
          <Info
            label="Language of instruction"
            value={school.language ?? "Not listed"}
          />
          <Info label="Boarding" value={school.boarding ? "Yes" : "No"} />
          <Info label="Curriculum" value={school.curriculum ?? "Not listed"} />
          <Info
            label="Location"
            value={[school.suburb, school.town !== school.suburb ? school.town : null, school.province]
              .filter(Boolean)
              .join(", ")}
          />
        </dl>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 font-serif text-2xl text-navy">
              Application deadlines
            </h2>
            {school.deadlines.length === 0 ? (
              <div className="rounded-xl border border-dashed border-navy/15 bg-white p-6 text-navy/70">
                Deadline not confirmed — check school website.
              </div>
            ) : (
              <div className="space-y-4">
                {school.deadlines.map((d) => (
                  <DeadlineCard
                    key={d.id}
                    deadline={d}
                    schoolName={school.name}
                  />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-serif text-2xl text-navy">Open days</h2>
            {school.open_days.length === 0 ? (
              <p className="rounded-xl border border-dashed border-navy/15 bg-white p-6 text-navy/70">
                No open days listed. Contact the school directly.
              </p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {school.open_days.map((o) => (
                  <OpenDayCard key={o.id} openDay={o} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 font-serif text-2xl text-navy">About</h2>
            <div className="rounded-xl border border-navy/10 bg-white p-5">
              <p className="text-navy/80">
                {school.description ?? describeSchool(school)}
              </p>
              {school.extracurriculars && school.extracurriculars.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-navy/50">
                    Extracurriculars
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {school.extracurriculars.map((tag) => (
                      <li key={tag}>
                        <Badge className="bg-navy/5 text-navy">{tag}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {school.curriculum && (
                <p className="mt-4 text-sm text-navy/70">
                  <span className="font-semibold text-navy">Affiliation: </span>
                  {school.curriculum}
                </p>
              )}
            </div>
          </section>

          {school.emis_number != null && (
            <section>
              <h2 className="mb-3 font-serif text-2xl text-navy">
                Official school information
              </h2>
              <div className="rounded-xl border border-navy/10 bg-white p-5">
                <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  <Info label="EMIS number" value={String(school.emis_number)} />
                  <Info
                    label="Sector"
                    value={school.type === "private" ? "Independent" : "Public"}
                  />
                  {school.phone && <Info label="Telephone" value={school.phone} />}
                  {school.district && <Info label="Education district" value={school.district} />}
                  {school.quintile != null && (
                    <Info label="Quintile" value={`Quintile ${school.quintile} of 5`} />
                  )}
                  {school.no_fee_school != null && (
                    <Info
                      label="Fee status"
                      value={school.no_fee_school ? "No-fee school" : "Fee-charging"}
                    />
                  )}
                  {school.learner_count != null && (
                    <Info label="Learners" value={school.learner_count.toLocaleString("en-ZA")} />
                  )}
                  {school.educator_count != null && (
                    <Info label="Educators" value={school.educator_count.toLocaleString("en-ZA")} />
                  )}
                </dl>
                {school.data_source && (
                  <p className="mt-4 text-xs text-navy/50">
                    Source: Department of Basic Education, {school.data_source.replace(/^DBE /, "")}.
                    Always confirm details with the school.
                  </p>
                )}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {mapSrc && (
            <div className="overflow-hidden rounded-xl border border-navy/10 bg-white">
              <iframe
                title={`${school.name} location`}
                src={mapSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-64 w-full border-0"
              />
              {school.address && (
                <div className="p-4 text-sm text-navy/70">
                  <p className="font-medium text-navy">{school.name}</p>
                  <p>{school.address}</p>
                  <a
                    href={`https://www.google.com/maps?q=${encodeURIComponent(school.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-navy hover:underline"
                  >
                    Open in Google Maps <ExternalLinkIcon size={12} />
                  </a>
                </div>
              )}
            </div>
          )}
          <div className="rounded-xl bg-navy p-5 text-cream">
            <p className="font-serif text-lg">Comparing schools?</p>
            <p className="mt-1 text-sm text-cream/80">
              Add up to three schools to your shortlist and view them
              side-by-side.
            </p>
            <Link
              href="/compare"
              className="mt-3 inline-flex h-10 items-center rounded-lg bg-amber px-4 text-sm font-medium text-navy hover:bg-amber-300"
            >
              Open compare →
            </Link>
          </div>
        </aside>
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-navy/50">{label}</dt>
      <dd className="mt-0.5 font-medium text-navy">{value || "—"}</dd>
    </div>
  );
}
