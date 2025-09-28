import { startRun, finishRun } from '@/lib/telemetry/run';
import { upsertJobs } from '@/lib/jobs/upsert';
import { fetchRemotive } from '@/lib/sources/remotive';
import { fetchRemoteOK } from '@/lib/sources/remoteok';
import { fetchWWR } from '@/lib/sources/wwr';
import type { NormalizedJob } from '@/types/normalized';
import { getRatesToEUR, toEUR } from '@/lib/fx/batchRates';

type Task = { id: string; run: () => Promise<NormalizedJob[]> };

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : String(e));

const remotiveQueries = ['developer', 'engineer', 'designer', 'marketing'] as const;
const remoteOkQueries = ['developer', 'engineer', 'devops', 'frontend', 'backend'] as const;
const wwrCategories = ['programming', 'design', 'marketing'] as const;

function buildTasks(): Task[] {
  const tasks: Task[] = [];
  for (const q of remotiveQueries) {
    tasks.push({ id: `remotive:${q}`, run: () => fetchRemotive(q) });
  }
  for (const q of remoteOkQueries) {
    tasks.push({ id: `remoteok:${q}`, run: () => fetchRemoteOK(q) });
  }
  for (const c of wwrCategories) {
    tasks.push({ id: `weworkremotely:${c}`, run: () => fetchWWR(c as 'programming' | 'design' | 'marketing') });
  }
  return tasks;
}

export async function ingestOfficialFeeds() {
  // simple concurrency limiter
  function pLimit(concurrency: number) {
    const q: Array<() => void> = [];
    let active = 0;
    const next = () => {
      active--;
      q.shift()?.();
    };
    return <T>(fn: () => Promise<T>) =>
      new Promise<T>((resolve, reject) => {
        const run = () => {
          active++;
          fn()
            .then((x) => {
              resolve(x);
              next();
            })
            .catch((e) => {
              reject(e);
              next();
            });
        };
        active < concurrency ? run() : q.push(run);
      });
  }

  async function withRetry<T>(op: () => Promise<T>, tries = 3) {
    let err: unknown;
    for (let i = 0; i < tries; i++) {
      try {
        return await op();
      } catch (e) {
        err = e;
        // exponential backoff: 0.5s, 1s, 2s
        await new Promise((r) => setTimeout(r, 500 * 2 ** i));
      }
    }
    throw err;
  }

  const limit = pLimit(3);
  const tasks = buildTasks();
  const jobsPromises = tasks.map((t) =>
    limit(() =>
      withRetry(async () => {
        const run = await startRun(t.id);
        const t0 = Date.now();
        try {
          const jobs = await t.run();
          const currencies = Array.from(
            new Set(jobs.map((j) => (j.salaryCurrency || '').toUpperCase()).filter(Boolean))
          );
          const rates = await getRatesToEUR(currencies);
          const norm: NormalizedJob[] = jobs.map((j) => ({
            ...j,
            salaryMinEur: toEUR(j.salaryMin ?? null, j.salaryCurrency ?? null, rates),
            salaryMaxEur: toEUR(j.salaryMax ?? null, j.salaryCurrency ?? null, rates),
          }));
          const res = await upsertJobs(norm);
          await finishRun(run.id, {
            status: 'ok',
            attempts: 1,
            successes: 1,
            items_inserted: res.inserted,
            mean_latency_ms: Date.now() - t0,
            meta: { expanded: true },
          });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          await finishRun(run.id, { status: 'error', errors: 1, notes: msg });
        }
      })
    )
  );

  const results = await Promise.allSettled(jobsPromises);
  results.forEach((r) => {
    if (r.status === 'rejected') {
      // Optionally log or track telemetry here
      // console.warn('Task rejected in ingestOfficialFeeds', r.reason);
    }
  });
}
