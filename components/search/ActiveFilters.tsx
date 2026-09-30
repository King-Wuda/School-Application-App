"use client";

import { LEVEL_OPTIONS, TYPE_OPTIONS, type SearchState } from "@/lib/search-params";
import { XIcon } from "@/components/ui/Icon";
import { formatNumber } from "@/lib/utils";
import { useSearchNav } from "./SearchNav";

/** Removable chips for each filter in play, plus "Clear all". */
export function ActiveFilters({ state }: { state: SearchState }) {
  const { update, replace } = useSearchNav();

  const chips: { key: string; label: string; clear: Record<string, null> }[] = [];
  if (state.q) chips.push({ key: "q", label: `“${state.q}”`, clear: { q: null } });
  if (state.area) chips.push({ key: "area", label: state.area, clear: { area: null } });
  if (state.level)
    chips.push({
      key: "level",
      label: LEVEL_OPTIONS.find((o) => o.value === state.level)!.label,
      clear: { level: null },
    });
  if (state.grade) chips.push({ key: "grade", label: state.grade, clear: { grade: null } });
  if (state.type)
    chips.push({
      key: "type",
      label: TYPE_OPTIONS.find((o) => o.value === state.type)?.label ?? "Universities",
      clear: { type: null },
    });
  if (state.noFee) chips.push({ key: "fees", label: "No-fee schools", clear: { fees: null } });
  if (state.feeMax != null)
    chips.push({ key: "fee_max", label: `Up to R${formatNumber(state.feeMax)}/month`, clear: { fee_max: null } });
  if (state.feeMin != null)
    chips.push({ key: "fee_min", label: `From R${formatNumber(state.feeMin)}/month`, clear: { fee_min: null } });
  if (state.province) chips.push({ key: "province", label: state.province, clear: { province: null } });

  if (chips.length === 0) return null;

  return (
    <div className="scroll-row -mx-4 px-4 sm:mx-0 sm:flex-wrap sm:px-0" aria-label="Active filters">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => update(c.clear)}
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-navy/[0.07] pl-3 pr-2 text-sm font-medium text-navy transition-colors hover:bg-navy/[0.12]"
          aria-label={`Remove filter: ${c.label}`}
        >
          {c.label}
          <XIcon size={14} className="text-navy/60" />
        </button>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={() =>
            replace({
              near: state.near ? `${state.near.lat},${state.near.lng}` : null,
              radius: state.radiusKm ? String(state.radiusKm) : null,
            })
          }
          className="inline-flex h-8 shrink-0 items-center px-2 text-sm font-medium text-navy/60 underline-offset-2 hover:text-navy hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
