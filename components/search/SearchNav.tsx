"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useTransition } from "react";
import { cn } from "@/lib/utils";

type Updates = Record<string, string | null | undefined>;

interface SearchNavValue {
  /** Merge `updates` into the current query string and navigate. */
  update: (updates: Updates, opts?: { keepPage?: boolean }) => void;
  /** Replace the whole query string. */
  replace: (params: Updates) => void;
  params: URLSearchParams;
  pending: boolean;
}

const Ctx = createContext<SearchNavValue | null>(null);

export function SearchNavProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const go = useCallback(
    (sp: URLSearchParams) => {
      const qs = sp.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname],
  );

  const update = useCallback(
    (updates: Updates, opts?: { keepPage?: boolean }) => {
      const sp = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v == null || v === "") sp.delete(k);
        else sp.set(k, v);
      }
      if (!opts?.keepPage) sp.delete("page");
      go(sp);
    },
    [params, go],
  );

  const replace = useCallback(
    (next: Updates) => {
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(next)) if (v) sp.set(k, v);
      go(sp);
    },
    [go],
  );

  return <Ctx.Provider value={{ update, replace, params, pending }}>{children}</Ctx.Provider>;
}

export function useSearchNav() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSearchNav must be used inside SearchNavProvider");
  return ctx;
}

/** Dims the results while a new search is loading. */
export function PendingFrame({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useSearchNav();
  return (
    <div
      aria-busy={pending}
      className={cn("transition-opacity duration-150", pending && "pointer-events-none opacity-50", className)}
    >
      {children}
    </div>
  );
}

/** Thin progress bar along the top of the results while loading. */
export function PendingBar() {
  const { pending } = useSearchNav();
  if (!pending) return null;
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-amber/20" role="progressbar" aria-label="Loading results">
      <div className="h-full w-1/3 animate-[progress_1s_ease-in-out_infinite] bg-amber" />
    </div>
  );
}
