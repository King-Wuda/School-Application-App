// Supabase Edge Function — sends deadline email reminders via Resend.
//
// Deploy:
//   supabase functions deploy send-deadline-reminders --no-verify-jwt
//
// Secrets:
//   supabase secrets set RESEND_API_KEY=re_...
//   supabase secrets set RESEND_FROM_EMAIL="SchoolFinder SA <noreply@your-domain.com>"
//   supabase secrets set PUBLIC_SITE_URL=https://your-domain.com
//
// Schedule (daily at 08:00 UTC) via Supabase cron:
//   SELECT cron.schedule(
//     'send-deadline-reminders-daily',
//     '0 8 * * *',
//     $$ select net.http_post(
//          url:='https://<project>.functions.supabase.co/send-deadline-reminders',
//          headers:='{"Authorization":"Bearer <service-role-key>"}'::jsonb
//        ) $$
//   );

// @ts-ignore — Deno runtime imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

declare const Deno: {
  env: { get(key: string): string | undefined };
  serve: (handler: (req: Request) => Promise<Response> | Response) => void;
};

const SITE_URL = Deno.env.get("PUBLIC_SITE_URL") ?? "https://schoolfinder.co.za";
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const RESEND_FROM_EMAIL =
  Deno.env.get("RESEND_FROM_EMAIL") ?? "SchoolFinder SA <noreply@schoolfinder.co.za>";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

interface RemindRow {
  id: string;
  user_id: string;
  grade_applying_for: string | null;
  notified_30_days: boolean;
  notified_7_days: boolean;
  deadlines: {
    id: string;
    grade_group: string | null;
    close_date: string | null;
    application_url: string | null;
    schools: { name: string; slug: string } | null;
  } | null;
}

/**
 * Calendar days between today (Africa/Johannesburg) and close (also a calendar
 * date). Using SA-local "today" avoids firing the 7-day email one day late when
 * the cron runs after SA midnight but before UTC midnight.
 */
function daysUntil(closeIso: string): number {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Johannesburg",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const a = new Date(`${today}T00:00:00Z`).getTime();
  const b = new Date(`${closeIso}T00:00:00Z`).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend failed (${res.status}): ${body}`);
  }
}

function renderEmail(
  schoolName: string,
  schoolSlug: string,
  grade: string,
  closeDate: string,
  applicationUrl: string | null,
  days: number,
) {
  const url = applicationUrl ?? `${SITE_URL}/schools/${schoolSlug}`;
  const headline =
    days <= 0
      ? "Closes today"
      : days === 1
        ? "1 day left"
        : `${days} days left`;
  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#0A1628">
      <h1 style="font-family:Georgia,serif;font-size:22px;margin:0 0 8px">
        ${headline} — ${schoolName}
      </h1>
      <p style="font-size:15px;color:#4A5568;margin:0 0 20px">
        The ${grade} application closes on <strong>${closeDate}</strong>.
      </p>
      <a href="${url}"
         style="display:inline-block;background:#0A1628;color:#F9F7F4;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
        Start application →
      </a>
      <hr style="border:none;border-top:1px solid #e6e9ee;margin:28px 0">
      <p style="font-size:13px;color:#6B7280;margin:0">
        You saved this reminder on
        <a href="${SITE_URL}/account/deadlines" style="color:#0A1628">SchoolFinder SA</a>.
      </p>
    </div>
  `;
}

Deno.serve(async () => {
  const { data, error } = await supabase
    .from("reminders")
    .select(
      `
      id, user_id, grade_applying_for, notified_30_days, notified_7_days,
      deadlines ( id, grade_group, close_date, application_url,
                  schools ( name, slug ) )
      `,
    );

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rows = (data ?? []) as unknown as RemindRow[];

  // Fetch user emails in one round-trip. profiles.id FKs to auth.users.id so
  // we join by user_id → profile. We do this separately because reminders
  // does not have a direct FK to profiles (both go through auth.users).
  const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
  const emailMap = new Map<string, string>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      if (p.email) emailMap.set(p.id as string, p.email as string);
    }
  }

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  for (const row of rows) {
    const close = row.deadlines?.close_date;
    const email = emailMap.get(row.user_id);
    const school = row.deadlines?.schools;
    if (!close || !email || !school) {
      skipped++;
      continue;
    }

    const days = daysUntil(close);
    const shouldSend30 = days <= 30 && days > 7 && !row.notified_30_days;
    const shouldSend7 = days <= 7 && days >= 0 && !row.notified_7_days;
    if (!shouldSend30 && !shouldSend7) continue;

    const grade = row.grade_applying_for ?? row.deadlines?.grade_group ?? "Application";
    const html = renderEmail(
      school.name,
      school.slug,
      grade,
      close,
      row.deadlines?.application_url ?? null,
      days,
    );
    const subject =
      days <= 0
        ? `Closes today: ${school.name}`
        : days <= 7
          ? `${days} day${days === 1 ? "" : "s"} left: ${school.name}`
          : `${days} days to apply: ${school.name}`;

    try {
      await sendEmail(email, subject, html);
      const patch: Record<string, boolean> = shouldSend7
        ? { notified_7_days: true }
        : { notified_30_days: true };
      await supabase.from("reminders").update(patch).eq("id", row.id);
      sent++;
    } catch (e) {
      console.error("send failed", e);
      failed++;
    }
  }

  return new Response(
    JSON.stringify({ ok: true, sent, failed, skipped, total: rows.length }),
    { headers: { "Content-Type": "application/json" } },
  );
});
