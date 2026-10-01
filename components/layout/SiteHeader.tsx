"use client";

import { FEATURES } from "@/lib/features";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useShortlist } from "@/components/shortlist/ShortlistProvider";
import { HeartIcon, LogoMarkIcon, MenuIcon, XIcon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/search", label: "Find schools" },
  { href: "/compare", label: "Compare" },
  ...(FEATURES.reminders ? [{ href: "/account/deadlines", label: "Deadlines" }] : []),
  { href: "/guide", label: "How applications work" },
];

export function SiteHeader() {
  const pathname = usePathname();
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

  // Close the mobile menu whenever the page changes.
  useEffect(() => setMobileOpen(false), [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-cream/90 backdrop-blur-md supports-[backdrop-filter]:bg-cream/75">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg font-semibold text-navy" aria-label="SchoolFinder SA home">
          <LogoMarkIcon size={24} className="text-amber" />
          <span>
            SchoolFinder <span className="font-normal text-navy/55">SA</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={isActive(l.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                isActive(l.href) ? "bg-navy/[0.07] text-navy" : "text-navy/70 hover:bg-navy/5 hover:text-navy",
                l.href === "/guide" && "hidden lg:inline-flex",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/account/shortlist"
            className={cn(
              "relative inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-medium text-navy transition-colors hover:bg-navy/5",
              isActive("/account/shortlist") && "bg-navy/[0.07]",
            )}
            aria-label={`Shortlist, ${ids.size} saved`}
          >
            <HeartIcon size={19} filled={ids.size > 0} className={ids.size > 0 ? "text-rose-600" : undefined} />
            <span className="hidden sm:inline">Shortlist</span>
            {ids.size > 0 && (
              <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-navy px-1.5 text-[11px] font-semibold text-cream">
                {ids.size}
              </span>
            )}
          </Link>

          <div className="hidden md:block">
            {loaded && email ? (
              <Link
                href="/account"
                className="inline-flex h-10 items-center rounded-full border border-navy/15 px-4 text-sm font-medium text-navy hover:bg-navy/5"
                title={email}
              >
                My account
              </Link>
            ) : loaded ? (
              <Link
                href="/login"
                className="inline-flex h-10 items-center rounded-full bg-navy px-4 text-sm font-medium text-cream hover:bg-navy/90"
              >
                Sign in
              </Link>
            ) : (
              <span className="inline-block h-10 w-[76px]" />
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-navy hover:bg-navy/5 md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
          >
            {mobileOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div id="mobile-menu" className="animate-fade-in border-t border-navy/10 bg-cream md:hidden">
          <nav className="container-page flex flex-col gap-1 py-3" aria-label="Main">
            {[{ href: "/", label: "Home" }, ...LINKS].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className={cn(
                  "rounded-xl px-3 py-3 text-base font-medium",
                  pathname === l.href ? "bg-navy/[0.07] text-navy" : "text-navy/80 hover:bg-navy/5",
                )}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-navy/10 pt-3">
              {email ? (
                <Link href="/account" className="block rounded-xl px-3 py-3 text-base font-medium text-navy/80">
                  My account
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="block rounded-xl bg-navy px-3 py-3 text-center text-base font-semibold text-cream"
                >
                  Sign in or create a free account
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
