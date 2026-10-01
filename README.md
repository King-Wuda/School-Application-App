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

Then run [`supabase/migrations/0002_directory_and_perf.sql`](supabase/migrations/0002_directory_and_perf.sql) the same way. It adds the official directory columns (EMIS number, phase, quintile, learner numbers…) and the search indexes.

### 4. Seed the schools

```bash
DOTENV_CONFIG_PATH=.env.local npm run seed
```

This loads the curated schools (`data/seed-schools.json`) and then every province directory in `data/schools/` (currently the full Western Cape list, 1,927 schools). The script is idempotent — re-running updates rather than duplicating. Afterwards, click **Refresh site data** in `/admin` so cached pages pick up the new data straight away (otherwise they refresh within an hour).

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
| `npm run seed`     | Push curated + directory schools into Supabase (idempotent)  |
| `npm run import:emis -- "<file>.xlsx"` | Convert a DBE masterlist into `data/schools/<province>.json` |

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
  supabase/                     client.ts (browser), server.ts (SSR), public.ts (cached public reads), admin.ts (service role)
  admin-actions.ts              Server actions for admin CRUD
  types.ts, utils.ts, admin.ts
data/
  seed-schools.json             Curated schools with fees, deadlines, open days
  schools/<province>.json       Official DBE directory per province (generated)
scripts/
  seed.ts                       Loads data/ into Supabase
  import-emis.ts                DBE masterlist .xlsx → data/schools/<province>.json
supabase/
  migrations/0001_init.sql      Tables, indexes, RLS
  migrations/0002_…sql          Directory columns + search indexes
  functions/send-deadline-reminders/index.ts
```

## Data source

### Official school directory

Every school listing comes from the Department of Basic Education's **Schools Masterlist** (EMIS), which is free, official and updated quarterly: <https://www.education.gov.za/Programmes/EMIS/EMISDownloads.aspx> → *Schools Masterlist Data*.

We're rolling out one province at a time so each one is complete and correct before we move on:

| Province | Status | Schools |
| --- | --- | --- |
| Western Cape | ✅ Complete (Masterlist 2025) | 1,927 open ordinary and special-needs schools |
| Others | ⏳ Not imported yet | Only curated schools |

Adding a province:

1. Download that province's `.xlsx` from the page above.
2. `npm run import:emis -- "path/to/Gauteng.xlsx"`. This prints a summary and lists any curated school it couldn't match. Add those to `MANUAL_MATCHES` in `scripts/import-emis.ts` and run the import again.
3. Commit `data/schools/<province>.json`, then run `npm run seed` and click **Refresh site data** in `/admin`.

What the directory gives you: name, public/independent, phase (primary / high / combined / intermediate / special needs / school of skills), address, GPS, phone, district, quintile, no-fee status, learner and educator counts. What it doesn't give you: fees, application deadlines, open days or websites. Those still come from the curated seed and the admin panel. Grade spans are the standard ones for each phase (for example, primary = Grade R–7), so a school with an unusual span needs a manual correction in admin. Closed schools and hospital schools are left out. Some official names are cut off at about 40 characters in the source data.

### Curated schools

The curated seed contains 55 schools across Gauteng, Western Cape and KwaZulu-Natal: 15+ public, 15+ Model C, 15+ private, and 5 universities. Fees, deadlines and addresses are approximate and sourced from public websites — always verify on each school's own site. The admin panel is how you keep the dataset fresh.

## What's deliberately not in the MVP

- In-app application submission
- Reviews and ratings
- Tutor / transport marketplace
- Paid featured listings
- Native mobile app
- Multi-language UI

## License

Internal project — all rights reserved.
