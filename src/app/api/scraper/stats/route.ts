import { NextResponse } from 'next/server';
import { jobScraperEngine } from '@/lib/job-scraper-engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const stats = jobScraperEngine.getStats();

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching scraper stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scraper statistics' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Trigger manual scraping of all sources
    await jobScraperEngine.scrapeAllSources();

    return NextResponse.json({
      success: true,
      message: 'Scraping started successfully'
    });

  } catch (error) {
    console.error('Error starting manual scrape:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to start scraping' },
      { status: 500 }
    );
  }
}
