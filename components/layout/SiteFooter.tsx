import { FEATURES } from "@/lib/features";
import Link from "next/link";
import { LogoMarkIcon } from "@/components/ui/Icon";

const GROUPS = [
  {
    title: "Find a school",
    links: [
      { href: "/search?level=primary", label: "Primary schools" },
      { href: "/search?level=high", label: "High schools" },
      { href: "/search?level=special_needs", label: "Special needs schools" },
      { href: "/search?fees=none", label: "No-fee schools" },
      { href: "/search?type=private", label: "Independent schools" },
    ],
  },
  {
    title: "Plan & apply",
    links: [
      { href: "/guide", label: "How applications work" },
      { href: "/guide#documents", label: "Documents checklist" },
      { href: "/compare", label: "Compare schools" },
      ...(FEATURES.reminders ? [{ href: "/account/deadlines", label: "Deadline reminders" }] : []),
    ],
  },
  {
    title: "Your account",
    links: [
      { href: "/account/shortlist", label: "My shortlist" },
      { href: "/account", label: "Dashboard" },
      { href: "/login", label: "Sign in" },
      { href: "/privacy", label: "Privacy policy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-navy/10 bg-white">
      <div className="container-page py-12 text-sm text-navy/70">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <p className="flex items-center gap-2 font-serif text-lg font-semibold text-navy">
              <LogoMarkIcon size={22} className="text-amber" /> SchoolFinder SA
            </p>
            <p className="mt-3 max-w-xs leading-relaxed">
              Free, independent school search for South African parents and learners. We never
              charge families, and we send you to each school&apos;s own site to apply.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
              Every Western Cape school listed · more provinces coming
            </p>
          </div>
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="mb-3 font-semibold text-navy">{g.title}</p>
              <ul className="space-y-2">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-navy hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-navy/10 pt-6 text-xs text-navy/50 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} SchoolFinder SA ·{" "}
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
          </p>
          <p>
            School directory: Department of Basic Education Schools Masterlist. Fees and dates
            change — always confirm with the school.
          </p>
        </div>
      </div>
    </footer>
  );
}
