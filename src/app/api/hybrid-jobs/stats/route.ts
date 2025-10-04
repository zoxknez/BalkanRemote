import { NextRequest, NextResponse } from 'next/server';
import { hybridJobsRepository } from '@/lib/hybrid-jobs-repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters for filtering stats
    const country = searchParams.get('country');
    const workType = searchParams.get('workType');
    const category = searchParams.get('category');

    const filters = {
      ...(country && { country }),
      ...(workType && { workType }),
      ...(category && { category })
    };

    // Get stats and distinct values in parallel
    const [stats, countries, workTypes, categories, sources] = await Promise.all([
      hybridJobsRepository.getStats(filters),
      hybridJobsRepository.getDistinctValues('country_code'),
      hybridJobsRepository.getDistinctValues('work_type'),
      hybridJobsRepository.getDistinctValues('category'),
      hybridJobsRepository.getDistinctValues('source_name')
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats,
        availableFilters: {
          countries,
          workTypes,
          categories,
          sources
        },
        appliedFilters: filters
      }
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}