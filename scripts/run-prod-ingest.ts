#!/usr/bin/env tsx
import './env';

async function main() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
  }
  console.log('[prod-ingest] Triggering official feeds ingestion against production Supabase…');
  const mod = await import('../src/lib/ingest/runOfficial');
  await mod.ingestOfficialFeeds();
  console.log('[prod-ingest] Done');
}

main().catch((err) => {
  console.error('[prod-ingest] FAILED:', (err as Error)?.message || err);
  process.exit(1);
});
