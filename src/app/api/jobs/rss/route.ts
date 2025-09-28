import type { NextRequest } from 'next/server'
import { jobScraperEngine } from '@/lib/job-scraper-engine'

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
  const { jobs } = jobScraperEngine.getJobs({ limit, offset: 0 })
  const site = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://remotebalkan.com')

  const items = jobs
    .sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime())
    .slice(0, 50)
    .map(j => `
      <item>
        <title>${escapeXml(`${j.title} — ${j.company}`)}</title>
        <link>${escapeXml(j.applicationUrl)}</link>
        <guid isPermaLink="false">${escapeXml(j.fingerprint)}</guid>
        <pubDate>${new Date(j.postedDate).toUTCString()}</pubDate>
        <description><![CDATA[${(j.description || '').slice(0, 500)}]]></description>
        <category>${escapeXml(j.category)}</category>
      </item>
    `)
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Remote Balkan — Poslovi</title>
    <link>${site}/poslovi</link>
    <description>Najnoviji remote poslovi agregirani sa različitih izvora</description>
    <language>sr-RS</language>
    ${items}
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
