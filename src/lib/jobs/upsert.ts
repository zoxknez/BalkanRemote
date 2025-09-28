import { supabase } from '@/lib/telemetry/supabase';
import { NormalizedJob } from '@/types/normalized';

export async function upsertJobs(jobs: NormalizedJob[]) {
  if (!jobs.length) return { inserted: 0 };
  const payload = jobs.map((j) => ({
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
  }));
  const { data, error } = await supabase
    .from('jobs')
    .upsert(payload, { onConflict: 'stable_key' })
    .select('stable_key');
  if (error) throw error;
  return { inserted: data?.length ?? 0 };
}
