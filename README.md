# SchoolFinder SA

A mobile-first search and comparison tool for every school and university in South Africa. Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, and Supabase.

## Features

- **Search & browse** every school by name, province, type, grades, and fee range
- **Detail pages** with fees, grades, deadlines, open days, maps, JSON-LD structured data
- **Shortlist** up to 10 schools (localStorage-first, syncs to Supabase on sign-in)
- **Compare** up to 3 schools side-by-side
- **Deadline reminders** — saved per user; emails 30 and 7 days before each closes
- **PDF export** of shortlist (client-side, no server dep)
- **Admin panel** (`/admin`) — add/edit schools, deadlines, open days; toggle featured
- **Auth** — Google + email/password via Supabase Auth
- **SEO** — dynamic titles, OG tags, `EducationalOrganization` JSON-LD on every school page
- **Works offline from Supabase** — until you configure Supabase, the app serves a bundled seed of 55 real SA schools so you can preview everything end-to-end

## Quick start (local, no Supabase needed)

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. You can browse, shortlist, and compare using the bundled seed data. Auth, deadline reminders, and the admin panel need Supabase.

## Full setup (with Supabase)

### 1. Create a Supabase project

1. Go to <https://supabase.com> → **New project**
2. Note your project URL and `anon` + `service_role` keys (Project Settings → API)

### 2. Configure env vars

```bash
cp .env.local.example .env.local
# then fill in:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
#   SUPABASE_SERVICE_ROLE_KEY
#   ADMIN_PASSWORD          ← any strong password; used to log into /admin
#   NEXT_PUBLIC_SITE_URL    ← http://localhost:3000 for local dev
```

### 3. Run the schema migration

Open **SQL editor** in Supabase, paste the contents of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), and run it. This creates the tables, indexes, row-level security policies, and a trigger that auto-creates a `profiles` row on user sign-up.

### 4. Seed 55 real SA schools

```bash
npm run seed
```

The script is idempotent — re-running updates rather than duplicating.

### 5. Enable auth providers

In Supabase → **Authentication → Providers**:

- **Email** — enable. Turn off "Confirm email" for local dev if you want; keep it on in production.
- **Google** — enable and paste your Google OAuth client ID/secret. Add `<your-site>/auth/callback` to the redirect allow list.

### 6. Start dev

```bash
npm run dev
```

Visit `/admin` to log in (password = `ADMIN_PASSWORD`). Visit `/login` for user auth.

## Email reminders (deadline notifications)

The reminder emails run in a Supabase Edge Function. To enable:

1. Get a Resend API key from <https://resend.com>
2. `supabase secrets set RESEND_API_KEY=re_…`
3. `supabase secrets set RESEND_FROM_EMAIL="SchoolFinder SA <noreply@your-domain.com>"`
4. `supabase secrets set PUBLIC_SITE_URL=https://your-domain.com`
5. Deploy: `supabase functions deploy send-deadline-reminders --no-verify-jwt`
6. Schedule it daily (Supabase → SQL editor):

   ```sql
   select cron.schedule(
     'send-deadline-reminders-daily',
     '0 8 * * *',
     $$
       select net.http_post(
         url:='https://<project-ref>.functions.supabase.co/send-deadline-reminders',
         headers:='{"Authorization":"Bearer <service-role-key>"}'::jsonb
       )
     $$
   );
   ```

The function checks all `reminders`, and for each deadline between now and its close date, sends a 30-day email (if not already sent) and a 7-day email (if not already sent), recording which notifications have gone out.

## Deploying to Vercel

1. Push this repo to GitHub
2. <https://vercel.com/new> → import the repo
3. Add the same env vars from `.env.local` in Vercel's project settings
4. Deploy

## Scripts

| Command            | What it does                                                 |
| ------------------ | ------------------------------------------------------------ |
| `npm run dev`      | Local dev server on :3000                                    |
| `npm run build`    | Production build (prerenders school detail pages)            |
| `npm run start`    | Serve the production build                                   |
| `npm run typecheck`| `tsc --noEmit`                                               |
| `npm run seed`     | Push `data/seed-schools.json` into Supabase (idempotent)     |

## Project layout

```
app/
  page.tsx                      Homepage
  search/page.tsx               Search results
  schools/[slug]/page.tsx       School detail (SSG + SEO + JSON-LD)
  universities/[slug]/page.tsx  Same component, different route
  compare/page.tsx              Side-by-side compare
  account/                      Dashboard, shortlist, deadlines (client-side)
  admin/                        Single-password admin panel (server actions)
  login/                        Email + Google sign-in
  auth/callback/route.ts        OAuth PKCE callback
  api/schools/route.ts          Batch fetch by ID (used by /compare, /shortlist)
components/
  ui/                           Button, Badge, Input, Card, Icons, SchoolAvatar
  layout/                       SiteHeader, SiteFooter
  schools/                      SchoolCard, DistanceBadge, DeadlineCard, OpenDayCard
  search/                       SearchForm, FilterSidebar, SortSelect, Pagination
  shortlist/                    ShortlistProvider (context), ShortlistButton, PDF export
  compare/                      CompareClient (table)
  admin/                        SchoolForm, DeadlineForm, OpenDayForm
lib/
  data.ts                       One data layer — Supabase when configured, else seed JSON
  supabase/                     client.ts (browser), server.ts (SSR), admin.ts (service role)
  admin-actions.ts              Server actions for admin CRUD
  types.ts, utils.ts, admin.ts
data/
  seed-schools.json             55 real SA schools (the fallback + seed source)
supabase/
  migrations/0001_init.sql      Tables, indexes, RLS
  functions/send-deadline-reminders/index.ts
```

## Data source

The seed contains 55 schools across Gauteng, Western Cape and KwaZulu-Natal: 15+ public, 15+ Model C, 15+ private, and 5 universities. Fees, deadlines and addresses are approximate and sourced from public websites — always verify on each school's own site. The admin panel is how you keep the dataset fresh.

## What's deliberately not in the MVP

- In-app application submission
- Reviews and ratings
- Tutor / transport marketplace
- Paid featured listings
- Native mobile app
- Multi-language UI

## License

Internal project — all rights reserved.
