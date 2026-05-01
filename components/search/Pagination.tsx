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
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
      <PageLink disabled={page <= 1} href={href(page - 1)}>
        ← Prev
      </PageLink>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="px-2 text-navy/40">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "inline-flex h-9 min-w-[36px] items-center justify-center rounded-md px-2 text-sm font-medium",
              p === page
                ? "bg-navy text-cream"
                : "border border-navy/15 text-navy hover:bg-navy/5",
            )}
          >
            {p}
          </Link>
        ),
      )}
      <PageLink disabled={page >= totalPages} href={href(page + 1)}>
        Next →
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="inline-flex h-9 items-center rounded-md border border-navy/10 px-3 text-sm text-navy/30">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex h-9 items-center rounded-md border border-navy/15 px-3 text-sm font-medium text-navy hover:bg-navy/5"
    >
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
