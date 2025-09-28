import Parser from 'rss-parser';
import { NormalizedJob } from '@/types/normalized';
import { stableJobKey } from '@/lib/jobs/stableKey';
import { toISO } from '@/lib/jobs/normalize';

type RSSItem = {
  title?: string;
  link?: string;
  creator?: string;
  'dc:creator'?: string;
  categories?: string[];
  isoDate?: string;
  pubDate?: string;
  [k: string]: unknown;
};

const parser = new Parser();

export async function fetchWWR(category: 'programming' | 'design' | 'marketing' = 'programming'): Promise<NormalizedJob[]> {
  const feedUrl = `https://weworkremotely.com/categories/remote-${category}-jobs.rss`;
  const feed = await parser.parseURL(feedUrl);
  return (feed.items || []).map((it: RSSItem) => ({
    stableKey: stableJobKey(
      it.title || '',
      (it.creator as string) || (it['dc:creator'] as string) || '',
      it.link || '',
      (it.categories || []).join(',')
    ),
    sourceId: 'weworkremotely',
    sourceName: 'We Work Remotely',
    title: it.title || '',
    company: (it.creator as string) || (it['dc:creator'] as string) || '',
    location: null,
    remote: true,
    salaryMin: null,
    salaryMax: null,
    salaryCurrency: null,
    postedAt: toISO(it.isoDate || it.pubDate || Date.now()),
    applyUrl: it.link || '',
    raw: it,
  }));
}
