import { NormalizedJob } from '@/types/normalized';
import { stableJobKey } from '@/lib/jobs/stableKey';
import { toISO, parseSalaryLoose } from '@/lib/jobs/normalize';

type RemotiveJob = {
  title: string;
  company_name: string;
  url: string;
  candidate_required_location?: string | null;
  salary?: string | null;
  publication_date: string | number | Date;
  [k: string]: unknown;
};

type RemotiveResponse = {
  jobs: RemotiveJob[];
  [k: string]: unknown;
};

export async function fetchRemotive(query = 'developer'): Promise<NormalizedJob[]> {
  const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=200`;
  const res = await fetch(url, {
    headers: {
      accept: 'application/json',
      'user-agent': 'Mozilla/5.0 (compatible; RemoteBalkanBot/1.0; +https://remotebalkan.com)'
    }
  });
  if (!res.ok) throw new Error(`Remotive ${res.status}`);
  const json = (await res.json()) as RemotiveResponse;
  return (json.jobs || []).map((j: RemotiveJob) => {
    const sal = parseSalaryLoose(j.salary);
    return {
      stableKey: stableJobKey(j.title, j.company_name, j.url, j.candidate_required_location ?? undefined),
      sourceId: 'remotive',
      sourceName: 'Remotive',
      title: j.title,
      company: j.company_name,
      location: j.candidate_required_location || null,
      remote: true,
      salaryMin: sal.min,
      salaryMax: sal.max,
      salaryCurrency: sal.cur,
      postedAt: toISO(j.publication_date),
      applyUrl: j.url,
      raw: j,
    } as NormalizedJob;
  });
}
