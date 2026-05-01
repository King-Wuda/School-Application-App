"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useShortlist } from "@/components/shortlist/ShortlistProvider";
import { Button } from "@/components/ui/Button";
import { SchoolAvatar } from "@/components/ui/SchoolAvatar";

interface RecentSchool {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  viewed_at: string;
}

export default function AccountPage() {
  const { ids } = useShortlist();
  const [email, setEmail] = useState<string | null>(null);
  const [reminderCount, setReminderCount] = useState(0);
  const [recent, setRecent] = useState<RecentSchool[]>([]);
  const [loading, setLoading] = useState(true);

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
        const [{ count }, { data: rv }] = await Promise.all([
          supabase
            .from("reminders")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userData.user.id),
          supabase
            .from("recently_viewed")
            .select("viewed_at, schools(id, name, slug, logo_url)")
            .eq("user_id", userData.user.id)
            .order("viewed_at", { ascending: false })
            .limit(6),
        ]);
        setReminderCount(count ?? 0);
        setRecent(
          ((rv ?? []) as any[])
            .map((r) => ({
              id: r.schools?.id,
              name: r.schools?.name,
              slug: r.schools?.slug,
              logo_url: r.schools?.logo_url ?? null,
              viewed_at: r.viewed_at,
            }))
            .filter((r) => r.id),
        );
      } catch {
        // Supabase not configured
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p className="text-navy/60">Loading…</p>;

  if (!email) {
    return (
      <div className="rounded-xl border border-dashed border-navy/20 bg-white p-10 text-center">
        <p className="font-serif text-xl text-navy">You're not signed in</p>
        <p className="mt-2 text-navy/60">
          Sign in to save schools to your shortlist and track deadlines.
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

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-hero text-navy">Dashboard</h1>
        <p className="mt-1 text-navy/70">Signed in as {email}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Tile
          title="Shortlisted schools"
          value={ids.size}
          href="/account/shortlist"
          cta="View shortlist"
        />
        <Tile
          title="Upcoming deadlines"
          value={reminderCount}
          href="/account/deadlines"
          cta="View deadlines"
        />
        <Tile title="Actions" href="/search" cta="Browse schools">
          <div className="mt-4 space-y-2">
            <Link
              href="/compare"
              className="block rounded-lg border border-navy/10 px-4 py-2 text-sm font-medium text-navy hover:bg-cream"
            >
              Compare shortlist →
            </Link>
            <form action="/auth/signout" method="post">
              <Button variant="outline" size="sm" type="submit" className="w-full">
                Sign out
              </Button>
            </form>
          </div>
        </Tile>
      </div>

      {recent.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 font-serif text-2xl text-navy">Recently viewed</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/schools/${r.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-navy/10 bg-white p-3 hover:bg-cream"
                >
                  <SchoolAvatar name={r.name} logoUrl={r.logo_url} size={40} />
                  <span className="truncate font-medium text-navy">{r.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Tile({
  title,
  value,
  href,
  cta,
  children,
}: {
  title: string;
  value?: number;
  href: string;
  cta: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-navy/10 bg-white p-5">
      <p className="text-sm font-medium uppercase tracking-wide text-navy/50">
        {title}
      </p>
      {value != null && (
        <p className="mt-1 font-serif text-4xl text-navy">{value}</p>
      )}
      {children ?? (
        <Link
          href={href}
          className="mt-4 inline-block text-sm font-medium text-navy hover:underline"
        >
          {cta} →
        </Link>
      )}
    </div>
  );
}
