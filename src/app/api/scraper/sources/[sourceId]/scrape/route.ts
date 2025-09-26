import { NextRequest, NextResponse } from 'next/server';
import { jobScraperEngine } from '@/lib/job-scraper-engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest, context: { params: Promise<{ sourceId: string }> }) {
  try {
    const { sourceId } = await context.params;

    const scrapeJob = await jobScraperEngine.manualScrapeSource(sourceId);

    if (!scrapeJob) {
      return NextResponse.json(
        { success: false, error: 'Source not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: scrapeJob,
      message: `Scraping ${sourceId} started successfully`
    });
  } catch (error) {
    const params = await context.params;
    console.error(`Error scraping source ${params.sourceId}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to start source scraping' },
      { status: 500 }
    );
  }
}
