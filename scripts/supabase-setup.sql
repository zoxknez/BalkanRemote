-- Enable extensions if needed
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Questions table
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  user_email text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.questions enable row level security;

-- Select: everyone can read
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'questions' and policyname = 'read questions'
  ) then
    create policy "read questions" on public.questions for select using (true);
  end if;
end $$;

-- Insert: only authenticated users can insert
do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'questions' and policyname = 'insert own question'
  ) then
    create policy "insert own question" on public.questions for insert with check (auth.role() = 'authenticated');
  end if;
end $$;

-- Job portal listings (aggregated feeds)
create table if not exists public.job_portal_listings (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  external_id text not null,
  title text not null,
  company text not null,
  company_logo text,
  location text,
  type text,
  category text,
  description text,
  requirements text[],
  benefits text[],
  salary_min numeric,
  salary_max numeric,
  currency text,
  is_remote boolean not null default true,
  remote_type text,
  experience_level text,
  posted_at timestamptz not null default now(),
  deadline timestamptz,
  url text not null,
  source_url text,
  featured boolean not null default false,
  tags text[] default array[]::text[],
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists job_portal_unique_source_external on public.job_portal_listings(source_id, external_id);
create index if not exists job_portal_posted_at_idx on public.job_portal_listings (posted_at desc);
create index if not exists job_portal_category_idx on public.job_portal_listings (category);
create index if not exists job_portal_type_idx on public.job_portal_listings (type);

-- trigger to keep updated_at fresh
create or replace function public.set_job_portal_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists job_portal_set_updated_at on public.job_portal_listings;
create trigger job_portal_set_updated_at
before update on public.job_portal_listings
for each row execute function public.set_job_portal_updated_at();

alter table public.job_portal_listings enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'job_portal_listings' and policyname = 'read job portal listings'
  ) then
    create policy "read job portal listings" on public.job_portal_listings for select using (true);
  end if;
end $$;
