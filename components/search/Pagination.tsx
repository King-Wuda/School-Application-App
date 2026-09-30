"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  page: number;
  pageSize: number;
  total: number;
}

export function Pagination({ page, pageSize, total }: Props) {
  const pathname = usePathname();
  const params = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams(params.toString());
    if (p <= 1) sp.delete("page");
    else sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const pages = pageNumbers(page, totalPages);

  return (
    <nav className="mt-10 flex flex-col items-center gap-3" aria-label="Pagination">
      <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-center">
        <PageLink disabled={page <= 1} href={href(page - 1)} label="Previous page">
          ← Previous
        </PageLink>
        <div className="hidden items-center gap-1 sm:flex">
          {pages.map((p, i) =>
            p === "…" ? (
              <span key={`e-${i}`} className="px-1.5 text-navy/40">
                …
              </span>
            ) : (
              <Link
                key={p}
                href={href(p)}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Page ${p}`}
                className={cn(
                  "inline-flex h-10 min-w-[40px] items-center justify-center rounded-full px-2 text-sm font-medium transition-colors",
                  p === page ? "bg-navy text-cream" : "text-navy hover:bg-navy/5",
                )}
              >
                {p}
              </Link>
            ),
          )}
        </div>
        <span className="text-sm text-navy/60 sm:hidden">
          Page {page} of {totalPages}
        </span>
        <PageLink disabled={page >= totalPages} href={href(page + 1)} label="Next page">
          Next →
        </PageLink>
      </div>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const cls = "inline-flex h-10 items-center rounded-full border px-4 text-sm font-medium";
  if (disabled) {
    return (
      <span aria-disabled className={cn(cls, "border-navy/10 text-navy/30")}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} aria-label={label} className={cn(cls, "border-navy/15 bg-white text-navy hover:bg-cream")}>
      {children}
    </Link>
  );
}

function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  if (current > 3) out.push("…");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) out.push(p);
  if (current < total - 2) out.push("…");
  out.push(total);
  return out;
}
