"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useShortlist } from "@/components/shortlist/ShortlistProvider";
import { HeartIcon, LogoMarkIcon, MenuIcon, XIcon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [email, setEmail] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { ids } = useShortlist();

  useEffect(() => {
    try {
      const supabase = getSupabaseBrowserClient();
      supabase.auth.getUser().then(({ data }) => {
        setEmail(data.user?.email ?? null);
        setLoaded(true);
      });
      const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
        setEmail(session?.user?.email ?? null);
      });
      return () => listener.subscription.unsubscribe();
    } catch {
      // Supabase env not configured — header still renders without auth.
      setLoaded(true);
    }
  }, []);

  const links = [
    { href: "/search", label: "Search" },
    { href: "/compare", label: "Compare" },
    { href: "/account/shortlist", label: "Shortlist" },
    { href: "/account/deadlines", label: "Deadlines" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-navy/10 bg-cream/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-serif text-lg font-semibold text-navy"
        >
          <LogoMarkIcon size={24} className="text-amber" />
          SchoolFinder <span className="font-normal text-navy/60">SA</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-navy/80 hover:bg-navy/5 hover:text-navy"
            >
              {l.label}
              {l.href === "/account/shortlist" && ids.size > 0 && (
                <span className="ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber px-1.5 text-[11px] font-semibold text-navy">
                  {ids.size}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {loaded && email ? (
            <Link
              href="/account"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-navy/15 px-3 text-sm font-medium text-navy hover:bg-navy/5"
            >
              <span className="hidden lg:inline">{truncate(email, 22)}</span>
              <span className="lg:hidden">Account</span>
            </Link>
          ) : loaded ? (
            <Link
              href="/login"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-navy px-3 text-sm font-medium text-cream hover:bg-navy/90"
            >
              Sign in
            </Link>
          ) : null}
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-navy/15 text-navy md:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      <div
        className={cn(
          "md:hidden",
          mobileOpen ? "block" : "hidden",
          "border-t border-navy/10 bg-cream",
        )}
      >
        <div className="container-page flex flex-col gap-1 py-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-md px-3 py-2 text-base font-medium text-navy/80 hover:bg-navy/5"
            >
              <span>{l.label}</span>
              {l.href === "/account/shortlist" && ids.size > 0 && (
                <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-amber px-2 text-xs font-semibold text-navy">
                  {ids.size}
                </span>
              )}
            </Link>
          ))}
          <div className="mt-2 border-t border-navy/10 pt-3">
            {email ? (
              <Link
                href="/account"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2 text-base font-medium text-navy/80"
              >
                Account ({truncate(email, 24)})
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block rounded-md bg-navy px-3 py-2 text-center text-base font-medium text-cream"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function truncate(s: string, n: number) {
  return s.length <= n ? s : s.slice(0, n - 1) + "…";
}
