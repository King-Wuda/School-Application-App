-- SchoolFinder SA — first-party analytics + user feedback
-- Run after 0002. Safe to re-run.
--
-- Privacy by design:
--   * No cookies, no IP addresses, no user IDs, no precise locations are stored.
--   * session_id is a random value kept in the visitor's sessionStorage; it
--     resets when the tab closes and can't be linked to a person.
--   * Both tables have row-level security ON and NO policies, and are revoked
--     from the public roles — only the server (service role) can touch them.

create table if not exists analytics_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  session_id text not null check (char_length(session_id) <= 64),
  name text not null check (char_length(name) <= 40),
  path text check (char_length(path) <= 300),
  props jsonb not null default '{}'::jsonb,
  referrer text check (char_length(referrer) <= 200),   -- domain only, e.g. "facebook.com"
  utm_source text check (char_length(utm_source) <= 100),
  utm_medium text check (char_length(utm_medium) <= 100),
  utm_campaign text check (char_length(utm_campaign) <= 100),
  device text check (device in ('mobile', 'tablet', 'desktop'))
);

create index if not exists analytics_events_created_idx on analytics_events (created_at desc);
create index if not exists analytics_events_name_created_idx on analytics_events (name, created_at desc);
create index if not exists analytics_events_session_idx on analytics_events (session_id);

create table if not exists feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  rating smallint check (rating between 1 and 5),
  message text check (char_length(message) <= 2000),
  email text check (char_length(email) <= 200),
  path text check (char_length(path) <= 300),
  session_id text check (char_length(session_id) <= 64),
  device text check (device in ('mobile', 'tablet', 'desktop'))
);

create index if not exists feedback_created_idx on feedback (created_at desc);

alter table analytics_events enable row level security;
alter table feedback enable row level security;
revoke all on analytics_events, feedback from anon, authenticated;

-- ─── Dashboard summary ─────────────────────────────────────────────────────
-- One call returns everything the owner dashboard needs, aggregated in the
-- database so it stays fast as traffic grows.
create or replace function analytics_summary(since timestamptz)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with ev as (
    select * from analytics_events where created_at >= since
  ),
  sessions as (
    select session_id,
           min(created_at) as first_seen,
           (array_agg(referrer order by created_at))[1] as referrer,
           (array_agg(utm_source order by created_at))[1] as utm_source,
           (array_agg(utm_campaign order by created_at))[1] as utm_campaign,
           (array_agg(device order by created_at))[1] as device,
           bool_or(name = 'search') as searched,
           bool_or(name = 'school_view') as viewed_school,
           bool_or(name = 'shortlist_add') as saved,
           bool_or(name = 'outbound') as contacted
    from ev group by session_id
  )
  select jsonb_build_object(
    'totals', jsonb_build_object(
      'sessions', (select count(*) from sessions),
      'page_views', (select count(*) from ev where name = 'page_view'),
      'searches', (select count(*) from ev where name = 'search'),
      'zero_result_searches', (select count(*) from ev where name = 'search' and (props->>'results')::int = 0),
      'school_views', (select count(*) from ev where name = 'school_view'),
      'shortlist_adds', (select count(*) from ev where name = 'shortlist_add'),
      'compare_views', (select count(*) from ev where name = 'compare_view'),
      'outbound', (select count(*) from ev where name = 'outbound'),
      'near_me_ok', (select count(*) from ev where name = 'near_me' and props->>'result' = 'ok'),
      'near_me_failed', (select count(*) from ev where name = 'near_me' and props->>'result' <> 'ok'),
      'feedback', (select count(*) from feedback where created_at >= since),
      'avg_rating', (select round(avg(rating)::numeric, 1) from feedback where created_at >= since and rating is not null)
    ),
    'funnel', jsonb_build_object(
      'visited', (select count(*) from sessions),
      'searched', (select count(*) from sessions where searched),
      'viewed_school', (select count(*) from sessions where viewed_school),
      'saved', (select count(*) from sessions where saved),
      'contacted', (select count(*) from sessions where contacted)
    ),
    'daily', coalesce((
      select jsonb_agg(jsonb_build_object('day', d, 'sessions', s, 'page_views', pv) order by d)
      from (
        select date_trunc('day', created_at at time zone 'Africa/Johannesburg')::date as d,
               count(distinct session_id) as s,
               count(*) filter (where name = 'page_view') as pv
        from ev group by 1
      ) x
    ), '[]'::jsonb),
    'sources', coalesce((
      select jsonb_agg(jsonb_build_object('source', src, 'sessions', n) order by n desc)
      from (
        select coalesce(nullif(utm_source, ''), nullif(referrer, ''), 'Direct / unknown') as src, count(*) as n
        from sessions group by 1 order by 2 desc limit 15
      ) x
    ), '[]'::jsonb),
    'campaigns', coalesce((
      select jsonb_agg(jsonb_build_object('campaign', utm_campaign, 'sessions', n) order by n desc)
      from (
        select utm_campaign, count(*) as n from sessions
        where utm_campaign is not null and utm_campaign <> ''
        group by 1 order by 2 desc limit 15
      ) x
    ), '[]'::jsonb),
    'devices', coalesce((
      select jsonb_agg(jsonb_build_object('device', coalesce(device, 'unknown'), 'sessions', n) order by n desc)
      from (select device, count(*) as n from sessions group by 1) x
    ), '[]'::jsonb),
    'top_searches', coalesce((
      select jsonb_agg(jsonb_build_object('term', term, 'count', n, 'zero', zero) order by n desc)
      from (
        select lower(coalesce(nullif(props->>'q', ''), props->>'area')) as term,
               count(*) as n,
               count(*) filter (where (props->>'results')::int = 0) as zero
        from ev
        where name = 'search' and coalesce(nullif(props->>'q', ''), props->>'area') is not null
        group by 1 order by 2 desc limit 20
      ) x
    ), '[]'::jsonb),
    'zero_result_terms', coalesce((
      select jsonb_agg(jsonb_build_object('term', term, 'count', n) order by n desc)
      from (
        select lower(coalesce(nullif(props->>'q', ''), props->>'area', '(filters only)')) as term, count(*) as n
        from ev where name = 'search' and (props->>'results')::int = 0
        group by 1 order by 2 desc limit 20
      ) x
    ), '[]'::jsonb),
    'filters', coalesce((
      select jsonb_agg(jsonb_build_object('filter', f, 'count', n) order by n desc)
      from (
        select f, count(*) as n from (
          select case
                   when props->>'level' is not null then 'Level: ' || (props->>'level') end as f from ev where name = 'search'
          union all select 'Grade: ' || (props->>'grade') from ev where name = 'search' and props->>'grade' is not null
          union all select 'Type: ' || (props->>'type') from ev where name = 'search' and props->>'type' is not null
          union all select 'No-fee only' from ev where name = 'search' and (props->>'no_fee')::boolean
          union all select 'Near me' from ev where name = 'search' and (props->>'near')::boolean
        ) y where f is not null group by 1 order by 2 desc limit 15
      ) x
    ), '[]'::jsonb),
    'top_schools', coalesce((
      select jsonb_agg(jsonb_build_object('slug', slug, 'name', nm, 'views', n) order by n desc)
      from (
        select props->>'slug' as slug, max(props->>'name') as nm, count(*) as n
        from ev where name = 'school_view' group by 1 order by 3 desc limit 15
      ) x
    ), '[]'::jsonb),
    'outbound', coalesce((
      select jsonb_agg(jsonb_build_object('kind', k, 'count', n) order by n desc)
      from (select props->>'kind' as k, count(*) as n from ev where name = 'outbound' group by 1) x
    ), '[]'::jsonb),
    'pages', coalesce((
      select jsonb_agg(jsonb_build_object('path', p, 'views', n) order by n desc)
      from (
        select regexp_replace(path, '^/schools/.+$', '/schools/…') as p, count(*) as n
        from ev where name = 'page_view' group by 1 order by 2 desc limit 10
      ) x
    ), '[]'::jsonb),
    'feedback', coalesce((
      select jsonb_agg(to_jsonb(f) - 'session_id' order by f.created_at desc)
      from (select * from feedback where created_at >= since order by created_at desc limit 100) f
    ), '[]'::jsonb)
  );
$$;

revoke all on function analytics_summary(timestamptz) from public, anon, authenticated;
grant execute on function analytics_summary(timestamptz) to service_role;

-- ─── Retention ─────────────────────────────────────────────────────────────
-- The privacy policy promises usage statistics are deleted after 24 months.
-- /api/events calls this occasionally, so no separate scheduler is needed.
create or replace function purge_old_analytics()
returns void
language sql
security definer
set search_path = public
as $$
  delete from analytics_events where created_at < now() - interval '24 months';
$$;

revoke all on function purge_old_analytics() from public, anon, authenticated;
grant execute on function purge_old_analytics() to service_role;
