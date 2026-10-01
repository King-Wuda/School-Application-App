/**
 * Features that depend on outside services. They stay hidden until the
 * service is set up, so the site never promises something it can't do.
 *
 *   NEXT_PUBLIC_REMINDERS_ENABLED=true    after Resend + the send-deadline-reminders
 *                                         Edge Function and its daily schedule are live
 *   NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true  after the Google provider is configured in
 *                                         Supabase → Authentication → Providers
 */
export const FEATURES = {
  reminders: process.env.NEXT_PUBLIC_REMINDERS_ENABLED === "true",
  googleAuth: process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true",
};
