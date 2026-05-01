"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const withSupabase = (fn: (client: ReturnType<typeof getSupabaseBrowserClient>) => Promise<void>) =>
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setMsg(null);
      setLoading(true);
      try {
        const supabase = getSupabaseBrowserClient();
        await fn(supabase);
      } catch (err: any) {
        setMsg(err?.message ?? "Something went wrong. Check your Supabase configuration.");
      } finally {
        setLoading(false);
      }
    };

  const handleEmail = withSupabase(async (supabase) => {
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/account");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      setMsg("Check your email to confirm your account, then sign in.");
    }
  });

  const handleGoogle = withSupabase(async (supabase) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  });

  return (
    <div className="container-page max-w-md py-12 sm:py-20">
      <div className="rounded-2xl border border-navy/10 bg-white p-6 shadow-card sm:p-8">
        <h1 className="font-serif text-2xl font-semibold text-navy">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-navy/60">
          Save schools to your shortlist and get deadline reminders.
        </p>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-navy/15 bg-white text-sm font-medium text-navy hover:bg-cream disabled:opacity-60"
        >
          <GoogleIcon /> Continue with Google
        </button>

        <div className="relative my-5 text-center text-xs uppercase tracking-wide text-navy/40">
          <span className="relative z-10 bg-white px-2">or</span>
          <span className="absolute inset-x-0 top-1/2 -z-0 h-px bg-navy/10" />
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            minLength={6}
            required
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        {msg && (
          <p className="mt-4 rounded-lg bg-amber/10 p-3 text-sm text-amber-700">
            {msg}
          </p>
        )}

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setMsg(null);
          }}
          className="mt-5 w-full text-sm text-navy/70 hover:underline"
        >
          {mode === "signin"
            ? "Need an account? Sign up →"
            : "Already have an account? Sign in →"}
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.63-.06-1.25-.17-1.84H9v3.48h4.84A4.14 4.14 0 0 1 12 13.57v2.23h2.88c1.68-1.55 2.64-3.83 2.64-6.6z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.88-2.23c-.8.53-1.83.85-3.08.85-2.37 0-4.37-1.6-5.09-3.74H.96v2.3A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.91 10.7A5.4 5.4 0 0 1 3.62 9a5.4 5.4 0 0 1 .29-1.7V5H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4l2.95-2.3z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 5l2.95 2.3C4.63 5.18 6.63 3.58 9 3.58z"
      />
    </svg>
  );
}
