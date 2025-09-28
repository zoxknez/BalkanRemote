#!/usr/bin/env tsx

// Load environment (same loader used by other scripts)
import './env';

async function main() {
  const t0 = Date.now();
  console.log('[ingest] Starting official feeds ingestion…');
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY');
    }
    const mod = await import('../src/lib/ingest/runOfficial');
    await mod.ingestOfficialFeeds();
    const dt = Date.now() - t0;
    console.log(`[ingest] Done in ${dt}ms`);
  } catch (err) {
    console.error('[ingest] FAILED:', (err as Error)?.message || err);
    process.exitCode = 1;
  }
}

void main();

export {}
