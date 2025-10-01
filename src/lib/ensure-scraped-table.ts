import { logger } from '@/lib/logger'

// Minimal PG client typing to avoid bringing in @types/pg in prod bundle
type PgClient = {
  connect: () => Promise<void>
  query: (sql: string) => Promise<unknown>
  end: () => Promise<void>
}

// Use require at runtime to avoid ESM bundling issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Client } = require('pg') as { Client: new (config: unknown) => PgClient }

// Embedded SQL for creating the job_scraped_listings table and indexes
const SQL_CREATE_TABLE = `
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
`;

function getPgConfig(): unknown | null {
  const dbUrl = process.env.SUPABASE_DB_URL
  if (dbUrl) return { connectionString: dbUrl, ssl: { rejectUnauthorized: false } }
  // Fallback to discrete PG vars if provided
  const host = process.env.PGHOSTADDR || process.env.PGHOST
  const user = process.env.PGUSER
  const password = process.env.PGPASSWORD
  if (!host || !user || !password) return null
  return {
    host,
    port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    user,
    password,
    database: process.env.PGDATABASE || 'postgres',
    ssl: { rejectUnauthorized: false, servername: process.env.PGHOST },
  }
}

export async function ensureScrapedTable(): Promise<boolean> {
  try {
    const cfg = getPgConfig()
    if (!cfg) {
      // No DB connection info available; skip
      return false
    }
    const client: PgClient = new Client(cfg)
    await client.connect()
    try {
      await client.query(SQL_CREATE_TABLE)
      logger.info('✅ Ensured job_scraped_listings table exists')
      return true
    } finally {
      await client.end()
    }
  } catch (err) {
    logger.warn('⚠️ ensureScrapedTable failed:', err)
    return false
  }
}
