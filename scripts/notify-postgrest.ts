#!/usr/bin/env tsx
import './env'
type PgClient = {
  connect: () => Promise<void>
  query: (sql: string) => Promise<unknown>
  end: () => Promise<void>
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Client } = require('pg') as { Client: new (config: unknown) => PgClient }

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL
  const pgConfig = dbUrl
    ? { connectionString: dbUrl, ssl: { rejectUnauthorized: false } }
    : {
        host: process.env.PGHOSTADDR || process.env.PGHOST,
        port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE || 'postgres',
        ssl: { rejectUnauthorized: false, servername: process.env.PGHOST },
      }
  if (!dbUrl) {
    if (!pgConfig.host || !pgConfig.user || !pgConfig.password) {
      console.error('Database connection is not configured. Set SUPABASE_DB_URL or PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE')
      process.exitCode = 1
      return
    }
  }
  const client = new Client(pgConfig)
  await client.connect()
  try {
    await client.query("notify pgrst, 'reload schema'")
    console.log('PostgREST reload schema notified.')
  } catch (err) {
    console.error('NOTIFY failed:', (err as Error).message)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

main()

export {}
