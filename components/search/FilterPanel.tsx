"use client";

import { PROVINCES } from "@/lib/types";
import {
  FEE_MAX_OPTIONS,
  GRADE_OPTIONS,
  LEVEL_OPTIONS,
  TYPE_OPTIONS,
  type SearchState,
} from "@/lib/search-params";
import { Select } from "@/components/ui/Input";
import { formatNumber } from "@/lib/utils";
import { useSearchNav } from "./SearchNav";

interface Props {
  state: SearchState;
}

/**
 * Every control applies immediately — no "Apply" button to forget. Results
 * dim while the new search loads (see PendingFrame).
 */
export function FilterPanel({ state }: Props) {
  const { update } = useSearchNav();

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="field-label">Level</legend>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="chip"
            aria-pressed={!state.level}
            onClick={() => update({ level: null })}
          >
            All
          </button>
          {LEVEL_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              className="chip"
              aria-pressed={state.level === o.value}
              onClick={() => update({ level: state.level === o.value ? null : o.value })}
            >
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="block">
        <span className="field-label">Grade your child is going into</span>
        <Select
          value={state.grade ?? ""}
          onChange={(e) => update({ grade: e.target.value || null })}
        >
          <option value="">Any grade</option>
          {GRADE_OPTIONS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Select>
      </label>

      <fieldset>
        <legend className="field-label">School type</legend>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="chip"
            aria-pressed={!state.type}
            onClick={() => update({ type: null })}
          >
            Any
          </button>
          {TYPE_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              className="chip"
              aria-pressed={state.type === o.value}
              onClick={() => update({ type: state.type === o.value ? null : o.value })}
            >
              {o.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-navy/55">
          Independent = private. Model C = a public school with its own governing body that
          usually charges fees.
        </p>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="field-label">Fees</legend>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-navy/15 bg-white p-3 transition-colors hover:bg-cream has-[:checked]:border-teal-600/40 has-[:checked]:bg-teal-50">
          <input
            type="checkbox"
            checked={state.noFee ?? false}
            onChange={(e) => update({ fees: e.target.checked ? "none" : null, fee_max: null, fee_min: null })}
            className="mt-0.5 h-5 w-5 shrink-0 accent-teal-700"
          />
          <span>
            <span className="block text-sm font-medium text-navy">No-fee schools only</span>
            <span className="block text-xs text-navy/60">Public schools that don't charge school fees</span>
          </span>
        </label>
        <label className="block">
          <span className="sr-only">Maximum monthly fees</span>
          <Select
            value={state.feeMax != null ? String(state.feeMax) : ""}
            disabled={state.noFee}
            onChange={(e) => update({ fee_max: e.target.value || null })}
          >
            <option value="">Any monthly fee</option>
            {FEE_MAX_OPTIONS.map((f) => (
              <option key={f} value={f}>
                Up to R{formatNumber(f)} a month
              </option>
            ))}
          </Select>
        </label>
        {state.feeMax != null && (
          <p className="text-xs text-navy/55">Only schools that list their fees are shown.</p>
        )}
      </fieldset>

      <label className="block">
        <span className="field-label">Province</span>
        <Select
          value={state.province ?? ""}
          onChange={(e) => update({ province: e.target.value || null })}
        >
          <option value="">All provinces</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
              {p === "Western Cape" ? " — every school" : ""}
            </option>
          ))}
        </Select>
      </label>
    </div>
  );
}
