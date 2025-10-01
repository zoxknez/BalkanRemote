-- Table for scraped job listings (aggregated from various job boards)
create table if not exists public.job_scraped_listings (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  source_name text,
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
  posted_at timestamptz not null,
  deadline timestamptz,
  url text not null,
  source_url text,
  featured boolean default false,
  tags text[],
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_scraped_listings_unique unique (source_id, external_id)
);

create index if not exists idx_job_scraped_posted_at on public.job_scraped_listings(posted_at desc);
create index if not exists idx_job_scraped_remote on public.job_scraped_listings(is_remote);
create index if not exists idx_job_scraped_type on public.job_scraped_listings(type);
create index if not exists idx_job_scraped_experience on public.job_scraped_listings(experience_level);
create index if not exists idx_job_scraped_category on public.job_scraped_listings(category);
create index if not exists idx_job_scraped_source on public.job_scraped_listings(source_id);
