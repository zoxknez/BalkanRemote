import { NextRequest, NextResponse } from 'next/server';
import { jobScraperEngine } from '@/lib/job-scraper-engine';
import { JobCategory } from '@/types/jobs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters = {
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      keywords: searchParams.get('keywords') || undefined,
      category: searchParams.get('category') as JobCategory || undefined,
      remote: searchParams.get('remote') === 'true' ? true : 
              searchParams.get('remote') === 'false' ? false : undefined,
      location: searchParams.get('location') || undefined,
      minSalary: searchParams.get('minSalary') ? parseInt(searchParams.get('minSalary')!) : undefined,
      maxSalary: searchParams.get('maxSalary') ? parseInt(searchParams.get('maxSalary')!) : undefined,
      seniority: searchParams.getAll('seniority').length > 0 ? searchParams.getAll('seniority') : undefined,
      contractType: searchParams.getAll('contractType').length > 0 ? searchParams.getAll('contractType') : undefined,
      sourceSite: searchParams.getAll('sourceSite').length > 0 ? searchParams.getAll('sourceSite') : undefined,
    };

    // Get filtered jobs
    const result = jobScraperEngine.getJobs(filters);

    return NextResponse.json({
      success: true,
      data: {
        jobs: result.jobs,
        total: result.total,
        page: Math.floor(filters.offset / filters.limit) + 1,
        limit: filters.limit,
        totalPages: Math.ceil(result.total / filters.limit)
      }
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
