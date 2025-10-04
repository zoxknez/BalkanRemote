-- Core tables for official feed ingestion & telemetry
create table if not exists scrape_runs (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  status text check (status in ('ok','error')) default 'ok',
  attempts int default 0,
  successes int default 0,
  errors int default 0,
  items_inserted int default 0,
  mean_latency_ms int,
  notes text,
  meta jsonb
);
create index if not exists idx_scrape_runs_source_started on scrape_runs(source_id, started_at desc);

create table if not exists jobs (
  stable_key text primary key,
  source_id text not null,
  source_name text not null,
  title text not null,
  company text not null,
  location text,
  remote boolean not null default true,
  salary_min numeric,
  salary_max numeric,
  salary_currency text,
  posted_at timestamptz not null,
  apply_url text not null,
  raw jsonb
);
