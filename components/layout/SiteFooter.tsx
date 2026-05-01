import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-navy/10 bg-white">
      <div className="container-page py-10 text-sm text-navy/70">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-serif text-lg font-semibold text-navy">
              SchoolFinder SA
            </p>
            <p className="mt-2 max-w-sm">
              The unbiased search and comparison tool for every school and
              university in South Africa.
            </p>
          </div>
          <div>
            <p className="mb-2 font-semibold text-navy">Explore</p>
            <ul className="space-y-1">
              <li><Link href="/search" className="hover:underline">Search schools</Link></li>
              <li><Link href="/compare" className="hover:underline">Compare</Link></li>
              <li><Link href="/account/deadlines" className="hover:underline">Deadline tracker</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-semibold text-navy">Account</p>
            <ul className="space-y-1">
              <li><Link href="/login" className="hover:underline">Sign in</Link></li>
              <li><Link href="/account" className="hover:underline">Dashboard</Link></li>
              <li><Link href="/account/shortlist" className="hover:underline">My shortlist</Link></li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-navy/10 pt-6 text-xs text-navy/50">
          © {new Date().getFullYear()} SchoolFinder SA. Data is collected from
          public sources. Always verify details on the school's own website.
        </p>
      </div>
    </footer>
  );
}
