#!/usr/bin/env tsx
// Load env vars
import './env'
import fs from 'node:fs'
import path from 'node:path'
// Minimal client typing to avoid bringing in @types/pg for scripts
type PgClient = { connect: () => Promise<void>; query: (sql: string) => Promise<unknown>; end: () => Promise<void> }
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Client } = require('pg') as { Client: new (config: unknown) => PgClient }

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL
  const pgConfig = dbUrl
    ? { connectionString: dbUrl, ssl: { rejectUnauthorized: false } }
    : {
        // Prefer PGHOSTADDR (e.g., IPv6) to bypass DNS if needed
        host: process.env.PGHOSTADDR || process.env.PGHOST,
        port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE || 'postgres',
        ssl: { rejectUnauthorized: false, servername: process.env.PGHOST },
      }
  // rudimentary presence check
  if (!dbUrl) {
    if (!pgConfig.host || !pgConfig.user || !pgConfig.password) {
      console.error('Database connection is not configured. Set SUPABASE_DB_URL or PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE in .env.local')
      process.exitCode = 1
      return
    }
  }

  const sqlPath = path.resolve(process.cwd(), 'scripts', 'supabase-setup.sql')
  if (!fs.existsSync(sqlPath)) {
    console.error(`SQL file not found at ${sqlPath}`)
    process.exitCode = 1
    return
  }
  const sql = fs.readFileSync(sqlPath, 'utf8')

  const client = new Client(pgConfig)
  await client.connect()
  try {
    console.log('Applying SQL from scripts/supabase-setup.sql ...')
    const disableTxn = process.env.DB_DISABLE_EXPLICIT_TXN === '1' || process.env.DB_DISABLE_EXPLICIT_TXN === 'true'
    if (!disableTxn) {
      await client.query('begin')
    }
    await client.query(sql)
    if (!disableTxn) {
      await client.query('commit')
    }
    console.log('SQL applied successfully.')

    // Proactively notify PostgREST to reload schema cache
    console.log("Sending NOTIFY pgrst, 'reload schema' ...")
    await client.query("notify pgrst, 'reload schema'")
    console.log('NOTIFY sent.')
  } catch (err) {
    const disableTxn = process.env.DB_DISABLE_EXPLICIT_TXN === '1' || process.env.DB_DISABLE_EXPLICIT_TXN === 'true'
    if (!disableTxn) {
      try { await client.query('rollback') } catch {}
    }
    console.error('Failed to apply SQL:', (err as Error).message)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main()
