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
  // Some hosts block default UA; fetch explicitly with UA and pass to parser
  let resp = await fetch(feedUrl, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; RemoteBalkanBot/1.0; +https://remotebalkan.com)',
      accept: 'application/rss+xml, application/xml;q=0.9, */*;q=0.8'
    }
  });
  // Handle explicit redirects if any servers return manual redirect responses
  if (!resp.ok && [301, 302, 307, 308].includes(resp.status)) {
    const loc = resp.headers.get('location');
    if (loc) {
      const nextUrl = new URL(loc, feedUrl).toString();
      resp = await fetch(nextUrl, {
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; RemoteBalkanBot/1.0; +https://remotebalkan.com)',
          accept: 'application/rss+xml, application/xml;q=0.9, */*;q=0.8'
        }
      });
    }
  }
  if (!resp.ok) {
    // Try to discover RSS via category HTML as a fallback when RSS returns 30x/40x
    const loc = resp.headers.get('location');
    const categoryHtmlUrl = `https://weworkremotely.com/categories/remote-${category}-jobs`;
    try {
      const htmlResp = await fetch(categoryHtmlUrl, {
        headers: {
          'user-agent': 'Mozilla/5.0 (compatible; RemoteBalkanBot/1.0; +https://remotebalkan.com)',
          accept: 'text/html,application/xhtml+xml'
        }
      });
      if (htmlResp.ok) {
        const html = await htmlResp.text();
        const rssHrefMatch = html.match(/<link[^>]+type=["']application\/rss\+xml["'][^>]+href=["']([^"']+)["']/i);
        const nextRss = rssHrefMatch ? new URL(rssHrefMatch[1], categoryHtmlUrl).toString() : null;
        if (nextRss) {
          const rssResp = await fetch(nextRss, {
            headers: {
              'user-agent': 'Mozilla/5.0 (compatible; RemoteBalkanBot/1.0; +https://remotebalkan.com)',
              accept: 'application/rss+xml, application/xml;q=0.9, */*;q=0.8'
            }
          });
          if (rssResp.ok) {
            const text2 = await rssResp.text();
            const feed2 = await parser.parseString(text2);
            if (feed2.items && feed2.items.length > 0) {
              return (feed2.items || []).map((it: RSSItem) => ({
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
          }
        }
      }
    } catch {}
    throw new Error(`WWR RSS ${resp.status}${loc ? ' -> ' + loc : ''}`);
  }
  let text = await resp.text();
  let feed = await parser.parseString(text);
  // If parsing yields no items (some categories occasionally serve empty RSS with 301/200), try discovering RSS via category HTML
  if (!feed.items || feed.items.length === 0) {
    const categoryHtmlUrl = `https://weworkremotely.com/categories/remote-${category}-jobs`;
    const htmlResp = await fetch(categoryHtmlUrl, {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; RemoteBalkanBot/1.0; +https://remotebalkan.com)',
        accept: 'text/html,application/xhtml+xml'
      }
    });
    if (htmlResp.ok) {
      const html = await htmlResp.text();
      const rssHrefMatch = html.match(/<link[^>]+type=["']application\/rss\+xml["'][^>]+href=["']([^"']+)["']/i);
      const nextRss = rssHrefMatch ? new URL(rssHrefMatch[1], categoryHtmlUrl).toString() : null;
      if (nextRss) {
        const rssResp = await fetch(nextRss, {
          headers: {
            'user-agent': 'Mozilla/5.0 (compatible; RemoteBalkanBot/1.0; +https://remotebalkan.com)',
            accept: 'application/rss+xml, application/xml;q=0.9, */*;q=0.8'
          }
        });
        if (rssResp.ok) {
          text = await rssResp.text();
          feed = await parser.parseString(text);
        }
      }
    }
  }
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
