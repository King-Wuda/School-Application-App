import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin";

export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  const res = NextResponse.redirect(`${origin}/admin`, { status: 303 });
  res.cookies.delete(ADMIN_COOKIE);
  return res;
}
