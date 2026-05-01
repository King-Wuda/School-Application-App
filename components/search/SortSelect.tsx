"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Input";

const OPTIONS = [
  { v: "relevance", label: "Featured first" },
  { v: "alpha", label: "Alphabetical" },
  { v: "fee_asc", label: "Fees (low to high)" },
  { v: "fee_desc", label: "Fees (high to low)" },
  { v: "distance", label: "Distance (this page)" },
];

export function SortSelect({ current }: { current: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const sp = new URLSearchParams(params.toString());
    sp.set("sort", e.target.value);
    sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  };

  return (
    <label className="flex items-center gap-2 text-sm text-navy/70">
      <span className="hidden sm:inline">Sort by</span>
      <Select value={current} onChange={onChange} className="h-9 w-auto text-sm">
        {OPTIONS.map((o) => (
          <option key={o.v} value={o.v}>
            {o.label}
          </option>
        ))}
      </Select>
    </label>
  );
}
