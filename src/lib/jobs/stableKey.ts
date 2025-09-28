import { createHash } from 'node:crypto';

const norm = (s = '') =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

export function stableJobKey(title: string, company: string, url: string, location?: string) {
  const host = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  })();
  const payload = [norm(title), norm(company), host, norm(location || '')].join('|');
  return createHash('sha256').update(payload).digest('hex').slice(0, 16);
}
