# SchoolFinder SA — MVP Build Spec

## Project Overview

Build a web application that allows South African parents and students to search, compare, and shortlist schools and universities. Think of it as the "Skyscanner for South African education" — users search and compare, then get sent to the school's website to apply directly.

The MVP must be fast, mobile-first, and work well for users in townships and suburbs alike (assume some users are on slower connections).

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (Postgres) — for school data and user saved lists
- **Auth**: Supabase Auth (Google login + email)
- **Deployment**: Vercel

---

## Design Direction

- **Tone**: Clean, trustworthy, and approachable. Parents need to feel confident in the data. Think editorial + utility — not corporate, not playful.
- **Color palette**: Deep navy (`#0A1628`) as primary, warm white (`#F9F7F4`) as background, a bright amber/gold (`#F5A623`) as accent. Feels premium without being exclusive.
- **Typography**: Use `Fraunces` (serif, distinctive) for headings, `DM Sans` for body text. Both available on Google Fonts.
- **Mobile-first**: Most South African users will access this on mobile. Every screen must work perfectly on a 375px viewport.
- **Performance**: Lazy load images, minimise JS bundle. Target Lighthouse score > 85.

---

## Core Features to Build

### 1. Homepage

- Hero section with a prominent search bar (search by school name, area, or suburb)
- Filter options: Province, School Type (Public / Model C / Private / University), Grade Range, Monthly Fee Range
- Short value proposition copy: *"Find and compare every school in South Africa. Free, fast, and unbiased."*
- Featured schools section (placeholder for future paid listings — style these with a subtle "Featured" badge)
- Statistics bar: e.g. "4,200+ schools listed · 9 provinces · Updated monthly"

### 2. Search Results Page

Each result card must show:
- School name and logo (fallback to initials avatar if no logo)
- School type badge (Public / Model C / Private)
- Distance from user (use browser geolocation, fallback to province filter)
- Monthly fee range (e.g. "R800 – R1,200/month")
- Grades offered (e.g. "Grade R – 12")
- Star rating (placeholder for future reviews — show as "No ratings yet" for now)
- Two CTAs: **"View Details"** and **"Visit Website"** (external link to school's own site)
- **"Save to Shortlist"** button (heart icon, requires login)

Results should be sortable by: Distance, Fee (low to high), Fee (high to low), Alphabetical.

Pagination: 20 results per page.

### 3. School Detail Page

Full profile page for each school. Sections:

**Header**
- School name, logo, type badge
- Address + Google Maps embed
- Direct link to school website
- "Save to Shortlist" button

**Key Info Panel**
- Monthly fees (or annual)
- Grades offered
- Language of instruction
- Boarding available (Yes/No)
- Province and suburb

**Application Deadlines** *(core differentiator)*
- A dedicated section showing:
  - Grade R / Grade 1 application open date
  - Grade 8 application open date
  - Closing date
  - Application fee (if known)
  - Direct link to application page on school's website
- If dates are unknown, show: *"Deadline not confirmed — check school website"*
- If deadline is within 30 days, show a red urgency badge: **"Closing Soon"**

**Open Days**
- List of upcoming open day dates
- Format: Date · Time · Location (e.g. main campus / virtual)
- If no open days listed, show: *"No open days listed. Contact the school directly."*

**About**
- Short description of the school (2-3 sentences)
- Extracurricular highlights (sports, arts, tech — shown as tags)
- Affiliation (e.g. IEB, NSC, Cambridge)

### 4. Shortlist / Compare Feature

- Users can save up to 10 schools to their shortlist (requires login)
- A **Compare** view that shows up to 3 schools side-by-side in a table
- Comparison columns: Fees, Grades, Type, Distance, Boarding, Curriculum, Application Deadline
- Export shortlist as PDF (simple styled list with school names, fees, deadlines, and website links)

### 5. Deadline Tracker (Notification Feature)

- On any school detail page, logged-in users can click **"Remind Me"** next to an application deadline
- This saves the reminder to their account
- A **My Deadlines** page shows all their saved reminders in chronological order
- Each reminder shows: School name, Grade applying for, Deadline date, Days remaining, Link to apply
- Email notification 30 days before and 7 days before deadline (use Supabase Edge Functions + Resend for email)

### 6. User Account

- Login via Google or email/password
- Profile stores: child's current grade, province, saved shortlist, deadline reminders
- Simple dashboard showing: Shortlisted Schools, Upcoming Deadlines, Recently Viewed

---

## Database Schema

```sql
-- Schools table
create table schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  type text check (type in ('public', 'model_c', 'private', 'university')),
  province text not null,
  suburb text,
  address text,
  latitude float,
  longitude float,
  website_url text,
  logo_url text,
  description text,
  grades_from text,
  grades_to text,
  fee_monthly_min int,
  fee_monthly_max int,
  language text,
  boarding boolean default false,
  curriculum text,
  extracurriculars text[],
  is_featured boolean default false,
  created_at timestamptz default now()
);

-- Application deadlines
create table deadlines (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id),
  grade_group text, -- e.g. 'Grade R', 'Grade 1', 'Grade 8', 'Grade 10'
  open_date date,
  close_date date,
  application_fee int,
  application_url text,
  notes text
);

-- Open days
create table open_days (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id),
  event_date date not null,
  start_time time,
  end_time time,
  location text,
  is_virtual boolean default false,
  rsvp_url text
);

-- User shortlists
create table shortlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  school_id uuid references schools(id),
  created_at timestamptz default now(),
  unique(user_id, school_id)
);

-- Deadline reminders
create table reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  deadline_id uuid references deadlines(id),
  grade_applying_for text,
  notified_30_days boolean default false,
  notified_7_days boolean default false,
  created_at timestamptz default now()
);
```

---

## Seed Data

Populate the database with at least **50 real schools** across Gauteng and Western Cape to launch with. Include a mix of:
- 15 public schools
- 15 model C schools
- 15 private schools
- 5 universities (UCT, Wits, UP, Stellenbosch, UJ)

For each school include real: website URL, fee range (approximate is fine), grades, address, and at least one deadline if publicly available.

---

## Admin Panel (Simple)

Build a basic `/admin` route (protected, single hardcoded admin login for MVP) that allows:
- Add a new school (form)
- Edit an existing school
- Add/edit deadlines for a school
- Add/edit open days for a school
- Toggle `is_featured` flag on a school

No need for a full CMS — a simple form-based interface is sufficient for MVP.

---

## SEO Requirements

Every school detail page must have:
- Dynamic `<title>`: e.g. *"Reddam House Bedfordview — Fees, Deadlines & Info | SchoolFinder SA"*
- Meta description with school name, type, province, and fee range
- OpenGraph tags for social sharing
- Structured data (JSON-LD) for `EducationalOrganization` schema

Homepage and search results pages must also have proper meta tags.

---

## Pages & Routes

```
/                          → Homepage
/search                    → Search results (query params: q, province, type, grade, fee_min, fee_max)
/schools/[slug]            → School detail page
/universities/[slug]       → University detail page (same component, different type)
/compare                   → Side-by-side comparison (up to 3 schools)
/account                   → User dashboard
/account/shortlist         → Saved schools
/account/deadlines         → Saved deadline reminders
/admin                     → Admin panel (protected)
```

---

## What NOT to Build in MVP

Do not build these — they come later:
- In-app application submission
- Reviews and ratings system
- Tutor/transport marketplace
- Payment processing for featured listings
- Mobile app (web only for now)
- Multi-language support

---

## Definition of Done

The MVP is complete when:
- [ ] A parent can search for schools by location and type and get relevant results
- [ ] Each school has a detail page with fees, deadlines, open days, and a link to apply
- [ ] A user can create an account, save a shortlist, and set deadline reminders
- [ ] The compare feature works for up to 3 schools
- [ ] The admin panel allows adding and editing school data
- [ ] The site is deployed to Vercel and accessible on mobile
- [ ] At least 50 real schools are seeded in the database
- [ ] Email reminders are functional (30 day and 7 day before deadline)

---

## Suggested Folder Structure

```
/app
  /page.tsx                  → Homepage
  /search/page.tsx           → Search results
  /schools/[slug]/page.tsx   → School detail
  /compare/page.tsx          → Compare view
  /account/
    /page.tsx                → Dashboard
    /shortlist/page.tsx
    /deadlines/page.tsx
  /admin/
    /page.tsx                → Admin dashboard
    /schools/page.tsx        → Manage schools
/components
  /ui/                       → Reusable UI components
  /schools/                  → School card, detail sections
  /search/                   → Search bar, filters
  /compare/                  → Compare table
  /deadlines/                → Deadline card, reminder button
/lib
  /supabase.ts               → Supabase client
  /types.ts                  → TypeScript types
  /utils.ts                  → Helper functions
/public
  /images/
```

---

## Notes for Claude Code

- Use Supabase client-side for auth and shortlist operations
- Use server components and server-side data fetching for school pages (important for SEO)
- Distance calculation: use Haversine formula client-side once geolocation is obtained
- For the deadline urgency badge, calculate days remaining at render time using `date-fns`
- Use `react-to-pdf` or a simple server-side PDF generation for the shortlist export
- All monetary values stored in ZAR (South African Rand, R)
- All distance values displayed in kilometres
- Use `next/image` for all school logos with a fallback component showing school initials