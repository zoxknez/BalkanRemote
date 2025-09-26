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
