import { NextRequest, NextResponse } from 'next/server'
import { jobScraperEngine } from '@/lib/job-scraper-engine'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(req: NextRequest) {
  try {
    // In production, restrict GET to Vercel Cron
    const isVercel = !!process.env.VERCEL
    const hasCronHeader = !!req.headers.get('x-vercel-cron')
    if (isVercel && !hasCronHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const url = new URL(req.url)
    const sourceId = url.searchParams.get('sourceId') || undefined
    if (sourceId) {
      const job = await jobScraperEngine.manualScrapeSource(sourceId)
      if (!job) return NextResponse.json({ success: false, error: 'Source not found' }, { status: 404 })
      return NextResponse.json({ success: true, data: job })
    }
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
      const job = await jobScraperEngine.manualScrapeSource(sourceId)
      if (!job) return NextResponse.json({ success: false, error: 'Source not found' }, { status: 404 })
      return NextResponse.json({ success: true, data: job })
    }

    await jobScraperEngine.scrapeAllSources()
    return NextResponse.json({ success: true, message: 'Scrape started for all active sources' })
  } catch (error) {
    logger.error('Failed to start scrape', error)
    return NextResponse.json({ success: false, error: 'Failed to start scrape' }, { status: 500 })
  }
}
