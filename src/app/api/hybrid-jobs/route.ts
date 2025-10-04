import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const country = searchParams.get('country');
    const workType = searchParams.get('workType');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const orderBy = searchParams.get('order') || 'posted_date';
    const order = searchParams.get('direction') || 'desc';

    // TEMP: Using direct table instead of view until view is fixed in Supabase
    let query = supabase
      .from('hybrid_jobs')
      .select('*', { count: 'exact' })
      .gte('quality_score', 50); // Apply view filter manually

    // Apply filters
    if (country) {
      query = query.eq('country_code', country.toUpperCase());
    }

    if (workType) {
      query = query.eq('work_type', workType);
    } else {
      // Default: show only hybrid and onsite (NOT fully remote)
      query = query.in('work_type', ['hybrid', 'onsite', 'flexible']);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,company_name.ilike.%${search}%`);
    }

    // Apply ordering
    const validOrderColumns = ['posted_date', 'created_at', 'quality_score', 'view_count', 'salary_max'];
    const orderColumn = validOrderColumns.includes(orderBy) ? orderBy : 'posted_date';
    
    query = query.order(orderColumn, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, error: 'Database query failed' },
        { status: 500 }
      );
    }

    // Return response matching useHybridJobs hook expectations
    return NextResponse.json({
      success: true,
      data: {
        jobs: data || [],
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
        facets: {
          workType: {},
          contractType: {},
          experienceLevel: {},
          category: {},
          country: {}
        },
        summary: {
          newToday: 0,
          totalHybrid: count || 0
        }
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['title', 'company_name', 'work_type', 'source_name'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate work_type
    const validWorkTypes = ['hybrid', 'onsite', 'flexible', 'remote-optional'];
    if (!validWorkTypes.includes(body.work_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid work_type' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('hybrid_jobs')
      .insert([{
        title: body.title,
        description: body.description,
        company_name: body.company_name,
        company_website: body.company_website,
        location: body.location,
        country_code: body.country_code,
        region: body.region || 'BALKAN',
        work_type: body.work_type,
        salary_min: body.salary_min,
        salary_max: body.salary_max,
        salary_currency: body.salary_currency || 'EUR',
        experience_level: body.experience_level,
        employment_type: body.employment_type,
        category: body.category,
        skills: body.skills,
        technologies: body.technologies,
        application_url: body.application_url,
        application_email: body.application_email,
        external_id: body.external_id,
        source_name: body.source_name,
        source_website: body.source_website,
        posted_date: body.posted_date,
        expires_at: body.expires_at,
        quality_score: body.quality_score || 50
      }])
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create job posting' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}