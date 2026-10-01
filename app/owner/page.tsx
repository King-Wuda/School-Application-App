import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { checkOwner } from "@/lib/owner";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { cn, formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Site analytics", robots: { index: false, follow: false } };

const RANGES = [
  { days: 1, label: "24 hours" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

interface Summary {
  totals: Record<string, number | null>;
  funnel: { visited: number; searched: number; viewed_school: number; saved: number; contacted: number };
  daily: { day: string; sessions: number; page_views: number }[];
  sources: { source: string; sessions: number }[];
  campaigns: { campaign: string; sessions: number }[];
  devices: { device: string; sessions: number }[];
  top_searches: { term: string; count: number; zero: number }[];
  zero_result_terms: { term: string; count: number }[];
  filters: { filter: string; count: number }[];
  top_schools: { slug: string; name: string | null; views: number }[];
  outbound: { kind: string; count: number }[];
  pages: { path: string; views: number }[];
  feedback: { id: number; created_at: string; rating: number | null; message: string | null; email: string | null; path: string | null; device: string | null }[];
}

const OUTBOUND_LABELS: Record<string, string> = {
  website: "Opened school website",
  phone: "Tapped to call",
  directions: "Got directions",
  admissions_portal: "Opened admissions portal",
  apply: "Clicked apply link",
};

export default async function OwnerPage({ searchParams }: { searchParams: { days?: string } }) {
  const owner = await checkOwner();
  if (owner.status === "signed-out") redirect("/login?next=/owner");
  if (owner.status === "denied") notFound();
  if (owner.status === "not-configured") {
    return (
      <div className="container-page max-w-xl py-20 text-center">
        <h1 className="font-serif text-3xl text-navy">Analytics isn&apos;t set up yet</h1>
        <p className="mt-3 text-navy/65">See “Owner analytics” in UPDATE.md.</p>
      </div>
    );
  }

  const days = RANGES.find((r) => String(r.days) === searchParams.days)?.days ?? 7;
  const since = new Date(Date.now() - days * 86_400_000).toISOString();
  const { data, error } = await getSupabaseAdminClient().rpc("analytics_summary", { since });
  if (error) {
    return (
      <div className="container-page max-w-xl py-20">
        <h1 className="font-serif text-3xl text-navy">Couldn&apos;t load analytics</h1>
        <p className="mt-3 text-navy/70">{error.message}</p>
        <p className="mt-2 text-sm text-navy/55">Has supabase/migrations/0003_analytics_feedback.sql been run?</p>
      </div>
    );
  }
  const s = data as Summary;
  const t = s.totals;
  const n = (k: string) => Number(t[k] ?? 0);

  return (
    <div className="container-page py-8 sm:py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy/50">Owner only</p>
          <h1 className="mt-1 font-serif text-hero text-navy">Site analytics</h1>
          <p className="mt-1 text-sm text-navy/60">Signed in as {owner.user.email}. Anonymous, cookieless data.</p>
        </div>
        <nav className="flex gap-1 rounded-full border border-navy/10 bg-white p-1" aria-label="Date range">
          {RANGES.map((r) => (
            <Link
              key={r.days}
              href={`/owner?days=${r.days}`}
              aria-current={r.days === days ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium",
                r.days === days ? "bg-navy text-cream" : "text-navy/70 hover:bg-navy/5",
              )}
            >
              {r.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* ─── Headline numbers ─────────────────────────────────── */}
      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Visitors" value={n("sessions")} hint="Browser sessions" />
        <Stat label="Page views" value={n("page_views")} />
        <Stat label="Searches" value={n("searches")} hint={`${formatNumber(n("zero_result_searches"))} found nothing`} />
        <Stat label="Schools viewed" value={n("school_views")} />
        <Stat label="Saved to shortlist" value={n("shortlist_adds")} />
        <Stat label="Contacted a school" value={n("outbound")} hint="Call, website, directions" />
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel title="Visitors per day" subtitle="Hover a bar for exact numbers.">
          <DailyChart daily={s.daily} days={days} />
        </Panel>
        <Panel title="What visitors went on to do" subtitle="Share of visitors who reached each step.">
          <Funnel funnel={s.funnel} />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Where visitors came from" subtitle="utm_source tag, else the referring site.">
          <BarList rows={s.sources.map((r) => ({ label: r.source, value: r.sessions }))} empty="No visits yet." />
          {s.campaigns.length > 0 && (
            <>
              <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-navy/50">Campaigns (utm_campaign)</h3>
              <BarList rows={s.campaigns.map((r) => ({ label: r.campaign, value: r.sessions }))} />
            </>
          )}
        </Panel>
        <Panel title="Devices">
          <BarList rows={s.devices.map((r) => ({ label: cap(r.device), value: r.sessions }))} empty="No visits yet." />
          <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-navy/50">“Near me”</h3>
          <p className="text-sm text-navy/75">
            {formatNumber(n("near_me_ok"))} found their location ·{" "}
            {formatNumber(n("near_me_failed"))} blocked or failed
          </p>
        </Panel>
        <Panel title="Contacting schools">
          <BarList
            rows={s.outbound.map((r) => ({ label: OUTBOUND_LABELS[r.kind] ?? r.kind, value: r.count }))}
            empty="No clicks yet."
          />
          <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-navy/50">Most viewed pages</h3>
          <BarList rows={s.pages.map((r) => ({ label: r.path, value: r.views }))} empty="No page views yet." />
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Panel title="Top searches">
          <BarList
            rows={s.top_searches.map((r) => ({
              label: r.term,
              value: r.count,
              note: r.zero > 0 ? `${r.zero} with no results` : undefined,
            }))}
            empty="No text searches yet."
          />
        </Panel>
        <Panel title="Searches that found nothing" subtitle="Gaps in your data, or spellings to support.">
          <BarList rows={s.zero_result_terms.map((r) => ({ label: r.term, value: r.count }))} empty="None — good." />
        </Panel>
        <Panel title="Filters used">
          <BarList rows={s.filters.map((r) => ({ label: r.filter, value: r.count }))} empty="No filters used yet." />
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Most viewed schools" subtitle="Candidates for adding fees and deadlines first.">
          <BarList
            rows={s.top_schools.map((r) => ({ label: r.name ?? r.slug, value: r.views, href: `/schools/${r.slug}` }))}
            empty="No school pages viewed yet."
          />
        </Panel>
      </div>

      <section className="mt-6 rounded-2xl border border-navy/10 bg-white p-5 sm:p-6" aria-labelledby="fb">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="fb" className="font-serif text-xl text-navy">
            Feedback <span className="text-navy/45">({formatNumber(n("feedback"))})</span>
          </h2>
          {t.avg_rating != null && <p className="text-sm text-navy/70">Average rating {t.avg_rating} / 5</p>}
        </div>
        {s.feedback.length === 0 ? (
          <p className="mt-4 text-sm text-navy/60">No feedback in this period.</p>
        ) : (
          <ul className="mt-4 divide-y divide-navy/10">
            {s.feedback.map((f) => (
              <li key={f.id} className="py-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-navy/55">
                  <span>{new Date(f.created_at).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg", dateStyle: "medium", timeStyle: "short" })}</span>
                  {f.rating != null && (
                    <span className="font-semibold text-navy" aria-label={`${f.rating} out of 5`}>
                      {"★".repeat(f.rating)}
                      <span className="text-navy/20">{"★".repeat(5 - f.rating)}</span>
                    </span>
                  )}
                  {f.path && <span>on {f.path}</span>}
                  {f.device && <span>{f.device}</span>}
                </div>
                {f.message && <p className="mt-1.5 whitespace-pre-line text-navy/85">{f.message}</p>}
                {f.email && (
                  <a href={`mailto:${f.email}`} className="mt-1 inline-block text-sm font-medium text-navy underline">
                    {f.email}
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-8 text-xs text-navy/45">
        Tip: tag links you post, e.g. <code className="rounded bg-white px-1">?utm_source=facebook&amp;utm_campaign=cape-town-moms</code>,
        to see which group each visitor came from.
      </p>
    </div>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-navy/10 bg-white p-4">
      <dt className="text-xs text-navy/55">{label}</dt>
      <dd className="mt-1 font-serif text-3xl font-semibold tabular-nums text-navy">{formatNumber(value)}</dd>
      {hint && <dd className="mt-0.5 text-xs text-navy/50">{hint}</dd>}
    </div>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-2xl border border-navy/10 bg-white p-5 sm:p-6">
      <h2 className="font-serif text-xl text-navy">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-navy/55">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** Ranked horizontal bars, one hue; values in ink, never in the bar colour. */
function BarList({
  rows,
  empty,
}: {
  rows: { label: string; value: number; note?: string; href?: string }[];
  empty?: string;
}) {
  if (!rows.length) return <p className="text-sm text-navy/55">{empty ?? "Nothing yet."}</p>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} className="text-sm">
          <div className="flex items-baseline justify-between gap-3">
            {r.href ? (
              <Link href={r.href} className="truncate text-navy hover:underline">
                {r.label}
              </Link>
            ) : (
              <span className="truncate text-navy">{r.label}</span>
            )}
            <span className="shrink-0 tabular-nums font-medium text-navy">{formatNumber(r.value)}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-navy/[0.06]">
            <div className="h-full rounded-full bg-navy/70" style={{ width: `${Math.max(2, (r.value / max) * 100)}%` }} />
          </div>
          {r.note && <p className="mt-0.5 text-xs text-navy/50">{r.note}</p>}
        </li>
      ))}
    </ul>
  );
}

function Funnel({ funnel }: { funnel: Summary["funnel"] }) {
  const steps = [
    { label: "Visited", value: funnel.visited },
    { label: "Searched", value: funnel.searched },
    { label: "Viewed a school", value: funnel.viewed_school },
    { label: "Saved a school", value: funnel.saved },
    { label: "Contacted a school", value: funnel.contacted },
  ];
  const top = Math.max(funnel.visited, 1);
  return (
    <ol className="space-y-3">
      {steps.map((st) => {
        const pct = Math.round((st.value / top) * 100);
        return (
          <li key={st.label} className="text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-navy">{st.label}</span>
              <span className="tabular-nums text-navy">
                <span className="font-semibold">{formatNumber(st.value)}</span>
                <span className="ml-1.5 text-navy/50">{pct}%</span>
              </span>
            </div>
            <div className="mt-1 h-2.5 rounded-full bg-navy/[0.06]">
              <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.max(1, pct)}%` }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Single-series column chart: one bar per day, zero-filled, with hover values and a table view. */
function DailyChart({ daily, days }: { daily: Summary["daily"]; days: number }) {
  const span = Math.max(days, 1);
  const byDay = new Map(daily.map((d) => [d.day, d]));
  const series: { day: string; sessions: number; page_views: number }[] = [];
  for (let i = span - 1; i >= 0; i--) {
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Johannesburg" }).format(
      new Date(Date.now() - i * 86_400_000),
    );
    series.push(byDay.get(day) ?? { day, sessions: 0, page_views: 0 });
  }
  const max = Math.max(...series.map((d) => d.sessions), 1);
  const label = (d: string) =>
    new Date(`${d}T12:00:00Z`).toLocaleDateString("en-ZA", { day: "numeric", month: "short", timeZone: "UTC" });
  const ticks = [series[0], series[Math.floor(series.length / 2)], series[series.length - 1]];

  return (
    <div>
      <div className="relative flex h-44 items-end gap-[2px] border-b border-navy/15" role="img" aria-label="Visitors per day">
        <span className="absolute left-0 top-0 text-[11px] tabular-nums text-navy/45">{formatNumber(max)}</span>
        {series.map((d) => (
          <div key={d.day} className="group relative flex h-full flex-1 items-end">
            <div
              className="w-full rounded-t-[4px] bg-navy/75 transition-colors group-hover:bg-navy"
              style={{ height: `${d.sessions ? Math.max(3, (d.sessions / max) * 100) : 0}%` }}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-navy px-2.5 py-1.5 text-xs text-cream shadow-lg group-hover:block">
              <span className="font-semibold">{label(d.day)}</span> · {formatNumber(d.sessions)} visitors ·{" "}
              {formatNumber(d.page_views)} views
            </div>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-navy/50">
        {ticks.map((d, i) => (
          <span key={i}>{label(d.day)}</span>
        ))}
      </div>
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-navy/60 hover:text-navy">Show as table</summary>
        <table className="mt-2 w-full text-left tabular-nums">
          <thead className="text-xs text-navy/50">
            <tr>
              <th className="py-1 font-medium">Day</th>
              <th className="py-1 text-right font-medium">Visitors</th>
              <th className="py-1 text-right font-medium">Page views</th>
            </tr>
          </thead>
          <tbody>
            {[...series].reverse().map((d) => (
              <tr key={d.day} className="border-t border-navy/5">
                <td className="py-1">{label(d.day)}</td>
                <td className="py-1 text-right">{formatNumber(d.sessions)}</td>
                <td className="py-1 text-right">{formatNumber(d.page_views)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
