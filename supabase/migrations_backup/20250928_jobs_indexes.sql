-- Indexes for jobs quick filtering
create index if not exists jobs_posted_at_desc_idx on jobs (posted_at desc);
-- Requires pg_trgm extension in the database
create extension if not exists pg_trgm;
create index if not exists jobs_title_company_trgm_idx on jobs using gin ((title || ' ' || company) gin_trgm_ops);
