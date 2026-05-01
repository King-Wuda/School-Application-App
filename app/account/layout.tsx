import Link from "next/link";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-page py-6 sm:py-10">
      <nav className="mb-6 flex flex-wrap gap-1 border-b border-navy/10">
        {[
          { href: "/account", label: "Dashboard" },
          { href: "/account/shortlist", label: "Shortlist" },
          { href: "/account/deadlines", label: "My deadlines" },
        ].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-t-md px-4 py-2 text-sm font-medium text-navy/70 hover:bg-navy/5 hover:text-navy"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
