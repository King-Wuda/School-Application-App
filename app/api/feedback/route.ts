import { NextResponse } from "next/server";
import { canStore, clean, clientKey, deviceFromUserAgent, insertRows, rateLimited } from "@/lib/analytics/server";

export const dynamic = "force-dynamic";

/** Stores a message from the feedback button. */
export async function POST(req: Request) {
  if (rateLimited(`fb:${clientKey(req)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ ok: false, error: "Too many messages — please try again later." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Bots fill in the hidden "website" field; people never see it.
  if (body.website) return NextResponse.json({ ok: true });

  const rating = Number(body.rating);
  const message = clean(body.message, 2000);
  const email = clean(body.email, 200);
  if (!message && !(rating >= 1 && rating <= 5)) {
    return NextResponse.json({ ok: false, error: "Please add a rating or a message." }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "That email address doesn't look right." }, { status: 400 });
  }

  if (!canStore()) {
    // No database configured (local preview) — accept so the UI can be tried out.
    return NextResponse.json({ ok: true });
  }

  await insertRows("feedback", [
    {
      rating: rating >= 1 && rating <= 5 ? Math.round(rating) : null,
      message,
      email,
      path: clean(body.path, 300),
      session_id: clean(body.session, 64),
      device: deviceFromUserAgent(req.headers.get("user-agent")),
    },
  ]);
  return NextResponse.json({ ok: true });
}
