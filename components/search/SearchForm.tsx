"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PROVINCES } from "@/lib/types";
import { SearchIcon } from "@/components/ui/Icon";

interface Props {
  initialQ?: string;
  initialProvince?: string;
  initialType?: string;
  variant?: "hero" | "compact";
}

export function SearchForm({
  initialQ = "",
  initialProvince = "",
  initialType = "",
  variant = "hero",
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [province, setProvince] = useState(initialProvince);
  const [type, setType] = useState(initialType);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (province) params.set("province", province);
    if (type) params.set("type", type);
    router.push(`/search${params.toString() ? `?${params}` : ""}`);
  };

  if (variant === "compact") {
    return (
      <form onSubmit={onSubmit} className="flex w-full gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search schools by name, area or suburb"
          aria-label="Search schools"
        />
        <Button type="submit">
          <SearchIcon size={16} /> Search
        </Button>
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-navy/10 bg-white p-3 shadow-card sm:p-4"
      role="search"
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_1fr_auto]">
        <label className="relative block">
          <span className="sr-only">School name, area or suburb</span>
          <SearchIcon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/40"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by school name, area or suburb"
            className="pl-10"
          />
        </label>
        <label className="block">
          <span className="sr-only">Province</span>
          <Select value={province} onChange={(e) => setProvince(e.target.value)}>
            <option value="">All provinces</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </label>
        <label className="block">
          <span className="sr-only">School type</span>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            <option value="public">Public</option>
            <option value="model_c">Model C</option>
            <option value="private">Private</option>
            <option value="university">University</option>
          </Select>
        </label>
        <Button type="submit" size="md" className="md:h-11">
          <SearchIcon size={16} /> Search
        </Button>
      </div>
    </form>
  );
}
