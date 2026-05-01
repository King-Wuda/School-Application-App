import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_MAX_AGE_S,
  issueAdminToken,
  verifyAdminPassword,
} from "@/lib/admin";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Set ADMIN_PASSWORD in your .env.local first." },
      { status: 500 },
    );
  }
  if (typeof body?.password !== "string" || !verifyAdminPassword(body.password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, issueAdminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_MAX_AGE_S,
  });
  return res;
}
