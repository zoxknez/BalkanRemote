import { supabase } from '@/lib/telemetry/supabase';
import type { NormalizedJob } from '@/types/normalized';

type JobsRowInsert = {
  stable_key: string;
  source_id: string;
  source_name: string;
  title: string;
  company: string;
  location: string | null;
  remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  salary_min_eur: number | null;
  salary_max_eur: number | null;
  posted_at: string; // ISO
  apply_url: string;
  raw: unknown | null;
};

const CHUNK_SIZE = 500; // siguran limit za upsert batch

function toISO(x: string | Date): string {
  const d = typeof x === 'string' ? new Date(x) : x;
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function chunk<T>(arr: T[], size = CHUNK_SIZE): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function upsertJobs(jobs: NormalizedJob[]) {
  if (!jobs?.length) return { inserted: 0 };

  // Dedup po stable_key (sprečava: "ON CONFLICT DO UPDATE ... affect row a second time")
  // Ako stigne više istih ključeva, zadržavamo onaj sa novijim posted_at.
  const map = new Map<string, JobsRowInsert>();

  for (const j of jobs) {
    if (!j.stableKey || !j.title || !j.applyUrl) continue; // minimalna validacija

    const row: JobsRowInsert = {
      stable_key: j.stableKey,
      source_id: j.sourceId,
      source_name: j.sourceName,
      title: j.title,
      company: j.company,
      location: j.location ? j.location.trim() || null : null,
      remote: !!j.remote,
      salary_min: j.salaryMin ?? null,
      salary_max: j.salaryMax ?? null,
      salary_currency: j.salaryCurrency ? j.salaryCurrency.trim().toUpperCase() : null,
      salary_min_eur: j.salaryMinEur ?? null,
      salary_max_eur: j.salaryMaxEur ?? null,
      posted_at: toISO(j.postedAt),
      apply_url: j.applyUrl,
      raw: j.raw ?? null,
    };

    const prev = map.get(row.stable_key);
    if (!prev) {
      map.set(row.stable_key, row);
    } else {
      // preferiraj "svežiji" zapis
      if (new Date(row.posted_at).getTime() > new Date(prev.posted_at).getTime()) {
        map.set(row.stable_key, row);
      }
    }
  }

  const payload = Array.from(map.values());
  if (!payload.length) return { inserted: 0 };

  let affected = 0;
  for (const part of chunk(payload)) {
    const { data, error } = await supabase
      .from('jobs')
      .upsert(part, { onConflict: 'stable_key' })
      .select('stable_key');

    if (error) throw error;
    affected += data?.length ?? 0;
  }

  // Napomena: "affected" = broj redova koje je Postgres vratio (insert + update), nije striktno samo "insert".
  return { inserted: affected };
}
