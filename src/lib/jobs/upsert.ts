import { supabase } from '@/lib/telemetry/supabase';
import { NormalizedJob } from '@/types/normalized';

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
  posted_at: string;
  apply_url: string;
  raw: unknown | null;
};

export async function upsertJobs(jobs: NormalizedJob[]) {
  if (!jobs.length) return { inserted: 0 };
  const map = new Map<string, JobsRowInsert>();
  // "ON CONFLICT DO UPDATE command cannot affect row a second time"
  const map = new Map<string, JobsRowInsert>();
  for (const j of jobs) {
    const row: JobsRowInsert = {
      stable_key: j.stableKey,
      source_id: j.sourceId,
      source_name: j.sourceName,
      title: j.title,
      company: j.company,
      location: j.location,
      remote: j.remote,
      salary_min: j.salaryMin ?? null,
      salary_max: j.salaryMax ?? null,
      salary_currency: j.salaryCurrency ?? null,
      salary_min_eur: j.salaryMinEur ?? null,
      salary_max_eur: j.salaryMaxEur ?? null,
      posted_at: j.postedAt,
      apply_url: j.applyUrl,
      raw: j.raw ?? null,
    };
    if (!map.has(row.stable_key)) map.set(row.stable_key, row);
  }
  const payload: JobsRowInsert[] = Array.from(map.values());
  const { data, error } = await supabase
    .from('jobs')
    .upsert(payload, { onConflict: 'stable_key' })
    .select('stable_key');
  if (error) throw error;
  return { inserted: data?.length ?? 0 };
}
