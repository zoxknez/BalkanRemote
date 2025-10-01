import type { NextRequest } from 'next/server'
import { jobScraperEngine } from '@/lib/job-scraper-engine'
import { fetchScrapedJobs } from '@/lib/scraped-jobs-repository'

export const runtime = 'nodejs'
export const revalidate = 0

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')))
  const site = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://remotebalkan.com')
  const hasSupabase = Boolean((process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) && process.env.SUPABASE_SERVICE_ROLE_KEY)

  let items: Array<{ id: string; title: string; url: string; date_published: string; content_text?: string; tags?: string[]; company?: string; location?: string; category?: string }> = []
  let total = 0

  if (hasSupabase) {
    try {
      const { rows, total: t } = await fetchScrapedJobs({ limit, offset: 0 })
      items = rows.map(r => ({
        id: r.id,
        title: `${r.title} — ${r.company}`,
        url: r.url,
        date_published: r.posted_at,
        company: r.company,
        location: r.location ?? undefined,
        content_text: r.description ?? undefined,
        tags: r.tags ?? undefined,
        category: r.category ?? undefined,
      }))
      total = t
    } catch (err) {
      console.warn('DB fallback: using in-memory engine for /api/scraper/feed.json', err)
      // fallback to engine below
    }
  }

  if (!items.length) {
    const { jobs, total: t } = jobScraperEngine.getJobs({ limit, offset: 0 })
    items = jobs.map(j => ({
      id: j.fingerprint,
      title: `${j.title} — ${j.company}`,
      url: j.applicationUrl,
      date_published: new Date(j.postedDate).toISOString(),
      content_text: j.description,
      tags: j.tags,
      company: j.company,
      location: j.location,
      category: j.category,
    }))
    total = t
  }

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Remote Balkan — Scraped poslovi',
    home_page_url: `${site}/poslovi/scraped`,
    feed_url: `${site}/api/scraper/feed.json`,
    description: 'Najnoviji scraped oglasi',
    language: 'sr-RS',
    items,
    total,
  }

  return new Response(JSON.stringify(feed), {
    status: 200,
    headers: {
      'Content-Type': 'application/feed+json; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=1800',
    },
  })
}
