import type { User } from "@supabase/supabase-js";
import { getSupabaseServerClient, hasSupabaseEnv } from "./supabase/server";

/** Comma-separated list of emails allowed into /owner, from the OWNER_EMAIL env var. */
export function ownerEmails(): string[] {
  return (process.env.OWNER_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export type OwnerCheck =
  | { status: "not-configured" }
  | { status: "signed-out" }
  | { status: "denied" }
  | { status: "owner"; user: User };

/**
 * Who may see the analytics dashboard. Both conditions must hold:
 *   1. the signed-in email is listed in OWNER_EMAIL, and
 *   2. the account carries app_metadata.owner = true.
 * Users can't edit app_metadata themselves — only `npm run create-owner`
 * (service role) sets it — so registering with the owner's email address
 * is not enough to get in.
 */
export async function checkOwner(): Promise<OwnerCheck> {
  const allowed = ownerEmails();
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY || allowed.length === 0) {
    return { status: "not-configured" };
  }
  // getUser() re-validates the session with Supabase Auth on every call,
  // unlike getSession(), which trusts the cookie as-is.
  const { data, error } = await getSupabaseServerClient().auth.getUser();
  const user = data?.user;
  if (error || !user) return { status: "signed-out" };
  const emailOk = allowed.includes((user.email ?? "").toLowerCase());
  const flagOk = user.app_metadata?.owner === true;
  if (!emailOk || !flagOk || !user.email_confirmed_at) return { status: "denied" };
  return { status: "owner", user };
}
