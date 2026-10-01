/**
 * Creates (or updates) the site owner's login for the /owner analytics
 * dashboard. The password is read from the environment for this one run and
 * is never written to a file.
 *
 * Usage (from the project folder):
 *   OWNER_EMAIL=you@example.com OWNER_PASSWORD='your-password' \
 *     DOTENV_CONFIG_PATH=.env.local npm run create-owner
 *
 * Then set OWNER_EMAIL (same address) in Vercel's environment variables.
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = (process.env.OWNER_EMAIL ?? "").split(",")[0].trim().toLowerCase();
  const password = process.env.OWNER_PASSWORD ?? "";

  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (.env.local).");
  if (!email) throw new Error("Set OWNER_EMAIL to the email you want to sign in with.");
  if (password.length < 8) throw new Error("Set OWNER_PASSWORD (at least 8 characters) for this run.");

  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

  // Find an existing account with this email (paging through users).
  let existing: { id: string; app_metadata: Record<string, unknown> } | null = null;
  for (let page = 1; page <= 50 && !existing; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    existing = data.users.find((u) => (u.email ?? "").toLowerCase() === email) ?? null;
    if (data.users.length < 200) break;
  }

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      app_metadata: { ...existing.app_metadata, owner: true },
    });
    if (error) throw error;
    console.log(`Updated ${email}: password reset, marked as site owner.`);
  } else {
    const { error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { owner: true },
    });
    if (error) throw error;
    console.log(`Created ${email} as site owner.`);
  }
  console.log("Sign in at /login, then open /owner. Make sure OWNER_EMAIL is set in your hosting environment too.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
