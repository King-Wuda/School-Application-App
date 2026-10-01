"use client";

import { FEATURES } from "@/lib/features";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/shortlist", label: "Shortlist" },
  ...(FEATURES.reminders ? [{ href: "/account/deadlines", label: "My deadlines" }] : []),
];

export function AccountTabs() {
  const pathname = usePathname();
  return (
    <nav className="mb-8 flex gap-1 overflow-x-auto border-b border-navy/10" aria-label="Account">
      {TABS.map((t) => {
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
              active ? "border-navy text-navy" : "border-transparent text-navy/60 hover:text-navy",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
