-- SchoolFinder SA — initial schema
-- Run this in the Supabase SQL editor (or via the CLI) to provision tables & RLS policies.

create extension if not exists "pgcrypto";
create extension if not exists pg_trgm;

-- ─── Schools ───────────────────────────────────────────────────────────────
create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  type text check (type in ('public', 'model_c', 'private', 'university')) not null,
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

create index if not exists schools_province_idx on schools (province);
create index if not exists schools_type_idx on schools (type);
create index if not exists schools_featured_idx on schools (is_featured) where is_featured = true;
create index if not exists schools_name_trgm_idx on schools using gin (name gin_trgm_ops);

-- ─── Application deadlines ─────────────────────────────────────────────────
create table if not exists deadlines (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade not null,
  grade_group text,
  open_date date,
  close_date date,
  application_fee int,
  application_url text,
  notes text
);

create index if not exists deadlines_school_idx on deadlines (school_id);
create index if not exists deadlines_close_date_idx on deadlines (close_date);

-- ─── Open days ─────────────────────────────────────────────────────────────
create table if not exists open_days (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id) on delete cascade not null,
  event_date date not null,
  start_time time,
  end_time time,
  location text,
  is_virtual boolean default false,
  rsvp_url text
);

create index if not exists open_days_school_idx on open_days (school_id);
create index if not exists open_days_date_idx on open_days (event_date);

-- ─── User shortlists ───────────────────────────────────────────────────────
create table if not exists shortlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  school_id uuid references schools(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, school_id)
);

create index if not exists shortlists_user_idx on shortlists (user_id);

-- ─── Deadline reminders ────────────────────────────────────────────────────
create table if not exists reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  deadline_id uuid references deadlines(id) on delete cascade not null,
  grade_applying_for text,
  notified_30_days boolean default false,
  notified_7_days boolean default false,
  created_at timestamptz default now(),
  unique(user_id, deadline_id)
);

create index if not exists reminders_user_idx on reminders (user_id);

-- ─── User profile (extends auth.users) ─────────────────────────────────────
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  child_current_grade text,
  province text,
  created_at timestamptz default now()
);

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── Recently viewed (session-scoped, cleaned up periodically) ─────────────
create table if not exists recently_viewed (
  user_id uuid references auth.users(id) on delete cascade not null,
  school_id uuid references schools(id) on delete cascade not null,
  viewed_at timestamptz default now(),
  primary key (user_id, school_id)
);

-- ─── Row-Level Security ────────────────────────────────────────────────────
alter table schools enable row level security;
alter table deadlines enable row level security;
alter table open_days enable row level security;
alter table shortlists enable row level security;
alter table reminders enable row level security;
alter table profiles enable row level security;
alter table recently_viewed enable row level security;

-- Public read of schools / deadlines / open_days
drop policy if exists "schools readable" on schools;
create policy "schools readable" on schools for select using (true);

drop policy if exists "deadlines readable" on deadlines;
create policy "deadlines readable" on deadlines for select using (true);

drop policy if exists "open days readable" on open_days;
create policy "open days readable" on open_days for select using (true);

-- Users can manage their own shortlists
drop policy if exists "own shortlist select" on shortlists;
create policy "own shortlist select" on shortlists for select
  using (auth.uid() = user_id);
drop policy if exists "own shortlist insert" on shortlists;
create policy "own shortlist insert" on shortlists for insert
  with check (auth.uid() = user_id);
drop policy if exists "own shortlist delete" on shortlists;
create policy "own shortlist delete" on shortlists for delete
  using (auth.uid() = user_id);

-- Users can manage their own reminders
drop policy if exists "own reminder select" on reminders;
create policy "own reminder select" on reminders for select
  using (auth.uid() = user_id);
drop policy if exists "own reminder insert" on reminders;
create policy "own reminder insert" on reminders for insert
  with check (auth.uid() = user_id);
drop policy if exists "own reminder delete" on reminders;
create policy "own reminder delete" on reminders for delete
  using (auth.uid() = user_id);

-- Users see their own profile
drop policy if exists "own profile select" on profiles;
create policy "own profile select" on profiles for select
  using (auth.uid() = id);
drop policy if exists "own profile update" on profiles;
create policy "own profile update" on profiles for update
  using (auth.uid() = id);

-- Recently viewed: own only
drop policy if exists "own rv select" on recently_viewed;
create policy "own rv select" on recently_viewed for select
  using (auth.uid() = user_id);
drop policy if exists "own rv upsert" on recently_viewed;
create policy "own rv upsert" on recently_viewed for insert
  with check (auth.uid() = user_id);
drop policy if exists "own rv update" on recently_viewed;
create policy "own rv update" on recently_viewed for update
  using (auth.uid() = user_id);
drop policy if exists "own rv delete" on recently_viewed;
create policy "own rv delete" on recently_viewed for delete
  using (auth.uid() = user_id);
