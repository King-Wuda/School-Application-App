"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { currentSessionId } from "@/lib/analytics/client";
import { XIcon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

type State = "idle" | "sending" | "sent" | "error";

/** A small "Feedback" tab on the edge of every page. */
export function FeedbackButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const firstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (/^\/(admin|owner)(\/|$)/.test(pathname)) return null;

  const reset = () => {
    setRating(null);
    setMessage("");
    setEmail("");
    setState("idle");
    setError(null);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!rating && !message.trim()) {
      setError("Pick a rating or write a message.");
      return;
    }
    setState("sending");
    setError(null);
    const website = (new FormData(e.currentTarget).get("website") as string) ?? "";
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rating, message, email, website, path: pathname, session: currentSessionId() }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Something went wrong.");
      setState("sent");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (state === "sent") reset();
          setOpen(true);
        }}
        className="fixed right-0 top-1/2 z-30 origin-bottom-right -translate-y-1/2 -rotate-90 rounded-t-lg bg-navy px-3 py-1.5 text-xs font-semibold tracking-wide text-cream shadow-md transition hover:bg-navy/90 print:hidden"
        aria-haspopup="dialog"
      >
        Feedback
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="fb-title">
          <button type="button" aria-label="Close" className="absolute inset-0 animate-fade-in bg-navy/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md animate-sheet-in rounded-t-3xl bg-white p-6 shadow-2xl sm:animate-toast-in sm:rounded-3xl">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close feedback"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-navy/60 hover:bg-navy/5"
            >
              <XIcon size={18} />
            </button>

            {state === "sent" ? (
              <div className="py-6 text-center">
                <p className="font-serif text-2xl text-navy">Thank you!</p>
                <p className="mt-2 text-navy/65">Every message is read. It really helps us make this better for parents.</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-6 h-11 rounded-xl bg-navy px-6 font-semibold text-cream"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <h2 id="fb-title" className="pr-10 font-serif text-2xl text-navy">
                  How is SchoolFinder working for you?
                </h2>
                <p className="mt-1 text-sm text-navy/60">Tell us what helped, what was missing, or what confused you.</p>

                <fieldset className="mt-5">
                  <legend className="mb-2 text-sm font-medium text-navy">How useful was it?</legend>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((r, i) => (
                      <button
                        key={r}
                        ref={i === 0 ? firstRef : undefined}
                        type="button"
                        onClick={() => setRating(rating === r ? null : r)}
                        aria-pressed={rating === r}
                        aria-label={`${r} out of 5`}
                        className={cn(
                          "h-11 flex-1 rounded-xl border text-lg transition-colors",
                          rating != null && r <= rating
                            ? "border-amber-400 bg-amber-50 text-amber-600"
                            : "border-navy/15 text-navy/30 hover:bg-cream",
                        )}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <div className="mt-1 flex justify-between text-[11px] text-navy/45">
                    <span>Not useful</span>
                    <span>Very useful</span>
                  </div>
                </fieldset>

                <label className="mt-5 block">
                  <span className="mb-1.5 block text-sm font-medium text-navy">Your message</span>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={2000}
                    rows={4}
                    placeholder="e.g. I couldn't find my son's school, or I wish I could see…"
                    className="w-full rounded-xl border border-navy/15 px-3 py-2.5 text-base outline-none placeholder:text-navy/40 focus:border-navy/40 focus:ring-4 focus:ring-amber/20"
                  />
                </label>

                <label className="mt-4 block">
                  <span className="mb-1.5 block text-sm font-medium text-navy">
                    Email <span className="font-normal text-navy/50">(optional, if you&apos;d like a reply)</span>
                  </span>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={200}
                    className="h-11 w-full rounded-xl border border-navy/15 px-3 text-base outline-none focus:border-navy/40 focus:ring-4 focus:ring-amber/20"
                  />
                </label>

                {/* Honeypot: hidden from people, filled in by spam bots. */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

                {error && (
                  <p role="alert" className="mt-4 text-sm text-rose-700">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="mt-6 h-12 w-full rounded-xl bg-navy text-base font-semibold text-cream hover:bg-navy/90 disabled:opacity-60"
                >
                  {state === "sending" ? "Sending…" : "Send feedback"}
                </button>
                <p className="mt-3 text-center text-xs text-navy/50">
                  See our{" "}
                  <a href="/privacy" className="underline">
                    privacy policy
                  </a>
                  .
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
