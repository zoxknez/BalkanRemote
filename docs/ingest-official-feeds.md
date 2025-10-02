# Official feeds ingestion (Remotive, RemoteOK, WWR)

Server-only ingestion that writes normalized jobs and telemetry to Supabase.

Env required (server):
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY (server only)
- Either SUPABASE_DB_URL or PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE for SQL scripts

Apply SQL (creates jobs and scrape_runs tables):
- Copy supabase/migrations/20250928_scrape_core.sql into your DB (see scripts/run-sql.ts if you prefer automated run)

Trigger ingestion (POST):
- /api/ingest/official

Notes:
- The API route sets runtime = 'nodejs' to allow rss-parser and crypto usage.
- Stable dedupe key prevents duplicates across runs (title+company+host+location hash).
- Minimal salary parsing is included; extend later as needed.

