import { NextRequest, NextResponse } from 'next/server'
import { jobScraperEngine } from '@/lib/job-scraper-engine'
import { logger } from '@/lib/logger'
import { ensureScrapedTable } from '@/lib/ensure-scraped-table'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    // In production, allow either Vercel Cron header OR a valid shared secret
    const isVercel = !!process.env.VERCEL
    const hasCronHeader = !!req.headers.get('x-vercel-cron')
    const expected = (process.env.SCRAPER_WEBHOOK_SECRET || '').trim()
    const provided = (req.headers.get('x-webhook-secret') || new URL(req.url).searchParams.get('secret') || '').trim()
    const hasValidSecret = expected && provided && expected === provided
    if (isVercel && !hasCronHeader && !hasValidSecret) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const url = new URL(req.url)
    const sourceId = url.searchParams.get('sourceId') || undefined
    if (sourceId) {
      await ensureScrapedTable().catch(() => {})
      const job = await jobScraperEngine.manualScrapeSource(sourceId)
      if (!job) return NextResponse.json({ success: false, error: 'Source not found' }, { status: 404 })
      return NextResponse.json({ success: true, data: job })
    }
    await ensureScrapedTable().catch(() => {})
    await jobScraperEngine.scrapeAllSources()
    return NextResponse.json({ success: true, message: 'Scrape started for all active sources' })
  } catch (error) {
    logger.error('Failed to start scrape (GET)', error)
    return NextResponse.json({ success: false, error: 'Failed to start scrape' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    // Optional protection: require a shared secret when configured
    const expected = (process.env.SCRAPER_WEBHOOK_SECRET || '').trim()
    if (expected) {
      const provided = (req.headers.get('x-webhook-secret') || new URL(req.url).searchParams.get('secret') || '').trim()
      if (!provided || provided !== expected) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }
    }

    const url = new URL(req.url)
    const sourceId = url.searchParams.get('sourceId') || undefined

    if (sourceId) {
      await ensureScrapedTable().catch(() => {})
      const job = await jobScraperEngine.manualScrapeSource(sourceId)
      if (!job) return NextResponse.json({ success: false, error: 'Source not found' }, { status: 404 })
      return NextResponse.json({ success: true, data: job })
    }

    await ensureScrapedTable().catch(() => {})
    await jobScraperEngine.scrapeAllSources()
    return NextResponse.json({ success: true, message: 'Scrape started for all active sources' })
  } catch (error) {
    logger.error('Failed to start scrape', error)
    return NextResponse.json({ success: false, error: 'Failed to start scrape' }, { status: 500 })
  }
}
