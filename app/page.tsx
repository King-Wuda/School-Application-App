import Link from "next/link";
import { SearchForm } from "@/components/search/SearchForm";
import { SchoolCard } from "@/components/schools/SchoolCard";
import { getAreaCounts, getFeaturedSchools, getStats } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import {
  ArrowRightIcon,
  BellIcon,
  ClipboardIcon,
  GraduationCapIcon,
  HeartIcon,
  MapPinIcon,
  SearchIcon,
  UsersIcon,
  WalletIcon,
} from "@/components/ui/Icon";

// Static page, regenerated at most hourly (and immediately after admin edits).
export const revalidate = 3600;

const AREAS = [
  {
    region: "Cape Town",
    areas: ["Bellville", "Durbanville", "Kraaifontein", "Khayelitsha", "Delft", "Milnerton", "Rondebosch", "Wynberg", "Somerset West", "Strand"],
  },
  {
    region: "Winelands, Overberg & Garden Route",
    areas: ["Stellenbosch", "Paarl", "Worcester", "Hermanus", "George", "Knysna", "Mossel Bay", "Oudtshoorn"],
  },
];

const INTENTS = [
  {
    href: "/search?grade=Grade+1",
    icon: GraduationCapIcon,
    title: "Starting Grade 1",
    body: "Primary schools that take Grade 1 learners.",
    tint: "bg-amber-100 text-amber-700",
  },
  {
    href: "/search?grade=Grade+8",
    icon: UsersIcon,
    title: "Moving to high school",
    body: "Schools with a Grade 8 intake.",
    tint: "bg-sky-100 text-sky-700",
  },
  {
    href: "/search?fees=none",
    icon: WalletIcon,
    title: "No school fees",
    body: "Public schools that don't charge fees.",
    tint: "bg-teal-100 text-teal-700",
  },
  {
    href: "/search?level=special_needs",
    icon: HeartIcon,
    title: "Special needs support",
    body: "Special needs schools and schools of skills.",
    tint: "bg-rose-100 text-rose-700",
  },
];

export default async function HomePage() {
  const [featured, stats, areaCounts] = await Promise.all([
    getFeaturedSchools(6),
    getStats(),
    getAreaCounts(AREAS.flatMap((g) => g.areas)),
  ]);

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-cream">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(60rem_30rem_at_85%_-10%,rgba(245,166,35,0.18),transparent),radial-gradient(40rem_24rem_at_0%_110%,rgba(10,22,40,0.06),transparent)]"
        />
        <div className="container-page relative pb-14 pt-10 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-navy/75 ring-1 ring-navy/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Every Western Cape school · free for parents
            </p>
            <h1 className="mt-5 font-serif text-display text-navy">
              Find the right school
              <br className="hidden sm:block" /> for your child.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-navy/70">
              Compare {formatNumber(stats.schools)} public, independent and special needs schools
              — fees, grades, distance and how to apply — in one place.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-2xl sm:mt-10">
            <SearchForm />
          </div>

          <dl className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { value: stats.primary, label: "primary schools", href: "/search?level=primary" },
              { value: stats.high, label: "high schools", href: "/search?level=high" },
              { value: stats.noFee, label: "no-fee schools", href: "/search?fees=none" },
              { value: stats.specialNeeds, label: "special needs", href: "/search?level=special_needs" },
            ].map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="rounded-2xl bg-white/70 px-4 py-3 text-center ring-1 ring-navy/10 transition hover:bg-white hover:ring-navy/20"
              >
                <dd className="font-serif text-2xl font-semibold text-navy">{formatNumber(s.value)}</dd>
                <dt className="text-xs text-navy/60">{s.label}</dt>
              </Link>
            ))}
          </dl>
        </div>
      </section>

      {/* ─── Start with what you need ─────────────────────────── */}
      <section className="container-page py-14 sm:py-20" aria-labelledby="intents">
        <h2 id="intents" className="font-serif text-hero text-navy">
          What are you looking for?
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INTENTS.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="group flex flex-col rounded-2xl border border-navy/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-navy/20 hover:shadow-card-hover"
            >
              <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${i.tint}`}>
                <i.icon size={22} />
              </span>
              <span className="mt-4 font-serif text-lg font-semibold text-navy">{i.title}</span>
              <span className="mt-1 text-sm text-navy/65">{i.body}</span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-navy">
                Show schools
                <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Browse by area ───────────────────────────────────── */}
      <section className="border-y border-navy/10 bg-white" aria-labelledby="areas">
        <div className="container-page py-14 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="areas" className="font-serif text-hero text-navy">
                Browse by area
              </h2>
              <p className="mt-2 text-navy/65">Popular places across the Western Cape.</p>
            </div>
            <Link href="/search?province=Western+Cape" className="text-sm font-medium text-navy hover:underline">
              All Western Cape schools →
            </Link>
          </div>
          <div className="mt-8 space-y-8">
            {AREAS.map((g) => (
              <div key={g.region}>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy/50">{g.region}</h3>
                <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {g.areas.map((a) => (
                    <li key={a}>
                      <Link
                        href={`/search?area=${encodeURIComponent(a)}`}
                        className="group flex items-center justify-between gap-2 rounded-xl border border-navy/10 px-4 py-3 transition hover:border-navy/25 hover:bg-cream"
                      >
                        <span className="flex min-w-0 items-center gap-2 font-medium text-navy">
                          <MapPinIcon size={15} className="shrink-0 text-navy/40 group-hover:text-amber-600" />
                          <span className="truncate">{a}</span>
                        </span>
                        {areaCounts[a] > 0 && (
                          <span className="shrink-0 text-xs text-navy/50">{areaCounts[a]}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured schools ────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="container-page py-14 sm:py-20" aria-labelledby="featured">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="featured" className="font-serif text-hero text-navy">
                Featured schools
              </h2>
              <p className="mt-2 text-navy/65">Schools with fees, deadlines and open days on SchoolFinder.</p>
            </div>
            <Link href="/search" className="text-sm font-medium text-navy hover:underline">
              See all schools →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => (
              <SchoolCard key={s.id} school={s} />
            ))}
          </div>
        </section>
      )}

      {/* ─── How it works ─────────────────────────────────────── */}
      <section className="bg-navy text-cream" aria-labelledby="how">
        <div className="container-page py-14 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <div>
              <h2 id="how" className="font-serif text-hero">
                From shortlist to first day
              </h2>
              <p className="mt-3 max-w-md leading-relaxed text-cream/70">
                Applying for Grade 1 or Grade 8? Our guide explains when to apply, where, and
                which documents you&apos;ll need — in plain language.
              </p>
              <Link
                href="/guide"
                className="mt-6 inline-flex h-12 items-center gap-2 rounded-xl bg-amber px-5 font-semibold text-navy hover:bg-amber-300"
              >
                Read the parent guide <ArrowRightIcon size={16} />
              </Link>
            </div>
            <ol className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: SearchIcon, title: "Search & shortlist", body: "Filter by grade, fees and distance. Tap the heart to save schools." },
                { icon: ClipboardIcon, title: "Compare & apply", body: "Compare side by side, then apply on the school's or province's own site." },
                { icon: BellIcon, title: "Never miss a date", body: "Get email reminders 30 and 7 days before application deadlines." },
              ].map((s, i) => (
                <li key={s.title} className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
                  <span className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber/15 text-amber">
                      <s.icon size={19} />
                    </span>
                    <span className="text-sm font-semibold text-cream/50">0{i + 1}</span>
                  </span>
                  <p className="mt-4 font-serif text-lg">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-cream/65">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ─── Reminder CTA ─────────────────────────────────────── */}
      <section className="container-page pt-14 sm:pt-20">
        <div className="flex flex-col items-start gap-6 rounded-3xl border border-navy/10 bg-white p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <h2 className="font-serif text-2xl text-navy sm:text-3xl">Keep your shortlist on every device</h2>
            <p className="mt-2 max-w-xl text-navy/65">
              A free account saves your shortlist and emails you before deadlines close. No
              spam, and we never share your details with schools.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex h-12 shrink-0 items-center rounded-xl bg-navy px-6 font-semibold text-cream hover:bg-navy/90"
          >
            Create a free account
          </Link>
        </div>
      </section>
    </>
  );
}
