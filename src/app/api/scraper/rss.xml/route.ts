import type { NextRequest } from 'next/server'
import { jobScraperEngine } from '@/lib/job-scraper-engine'
import { fetchScrapedJobs } from '@/lib/scraped-jobs-repository'

export const runtime = 'nodejs'
export const revalidate = 0

function escapeXml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')))
  const site = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://remotebalkan.com')
  const hasSupabase = Boolean((process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) && process.env.SUPABASE_SERVICE_ROLE_KEY)

  let items: Array<{ id: string; title: string; url: string; date: string; description?: string; company?: string; location?: string; category?: string }> = []

  if (hasSupabase) {
    try {
      const { rows } = await fetchScrapedJobs({ limit, offset: 0 })
      items = rows.map(r => ({
        id: r.id,
        title: `${r.title} — ${r.company}`,
        url: r.url,
        date: new Date(r.posted_at).toUTCString(),
        description: r.description ?? undefined,
        company: r.company,
        location: r.location ?? undefined,
        category: r.category ?? undefined,
      }))
    } catch (err) {
      console.warn('DB fallback: using in-memory engine for /api/scraper/rss.xml', err)
      // fallback to engine below
    }
  }

  if (!items.length) {
    const { jobs } = jobScraperEngine.getJobs({ limit, offset: 0 })
    items = jobs.map(j => ({
      id: j.fingerprint,
      title: `${j.title} — ${j.company}`,
      url: j.applicationUrl,
      date: new Date(j.postedDate).toUTCString(),
      description: j.description,
      company: j.company,
      location: j.location,
      category: j.category,
    }))
  }

  const rssItems = items.map(i => `
    <item>
      <guid>${escapeXml(i.id)}</guid>
      <title>${escapeXml(i.title)}</title>
      <link>${escapeXml(i.url)}</link>
      <pubDate>${escapeXml(i.date)}</pubDate>
      ${i.description ? `<description>${escapeXml(i.description)}</description>` : ''}
      ${i.category ? `<category>${escapeXml(i.category)}</category>` : ''}
    </item>
  `).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <title>Balkan Remote — Scraped poslovi</title>
      <link>${escapeXml(`${site}/poslovi/scraped`)}</link>
      <description>Najnoviji scraped oglasi</description>
      <language>sr-RS</language>
      ${rssItems}
    </channel>
  </rss>`

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=1800',
    },
  })
}
