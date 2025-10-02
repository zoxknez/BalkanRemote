import type { NextRequest } from 'next/server'
import { jobScraperEngine } from '@/lib/job-scraper-engine'

export const runtime = 'nodejs'
export const revalidate = 0

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')))
  const { jobs, total } = jobScraperEngine.getJobs({ limit, offset: 0 })
  const site = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://remotebalkan.com')

  const items = jobs
    .sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime())
    .slice(0, 50)
    .map(j => ({
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

  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Balkan Remote — Poslovi',
    home_page_url: `${site}/poslovi`,
    feed_url: `${site}/api/jobs/feed.json`,
    description: 'Najnoviji remote poslovi agregirani sa različitih izvora',
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
