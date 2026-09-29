"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { PROVINCES } from "@/lib/types";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const GRADES = ["Grade R", ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`)];

interface Props {
  initial: {
    q?: string;
    province?: string;
    type?: string;
    level?: string;
    grade?: string;
    feeMin?: string;
    feeMax?: string;
  };
}

export function FilterSidebar({ initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [q, setQ] = useState(initial.q ?? "");
  const [province, setProvince] = useState(initial.province ?? "");
  const [type, setType] = useState(initial.type ?? "");
  const [level, setLevel] = useState(initial.level ?? "");
  const [grade, setGrade] = useState(initial.grade ?? "");
  const [feeMin, setFeeMin] = useState(initial.feeMin ?? "");
  const [feeMax, setFeeMax] = useState(initial.feeMax ?? "");

  const apply = () => {
    const sp = new URLSearchParams(params.toString());
    set(sp, "q", q);
    set(sp, "province", province);
    set(sp, "type", type);
    set(sp, "level", level);
    set(sp, "grade", grade);
    set(sp, "fee_min", feeMin);
    set(sp, "fee_max", feeMax);
    sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  };

  const reset = () => {
    setQ("");
    setProvince("");
    setType("");
    setLevel("");
    setGrade("");
    setFeeMin("");
    setFeeMax("");
    router.push(pathname);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      className="space-y-4"
      aria-label="Filter schools"
    >
      <Field label="Search">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, area, suburb"
        />
      </Field>
      <Field label="Province">
        <Select value={province} onChange={(e) => setProvince(e.target.value)}>
          <option value="">All provinces</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="School type">
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          <option value="public">Public</option>
          <option value="model_c">Model C</option>
          <option value="private">Private</option>
          <option value="university">University</option>
        </Select>
      </Field>
      <Field label="Level">
        <Select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">All levels</option>
          <option value="primary">Primary school</option>
          <option value="high">High school</option>
          <option value="special_needs">Special needs</option>
        </Select>
      </Field>
      <Field label="Grade">
        <Select value={grade} onChange={(e) => setGrade(e.target.value)}>
          <option value="">Any grade</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Monthly fees (ZAR)">
        <div className="flex gap-2">
          <Input
            type="number"
            inputMode="numeric"
            value={feeMin}
            onChange={(e) => setFeeMin(e.target.value)}
            placeholder="Min"
          />
          <Input
            type="number"
            inputMode="numeric"
            value={feeMax}
            onChange={(e) => setFeeMax(e.target.value)}
            placeholder="Max"
          />
        </div>
      </Field>
      <div className="flex gap-2 pt-2">
        <Button type="submit" className="flex-1">
          Apply
        </Button>
        <Button type="button" variant="outline" onClick={reset}>
          Reset
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-navy/60">
        {label}
      </span>
      {children}
    </label>
  );
}

function set(sp: URLSearchParams, key: string, value: string) {
  if (value) sp.set(key, value);
  else sp.delete(key);
}
