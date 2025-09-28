import { NormalizedJob } from '@/types/normalized';
import { stableJobKey } from '@/lib/jobs/stableKey';
import { toISO, parseSalaryLoose } from '@/lib/jobs/normalize';

type RemoteOkJob = {
  id: number | string;
  position: string;
  company: string;
  tags?: string[];
  salary?: string | null;
  apply_url?: string | null;
  url?: string | null;
  location?: string | null;
  date?: string | number | Date;
  [k: string]: unknown;
};

export async function fetchRemoteOK(query = 'developer'): Promise<NormalizedJob[]> {
  const res = await fetch('https://remoteok.com/api', { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`RemoteOK ${res.status}`);
  const arr = (await res.json()) as unknown;
  const jobs = (Array.isArray(arr) ? (arr as RemoteOkJob[]) : []).filter((x: RemoteOkJob) => x && x.id && x.position);
  const needle = query.toLowerCase();
  return jobs
    .filter((j: RemoteOkJob) => [j.position, j.company, ...(j.tags || [])].join(' ').toLowerCase().includes(needle))
    .map((j: RemoteOkJob) => {
      const sal = parseSalaryLoose(j.salary);
      const apply = j.apply_url || j.url || '';
      return {
        stableKey: stableJobKey(j.position, j.company, apply, j.location ?? undefined),
        sourceId: 'remoteok',
        sourceName: 'Remote OK',
        title: j.position,
        company: j.company,
        location: j.location || null,
        remote: true,
        salaryMin: sal.min,
        salaryMax: sal.max,
        salaryCurrency: sal.cur,
  postedAt: toISO(j.date ?? Date.now()),
        applyUrl: apply,
        raw: j,
      } as NormalizedJob;
    });
}
