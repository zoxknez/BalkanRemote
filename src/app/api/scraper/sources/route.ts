import { NextResponse } from 'next/server';
import { jobScraperEngine } from '@/lib/job-scraper-engine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const sources = jobScraperEngine.getSources();

    return NextResponse.json({
      success: true,
      data: sources
    });

  } catch (error) {
    console.error('Error fetching scraper sources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scraper sources' },
      { status: 500 }
    );
  }
}
