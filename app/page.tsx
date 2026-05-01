import Link from "next/link";
import { SearchForm } from "@/components/search/SearchForm";
import { SchoolCard } from "@/components/schools/SchoolCard";
import { getFeaturedSchools, getStats } from "@/lib/data";
import { CheckIcon, StarIcon } from "@/components/ui/Icon";

export default async function HomePage() {
  const [featured, stats] = await Promise.all([
    getFeaturedSchools(6),
    getStats(),
  ]);

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-cream">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,166,35,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(10,22,40,0.04),transparent_60%)]" />
        <div className="container-page relative py-12 sm:py-16 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-navy/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-navy/70">
              <StarIcon size={12} className="text-amber" /> Free · Fast ·
              Unbiased
            </span>
            <h1 className="mt-4 font-serif text-display text-navy">
              Find and compare every school in South Africa.
            </h1>
            <p className="mt-4 text-lg text-navy/70 sm:text-xl">
              Search fees, deadlines and open days across public, Model&nbsp;C,
              private schools and universities — then apply on the school's own
              site.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-3xl sm:mt-10">
            <SearchForm />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-navy/60">
            <StatChip value={`${stats.schoolCount.toLocaleString("en-ZA")}+`} label="schools listed" />
            <span className="text-navy/20">·</span>
            <StatChip value={`${stats.provinceCount}`} label="provinces" />
            <span className="text-navy/20">·</span>
            <StatChip value="Updated" label="monthly" />
          </div>
        </div>
      </section>

      {/* ─── Value props ──────────────────────────────────────── */}
      <section className="container-page py-12 sm:py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Every school, one place",
              body: "Public, Model C, private and universities across all 9 provinces — no paywall, no bias.",
            },
            {
              title: "Never miss a deadline",
              body: "Track application deadlines and open days. We'll email you 30 and 7 days before they close.",
            },
            {
              title: "Compare side-by-side",
              body: "Shortlist up to 10 schools and compare fees, grades and curricula at a glance.",
            },
          ].map((v) => (
            <div
              key={v.title}
              className="rounded-xl border border-navy/10 bg-white p-6"
            >
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-amber/15 text-amber-700">
                <CheckIcon />
              </div>
              <h2 className="font-serif text-xl text-navy">{v.title}</h2>
              <p className="mt-2 text-navy/70">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Featured schools ────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-white">
          <div className="container-page py-12 sm:py-16">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-hero text-navy">
                  Featured schools
                </h2>
                <p className="mt-1 text-navy/70">
                  A curated look at institutions taking applications now.
                </p>
              </div>
              <Link
                href="/search"
                className="hidden shrink-0 text-sm font-medium text-navy hover:underline sm:inline"
              >
                See all →
              </Link>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((s) => (
                <SchoolCard key={s.id} school={s} />
              ))}
            </div>
            <div className="mt-6 sm:hidden">
              <Link
                href="/search"
                className="block rounded-lg border border-navy/15 py-3 text-center text-sm font-medium text-navy"
              >
                See all schools →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA band ─────────────────────────────────────────── */}
      <section className="container-page py-12 sm:py-16">
        <div className="rounded-2xl bg-navy p-8 text-cream sm:p-12">
          <div className="grid gap-6 md:grid-cols-[2fr_1fr] md:items-center">
            <div>
              <h2 className="font-serif text-hero">
                Deadlines coming up? We'll remind you.
              </h2>
              <p className="mt-2 text-cream/80">
                Sign in, shortlist the schools you care about, and we'll email
                you before each deadline closes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-amber px-5 font-medium text-navy hover:bg-amber-300"
              >
                Create free account
              </Link>
              <Link
                href="/search"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-cream/30 px-5 font-medium text-cream hover:bg-cream/10"
              >
                Browse schools
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function StatChip({ value, label }: { value: string; label: string }) {
  return (
    <span>
      <span className="font-semibold text-navy">{value}</span>{" "}
      <span>{label}</span>
    </span>
  );
}
