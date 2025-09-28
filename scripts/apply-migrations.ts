#!/usr/bin/env tsx
// Load env vars
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('./env.cjs')
import fs from 'node:fs'
import path from 'node:path'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { Client } = require('pg') as { Client: new (config: unknown) => any }

async function getPgConfig() {
  const dbUrl = process.env.SUPABASE_DB_URL
  if (dbUrl) return { connectionString: dbUrl, ssl: { rejectUnauthorized: false } }
  const cfg = {
    host: process.env.PGHOSTADDR || process.env.PGHOST,
    port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE || 'postgres',
    ssl: { rejectUnauthorized: false, servername: process.env.PGHOST },
  }
  if (!cfg.host || !cfg.user || !cfg.password) {
    throw new Error('DB config missing. Set SUPABASE_DB_URL or PGHOST/PGUSER/PGPASSWORD/PGDATABASE')
  }
  return cfg
}

async function main() {
  const migrationsDir = path.resolve(process.cwd(), 'supabase', 'migrations')
  if (!fs.existsSync(migrationsDir)) {
    console.error(`Migrations dir not found: ${migrationsDir}`)
    process.exitCode = 1
    return
  }
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
  if (!files.length) {
    console.log('No migration files found.')
    return
  }
  const client = new Client(await getPgConfig())
  await client.connect()
  try {
    for (const f of files) {
      const p = path.join(migrationsDir, f)
      const sql = fs.readFileSync(p, 'utf8')
      console.log(`Applying migration ${f} ...`)
      await client.query(sql)
    }
    console.log('All migrations applied.')
    // Notify PostgREST
    try {
      await client.query("notify pgrst, 'reload schema'")
      console.log('PostgREST notified to reload schema.')
    } catch {}
  } catch (err) {
    console.error('Migration failed:', (err as Error).message)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main().catch((err) => {
  console.error('apply-migrations error:', (err as Error).message)
  process.exitCode = 1
})
