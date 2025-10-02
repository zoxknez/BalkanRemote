import { NextRequest, NextResponse } from 'next/server'
import { jobScraperEngine } from '@/lib/job-scraper-engine'
import { ensureScrapedTable } from '@/lib/ensure-scraped-table'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Updated: Oct 2, 2025 - Fixed Vercel deployment with proper env vars
// Force redeploy: middleware fix applied

export async function GET(req: NextRequest) {
  try {
    const expected = (process.env.SCRAPER_WEBHOOK_SECRET || '').trim()
    const isCron = req.headers.get('x-vercel-cron') === '1'
    if (expected && !isCron) {
      const provided = (req.headers.get('x-webhook-secret') || new URL(req.url).searchParams.get('secret') || '').trim()
      if (!provided || provided !== expected) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }
    }
    await ensureScrapedTable().catch(() => {})
    await jobScraperEngine.scrapeAllSources()
    return NextResponse.json({ success: true, message: 'Scrape started for all active sources' })
  } catch (error) {
    logger.error('Failed to start scrape (GET /api/scrape-all)', error)
    return NextResponse.json({ success: false, error: 'Failed to start scrape' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const expected = (process.env.SCRAPER_WEBHOOK_SECRET || '').trim()
    const isCron = req.headers.get('x-vercel-cron') === '1'
    if (expected && !isCron) {
      const provided = (req.headers.get('x-webhook-secret') || new URL(req.url).searchParams.get('secret') || '').trim()
      if (!provided || provided !== expected) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
      }
    }
    await ensureScrapedTable().catch(() => {})
    await jobScraperEngine.scrapeAllSources()
    return NextResponse.json({ success: true, message: 'Scrape started for all active sources' })
  } catch (error) {
    logger.error('Failed to start scrape (POST /api/scrape-all)', error)
    return NextResponse.json({ success: false, error: 'Failed to start scrape' }, { status: 500 })
  }
}
