"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/admin/signin", {
      method: "POST",
      body: JSON.stringify({ password }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) {
      router.refresh();
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Invalid password");
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-md rounded-2xl border border-navy/10 bg-white p-8 shadow-card">
      <h1 className="font-serif text-2xl text-navy">Admin</h1>
      <p className="mt-1 text-sm text-navy/60">
        Enter the admin password to continue.
      </p>
      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          autoFocus
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Checking…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
