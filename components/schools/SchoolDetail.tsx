import Link from "next/link";
import type { School, SchoolWithRelations } from "@/lib/types";
import { SCHOOL_PHASE_LABELS, SCHOOL_TYPE_BADGE_CLASSES, SCHOOL_TYPE_LABELS } from "@/lib/types";
import { SchoolAvatar } from "@/components/ui/SchoolAvatar";
import { Badge } from "@/components/ui/Badge";
import { ShortlistButton } from "@/components/shortlist/ShortlistButton";
import { DeadlineCard } from "@/components/schools/DeadlineCard";
import { OpenDayCard } from "@/components/schools/OpenDayCard";
import { TrackView } from "@/components/schools/TrackView";
import { phaseLabel, schoolHref, schoolPlace } from "@/components/schools/SchoolCard";
import {
  ArrowRightIcon,
  ClipboardIcon,
  ExternalLinkIcon,
  GlobeIcon,
  InfoIcon,
  MapPinIcon,
  NavigationIcon,
  PhoneIcon,
  StarIcon,
} from "@/components/ui/Icon";
import {
  absoluteUrl,
  directionsUrl,
  formatDistance,
  formatGradeRange,
  formatNumber,
  formatSchoolFees,
  telHref,
  todayInSa,
} from "@/lib/utils";

interface Props {
  school: SchoolWithRelations;
  basePath: "/schools" | "/universities";
  nearby?: School[];
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
  const size = school.learner_count
    ? ` It has about ${formatNumber(school.learner_count)} learners${
        school.educator_count ? ` and ${formatNumber(school.educator_count)} educators` : ""
      }.`
    : "";
  const fees = school.no_fee_school ? " It is a no-fee school." : "";
  return `${school.name} is ${/^[aeiou]/i.test(sector) ? "an" : "a"} ${sector} ${kind} in ${schoolPlace(school)}.${size}${fees}`;
}

const PORTALS: Record<string, { name: string; href: string }> = {
  "Western Cape": { name: "WCED online admissions", href: "https://admissions.westerncape.gov.za" },
  Gauteng: { name: "GDE online admissions", href: "https://www.gdeadmissions.gov.za" },
};

export function SchoolDetail({ school, basePath, nearby = [] }: Props) {
  const isUni = school.type === "university";
  const phone = telHref(school.phone);
  const directions = directionsUrl(school);
  const level = phaseLabel(school);
  const ratio =
    school.learner_count && school.educator_count
      ? Math.round(school.learner_count / school.educator_count)
      : null;
  const today = todayInSa();
  const upcomingDeadlines = school.deadlines
    .filter((d) => !d.close_date || d.close_date >= today)
    .sort((a, b) => (a.close_date ?? "9999").localeCompare(b.close_date ?? "9999"));
  const pastDeadlines = school.deadlines.filter((d) => d.close_date && d.close_date < today);
  const openDays = school.open_days.filter((o) => o.event_date >= today);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": isUni ? "CollegeOrUniversity" : "School",
    name: school.name,
    url: school.website_url ?? absoluteUrl(`${basePath}/${school.slug}`),
    ...(school.logo_url ? { logo: school.logo_url } : {}),
    ...(school.phone ? { telephone: school.phone } : {}),
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
      ? { geo: { "@type": "GeoCoordinates", latitude: school.latitude, longitude: school.longitude } }
      : {}),
    description: school.description ?? describeSchool(school),
  };

  const facts: { label: string; value: string; hint?: string }[] = [];
  facts.push({
    label: "Monthly fees",
    value: formatSchoolFees(school),
    hint:
      school.fee_monthly_min == null && school.fee_monthly_max == null && !school.no_fee_school && !isUni
        ? "Ask the school for its current fees."
        : undefined,
  });
  if (school.grades_from || school.grades_to)
    facts.push({ label: "Grades", value: formatGradeRange(school.grades_from, school.grades_to) });
  if (school.learner_count) facts.push({ label: "Learners", value: formatNumber(school.learner_count) });
  if (ratio) facts.push({ label: "Learners per educator", value: `About ${ratio}`, hint: "All teaching staff, not class size." });
  if (school.language) facts.push({ label: "Language of teaching", value: school.language });
  if (school.curriculum) facts.push({ label: "Curriculum", value: school.curriculum });
  if (school.boarding) facts.push({ label: "Boarding", value: "Available" });

  return (
    <article className="pb-24 md:pb-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TrackView schoolId={school.id} slug={school.slug} name={school.name} />

      {/* ─── Header ─────────────────────────────────────────── */}
      <header className="border-b border-navy/10 bg-white">
        <div className="container-page py-6 sm:py-10">
          <nav aria-label="Breadcrumb" className="mb-5 text-sm text-navy/55">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-navy hover:underline">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={isUni ? "/search?type=university" : "/search"}
                  className="hover:text-navy hover:underline"
                >
                  {isUni ? "Universities" : "Schools"}
                </Link>
              </li>
              {(school.town || school.suburb) && !isUni && (
                <>
                  <li aria-hidden>/</li>
                  <li>
                    <Link
                      href={`/search?area=${encodeURIComponent((school.town ?? school.suburb)!)}`}
                      className="hover:text-navy hover:underline"
                    >
                      {school.town ?? school.suburb}
                    </Link>
                  </li>
                </>
              )}
            </ol>
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 gap-4 sm:gap-5">
              <SchoolAvatar name={school.name} logoUrl={school.logo_url} size={72} className="hidden sm:flex" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge className={SCHOOL_TYPE_BADGE_CLASSES[school.type]}>
                    {school.type === "private" ? "Independent" : SCHOOL_TYPE_LABELS[school.type]}
                  </Badge>
                  {level && <Badge className="bg-navy/[0.06] text-navy/80">{level}</Badge>}
                  {school.no_fee_school && <Badge className="bg-teal-50 text-teal-800">No fees</Badge>}
                  {school.is_featured && (
                    <Badge className="bg-amber-50 text-amber-700">
                      <StarIcon size={11} /> Featured
                    </Badge>
                  )}
                </div>
                <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight text-navy sm:text-4xl">
                  {school.name}
                </h1>
                <p className="mt-2 flex items-start gap-1.5 text-navy/65">
                  <MapPinIcon size={17} className="mt-0.5 shrink-0" />
                  <span>{school.address ?? schoolPlace(school)}</span>
                </p>
              </div>
            </div>

            <div className="hidden flex-wrap gap-2 md:flex lg:max-w-sm lg:justify-end">
              <ShortlistButton schoolId={school.id} schoolName={school.name} variant="full" />
              {phone && (
                <a
                  href={phone}
                  data-track="phone"
                  data-school={school.slug}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 text-sm font-medium text-navy hover:bg-cream"
                >
                  <PhoneIcon size={16} /> {school.phone}
                </a>
              )}
              {directions && (
                <a
                  href={directions}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="directions"
                  data-school={school.slug}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 text-sm font-medium text-navy hover:bg-cream"
                >
                  <NavigationIcon size={16} /> Directions
                </a>
              )}
              {school.website_url && (
                <a
                  href={school.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-track="website"
                  data-school={school.slug}
                  className="inline-flex h-11 items-center gap-2 rounded-xl bg-navy px-4 text-sm font-semibold text-cream hover:bg-navy/90"
                >
                  Visit website <ExternalLinkIcon size={14} />
                </a>
              )}
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-px overflow-hidden rounded-2xl border border-navy/10 bg-navy/10">
            {facts.map((f) => (
              <div key={f.label} className="bg-cream/60 p-4">
                <dt className="text-xs text-navy/55">{f.label}</dt>
                <dd className="mt-1 font-semibold text-navy">{f.value}</dd>
                {f.hint && <dd className="mt-0.5 text-xs text-navy/50">{f.hint}</dd>}
              </div>
            ))}
          </dl>
        </div>
      </header>

      <div className="container-page py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-10">
          <div className="min-w-0 space-y-10">
            {/* ─── How to apply ───────────────────────────────── */}
            <section aria-labelledby="apply">
              <h2 id="apply" className="font-serif text-2xl text-navy">
                How to apply
              </h2>
              {upcomingDeadlines.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {upcomingDeadlines.map((d) => (
                    <DeadlineCard key={d.id} deadline={d} schoolName={school.name} />
                  ))}
                </div>
              ) : (
                <ApplyGuidance school={school} phone={phone} hasPastDates={pastDeadlines.length > 0} />
              )}
              {upcomingDeadlines.length === 0 && pastDeadlines.length > 0 && (
                <details className="group mt-4 rounded-2xl border border-navy/10 bg-white">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-medium text-navy [&::-webkit-details-marker]:hidden">
                    Last round&apos;s dates, for reference
                    <span aria-hidden className="text-navy/40 transition-transform group-open:rotate-180">▾</span>
                  </summary>
                  <div className="space-y-3 border-t border-navy/10 p-4">
                    {pastDeadlines.map((d) => (
                      <DeadlineCard key={d.id} deadline={d} schoolName={school.name} />
                    ))}
                  </div>
                </details>
              )}
              {!isUni && (
                <Link
                  href="/guide#documents"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-navy hover:underline"
                >
                  <ClipboardIcon size={16} className="text-navy/50" /> Documents you&apos;ll need to apply
                  <ArrowRightIcon size={14} />
                </Link>
              )}
            </section>

            {openDays.length > 0 && (
              <section aria-labelledby="open-days">
                <h2 id="open-days" className="font-serif text-2xl text-navy">
                  Open days
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {openDays.map((o) => (
                    <OpenDayCard key={o.id} openDay={o} />
                  ))}
                </div>
              </section>
            )}

            <section aria-labelledby="about">
              <h2 id="about" className="font-serif text-2xl text-navy">
                About {isUni ? "the university" : "the school"}
              </h2>
              <div className="mt-4 rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
                <p className="leading-relaxed text-navy/80">{school.description ?? describeSchool(school)}</p>
                {school.extracurriculars && school.extracurriculars.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/50">
                      Sport & activities
                    </p>
                    <ul className="flex flex-wrap gap-1.5">
                      {school.extracurriculars.map((tag) => (
                        <li key={tag}>
                          <Badge className="bg-cream text-navy">{tag}</Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            {school.emis_number != null && <OfficialInfo school={school} />}

            {nearby.length > 0 && (
              <section aria-labelledby="nearby">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <h2 id="nearby" className="font-serif text-2xl text-navy">
                    Other schools nearby
                  </h2>
                  <Link
                    href={`/search?near=${school.latitude!.toFixed(3)},${school.longitude!.toFixed(3)}&radius=5`}
                    className="text-sm font-medium text-navy hover:underline"
                  >
                    See all nearby →
                  </Link>
                </div>
                <ul className="mt-4 divide-y divide-navy/10 overflow-hidden rounded-2xl border border-navy/10 bg-white">
                  {nearby.map((n) => (
                    <li key={n.id}>
                      <Link
                        href={schoolHref(n)}
                        className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-cream"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-navy group-hover:underline">{n.name}</p>
                          <p className="mt-0.5 truncate text-sm text-navy/55">
                            {[
                              n.type === "private" ? "Independent" : SCHOOL_TYPE_LABELS[n.type],
                              phaseLabel(n),
                              formatSchoolFees(n, { compact: true }),
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        {n.distance_km != null && (
                          <span className="shrink-0 text-sm text-navy/60">
                            {formatDistance(n.distance_km).replace(" away", "")}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* ─── Sidebar ───────────────────────────────────────── */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <LocationCard school={school} directions={directions} />
            <div className="rounded-2xl border border-navy/10 bg-white p-5">
              <h2 className="font-serif text-lg text-navy">Contact</h2>
              <ul className="mt-3 space-y-3 text-sm">
                {school.phone && (
                  <li className="flex items-center gap-3">
                    <PhoneIcon size={16} className="shrink-0 text-navy/45" />
                    <a href={phone ?? undefined} data-track="phone" data-school={school.slug} className="font-medium text-navy hover:underline">
                      {school.phone}
                    </a>
                  </li>
                )}
                {school.website_url && (
                  <li className="flex items-center gap-3">
                    <GlobeIcon size={16} className="shrink-0 text-navy/45" />
                    <a
                      href={school.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                  data-track="website"
                  data-school={school.slug}
                      className="truncate font-medium text-navy hover:underline"
                    >
                      {school.website_url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                    </a>
                  </li>
                )}
                {!school.phone && !school.website_url && (
                  <li className="text-navy/60">
                    We don&apos;t have contact details for this school yet. The district office can help.
                  </li>
                )}
              </ul>
            </div>
            <div className="rounded-2xl bg-navy p-5 text-cream">
              <p className="font-serif text-lg">Weighing up options?</p>
              <p className="mt-1 text-sm leading-relaxed text-cream/75">
                Save this school, then compare fees, grades and distance side by side.
              </p>
              <Link
                href="/compare"
                className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-lg bg-amber px-4 text-sm font-semibold text-navy hover:bg-amber-300"
              >
                Compare schools <ArrowRightIcon size={14} />
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* ─── Mobile action bar ─────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-navy/10 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
        <div className="flex gap-2">
          <ShortlistButton schoolId={school.id} schoolName={school.name} variant="full" className="flex-1 px-2" />
          {phone && (
            <a
              href={phone}
              data-track="phone"
              data-school={school.slug}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-navy/15 text-sm font-medium text-navy"
            >
              <PhoneIcon size={16} /> Call
            </a>
          )}
          {directions && (
            <a
              href={directions}
              target="_blank"
              rel="noopener noreferrer"
                  data-track="directions"
                  data-school={school.slug}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-navy/15 text-sm font-medium text-navy"
            >
              <NavigationIcon size={16} /> Directions
            </a>
          )}
          {school.website_url && (
            <a
              href={school.website_url}
              target="_blank"
              rel="noopener noreferrer"
                  data-track="website"
                  data-school={school.slug}
              className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-navy text-sm font-semibold text-cream"
            >
              Website
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function ApplyGuidance({
  school,
  phone,
  hasPastDates,
}: {
  school: School;
  phone: string | null;
  hasPastDates?: boolean;
}) {
  const portal = PORTALS[school.province];
  const isPublic = school.type === "public" || school.type === "model_c";

  let body: React.ReactNode;
  if (school.type === "university") {
    body = <p>Apply through the university&apos;s own online application portal. Check its website for closing dates.</p>;
  } else if (isPublic && portal) {
    body = (
      <p>
        Applications for <strong>Grade 1</strong> and <strong>Grade 8</strong> at {school.province} public
        schools go through the {portal.name} website, usually early in the year before your child
        starts. For other grades, contact the school directly.
      </p>
    );
  } else if (isPublic) {
    body = (
      <p>
        Apply directly to the school, usually during the year before your child starts. Ask for the
        school&apos;s admission policy and closing date.
      </p>
    );
  } else {
    body = (
      <p>
        Independent schools run their own admissions. Many open applications a year or more ahead
        and keep waiting lists, so contact the school early and ask about assessments and
        application fees.
      </p>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
      <div className="flex gap-3 text-navy/80">
        <InfoIcon size={20} className="mt-0.5 shrink-0 text-amber-600" />
        <div className="leading-relaxed">
          {body}
          <p className="mt-2 text-sm text-navy/55">
            {hasPastDates
              ? "This school's last application round has closed. Next year's dates haven't been announced here yet."
              : "We don't have this school's exact dates yet — confirm them with the school."}
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {isPublic && portal && (
          <a
            href={portal.href}
            target="_blank"
            rel="noopener noreferrer"
            data-track="admissions_portal"
            data-school={school.slug}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-navy px-4 text-sm font-semibold text-cream hover:bg-navy/90"
          >
            Open {portal.name} <ExternalLinkIcon size={14} />
          </a>
        )}
        {school.website_url && (
          <a
            href={school.website_url}
            target="_blank"
            rel="noopener noreferrer"
                  data-track="website"
                  data-school={school.slug}
            className={
              isPublic && portal
                ? "inline-flex h-10 items-center gap-2 rounded-lg border border-navy/15 px-4 text-sm font-medium text-navy hover:bg-cream"
                : "inline-flex h-10 items-center gap-2 rounded-lg bg-navy px-4 text-sm font-semibold text-cream hover:bg-navy/90"
            }
          >
            School website <ExternalLinkIcon size={14} />
          </a>
        )}
        {phone && (
          <a
            href={phone}
            data-track="phone"
            data-school={school.slug}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-navy/15 px-4 text-sm font-medium text-navy hover:bg-cream"
          >
            <PhoneIcon size={15} /> Call {school.phone}
          </a>
        )}
      </div>
    </div>
  );
}

function OfficialInfo({ school }: { school: School }) {
  const rows: { label: string; value: string; hint?: string }[] = [
    { label: "Sector", value: school.type === "private" ? "Independent (private)" : "Public" },
  ];
  if (school.no_fee_school != null)
    rows.push({ label: "Fee status", value: school.no_fee_school ? "No-fee school" : "Fee-charging" });
  if (school.quintile != null)
    rows.push({
      label: "Quintile",
      value: `${school.quintile} of 5`,
      hint: "Based on how poor the surrounding community is — not a measure of school quality.",
    });
  if (school.district) rows.push({ label: "Education district", value: school.district });
  if (school.educator_count) rows.push({ label: "Educators", value: formatNumber(school.educator_count) });
  if (school.urban_rural) rows.push({ label: "Area", value: school.urban_rural });
  rows.push({ label: "EMIS number", value: String(school.emis_number), hint: "The department's ID for this school." });

  return (
    <section aria-labelledby="official">
      <h2 id="official" className="font-serif text-2xl text-navy">
        Official information
      </h2>
      <div className="mt-4 rounded-2xl border border-navy/10 bg-white">
        <dl className="divide-y divide-navy/10">
          {rows.map((r) => (
            <div key={r.label} className="grid gap-1 px-5 py-3.5 sm:grid-cols-[180px_1fr] sm:gap-4">
              <dt className="text-sm text-navy/55">{r.label}</dt>
              <dd className="text-sm">
                <span className="font-medium text-navy">{r.value}</span>
                {r.hint && <span className="mt-0.5 block text-xs text-navy/50">{r.hint}</span>}
              </dd>
            </div>
          ))}
        </dl>
        {school.data_source && (
          <p className="border-t border-navy/10 px-5 py-3 text-xs text-navy/50">
            Source: Department of Basic Education, {school.data_source.replace(/^DBE /, "")}.{" "}
            <Link href="/guide#faq" className="underline">
              What do these mean?
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}

function LocationCard({ school, directions }: { school: School; directions: string | null }) {
  const hasCoords = school.latitude != null && school.longitude != null;
  const mapSrc = hasCoords
    ? `https://www.google.com/maps?q=${school.latitude},${school.longitude}&z=15&output=embed`
    : school.address
      ? `https://www.google.com/maps?q=${encodeURIComponent(`${school.name}, ${school.address}`)}&z=15&output=embed`
      : null;
  if (!mapSrc) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white">
      <iframe
        title={`Map showing ${school.name}`}
        src={mapSrc}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-56 w-full border-0 bg-cream"
      />
      <div className="p-5">
        <h2 className="font-serif text-lg text-navy">Location</h2>
        <p className="mt-1 text-sm leading-relaxed text-navy/70">{school.address ?? schoolPlace(school)}</p>
        {directions && (
          <a
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
                  data-track="directions"
                  data-school={school.slug}
            className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg border border-navy/15 px-4 text-sm font-medium text-navy hover:bg-cream"
          >
            <NavigationIcon size={15} /> Get directions
          </a>
        )}
      </div>
    </div>
  );
}
