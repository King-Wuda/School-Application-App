-- SchoolFinder SA — official school directory fields + search performance
-- Run after 0001_init.sql (Supabase SQL editor or CLI). Safe to re-run.

-- ─── Official directory fields (from the DBE EMIS school masterlist) ───────
alter table schools add column if not exists emis_number bigint;
alter table schools add column if not exists phase text;           -- primary | secondary | combined | intermediate | special_needs | school_of_skills
alter table schools add column if not exists special_needs boolean default false;
alter table schools add column if not exists no_fee_school boolean;
alter table schools add column if not exists quintile smallint;    -- 1 (poorest) … 5 (least poor); null for independent schools
alter table schools add column if not exists learner_count int;
alter table schools add column if not exists educator_count int;
alter table schools add column if not exists town text;
alter table schools add column if not exists district text;
alter table schools add column if not exists phone text;
alter table schools add column if not exists urban_rural text;
alter table schools add column if not exists data_source text;     -- e.g. 'DBE Masterlist 2025'

create unique index if not exists schools_emis_number_key on schools (emis_number);

-- Numeric grade span, derived from the free-text grades_from / grades_to so
-- admin edits keep it in sync automatically. Grade R = 0.
alter table schools add column if not exists grade_min smallint generated always as (
  case
    when grades_from is null then null
    when grades_from ~* '\mR\M' then 0
    else nullif(substring(grades_from from '[0-9]+'), '')::smallint
  end
) stored;
alter table schools add column if not exists grade_max smallint generated always as (
  case
    when grades_to is null then null
    when grades_to ~* '\mR\M' then 0
    else nullif(substring(grades_to from '[0-9]+'), '')::smallint
  end
) stored;

-- ─── Accent-insensitive search text ────────────────────────────────────────
-- Parents type "hoerskool" on a phone, not "Hoërskool". search_text is the
-- name + suburb + town + address, lower-cased, with accents and punctuation
-- removed, so every search word can be matched with one indexed ilike.
create schema if not exists extensions;
create extension if not exists unaccent with schema extensions;

do $$
declare ext_schema text;
begin
  select n.nspname into ext_schema
  from pg_extension e join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'unaccent';
  execute format(
    'create or replace function public.f_unaccent(text) returns text
       language sql immutable parallel safe strict
       as $f$ select %1$I.unaccent(%2$L::regdictionary, $1) $f$',
    ext_schema, ext_schema || '.unaccent');
end $$;

alter table schools add column if not exists search_text text generated always as (
  regexp_replace(
    public.f_unaccent(lower(
      coalesce(name, '') || ' ' || coalesce(suburb, '') || ' ' || coalesce(town, '') || ' ' || coalesce(address, '')
    )),
    '[^a-z0-9 ]', '', 'g'
  )
) stored;

create index if not exists schools_search_text_trgm_idx on schools using gin (search_text gin_trgm_ops);

-- ─── Search indexes ────────────────────────────────────────────────────────
-- Free-text search uses `ilike '%q%'` across name / suburb / town / address;
-- trigram GIN indexes make those lookups index-backed instead of full scans.
create index if not exists schools_suburb_trgm_idx on schools using gin (suburb gin_trgm_ops);
create index if not exists schools_town_trgm_idx on schools using gin (town gin_trgm_ops);
create index if not exists schools_address_trgm_idx on schools using gin (address gin_trgm_ops);

-- Default ordering (featured first, then A–Z), optionally within a province.
create index if not exists schools_featured_name_idx on schools (is_featured desc, name);
create index if not exists schools_province_featured_name_idx on schools (province, is_featured desc, name);
create index if not exists schools_province_type_idx on schools (province, type);

-- Fee filters and sorts.
create index if not exists schools_fee_min_idx on schools (fee_monthly_min);
create index if not exists schools_fee_max_idx on schools (fee_monthly_max);

-- "Schools near me": bounding-box lookup on coordinates.
create index if not exists schools_lat_lng_idx on schools (latitude, longitude);
create index if not exists schools_no_fee_idx on schools (no_fee_school) where no_fee_school = true;

-- Grade / level filters.
create index if not exists schools_grade_span_idx on schools (grade_min, grade_max);
create index if not exists schools_special_needs_idx on schools (special_needs) where special_needs = true;

-- Refresh planner statistics after adding indexes / bulk imports.
analyze schools;
