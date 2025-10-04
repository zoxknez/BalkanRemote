-- Row Level Security policies for job portal tables

-- Enable RLS on all tables
alter table public.job_portal_listings enable row level security;
alter table public.job_feed_stats enable row level security;
alter table public.job_portal_bookmarks enable row level security;

-- Job portal listings policies (public read access)
drop policy if exists "read job portal listings" on public.job_portal_listings;
create policy "read job portal listings" 
  on public.job_portal_listings 
  for select 
  using (true);

-- Job feed stats policies (public read access for monitoring)
drop policy if exists "read job feed stats" on public.job_feed_stats;
create policy "read job feed stats" 
  on public.job_feed_stats 
  for select 
  using (true);

-- Bookmark policies (users can only access their own bookmarks)
drop policy if exists "select own bookmarks" on public.job_portal_bookmarks;
create policy "select own bookmarks" 
  on public.job_portal_bookmarks 
  for select 
  using (auth.uid() = user_id);

drop policy if exists "insert own bookmarks" on public.job_portal_bookmarks;
create policy "insert own bookmarks" 
  on public.job_portal_bookmarks 
  for insert 
  with check (auth.uid() = user_id);

drop policy if exists "delete own bookmarks" on public.job_portal_bookmarks;
create policy "delete own bookmarks" 
  on public.job_portal_bookmarks 
  for delete 
  using (auth.uid() = user_id);

-- Grant appropriate permissions
grant usage on schema public to anon, authenticated, service_role;

-- Job portal listings: public read, service role full access
grant select on table public.job_portal_listings to anon, authenticated;
grant select, insert, update, delete on table public.job_portal_listings to service_role;

-- Job feed stats: public read, service role full access
grant select on table public.job_feed_stats to anon, authenticated;
grant select, insert, update, delete on table public.job_feed_stats to service_role;

-- Bookmarks: authenticated users can read/write their own, service role full access
grant select, insert, delete on table public.job_portal_bookmarks to authenticated;
grant select, insert, update, delete on table public.job_portal_bookmarks to service_role;