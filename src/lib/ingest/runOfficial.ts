import { startRun, finishRun } from '@/lib/telemetry/run';
import { upsertJobs } from '@/lib/jobs/upsert';
import { fetchRemotive } from '@/lib/sources/remotive';
import { fetchRemoteOK } from '@/lib/sources/remoteok';
import { fetchWWR } from '@/lib/sources/wwr';
import type { NormalizedJob } from '@/types/normalized';

export async function ingestOfficialFeeds() {
  const sources: [string, () => Promise<NormalizedJob[]>][] = [
    ['remotive', () => fetchRemotive('developer')],
    ['remoteok', () => fetchRemoteOK('developer')],
    ['weworkremotely:programming', () => fetchWWR('programming')],
  ];

  for (const [sourceId, fn] of sources) {
    const run = await startRun(sourceId);
    const t0 = Date.now();
    let status: 'ok' | 'error' = 'ok';
    let inserted = 0;
    try {
      const jobs = await fn();
      const res = await upsertJobs(jobs);
      inserted = res.inserted;
    } catch (e: unknown) {
      status = 'error';
      const msg = typeof e === 'object' && e && 'message' in e ? String((e as Error).message) : String(e);
      await finishRun(run.id, { status, errors: 1, notes: msg });
      continue;
    }
    await finishRun(run.id, {
      status,
      attempts: 1,
      successes: status === 'ok' ? 1 : 0,
      items_inserted: inserted,
      mean_latency_ms: Date.now() - t0,
    });
  }
}
