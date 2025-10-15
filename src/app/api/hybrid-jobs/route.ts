import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { redisCache, cacheKeys, CACHE_TTL } from '@/lib/redis-cache';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================================
// SECURITY: Rate Limiting
// ============================================================================
const rateLimitBuckets = new Map<string, { count: number; expires: number }>();
const RATE_LIMIT_MAX = 30; // 30 requests
const RATE_LIMIT_WINDOW_MS = 60_000; // per minute

function isRateLimited(ip: string | null): boolean {
  if (!ip) return false; // Allow if no IP (local dev)
  
  const now = Date.now();
  let bucket = rateLimitBuckets.get(ip);
  
  if (!bucket || bucket.expires < now) {
    bucket = { count: 0, expires: now + RATE_LIMIT_WINDOW_MS };
    rateLimitBuckets.set(ip, bucket);
  }
  
  bucket.count += 1;
  
  // Cleanup old buckets periodically (prevent memory leak)
  if (rateLimitBuckets.size > 1000) {
    for (const [key, value] of rateLimitBuckets.entries()) {
      if (value.expires < now) rateLimitBuckets.delete(key);
    }
  }
  
  return bucket.count > RATE_LIMIT_MAX;
}

// ============================================================================
// SECURITY: Authentication for POST requests
// ============================================================================
function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.HYBRID_JOBS_API_KEY;
  
  // In production, API key MUST be configured
  if (!apiKey) {
    logger.warn('[hybrid-jobs] API key not configured - rejecting POST request');
    return false;
  }
  
  if (!authHeader) return false;
  
  const [scheme, token] = authHeader.split(' ');
  return scheme === 'Bearer' && token === apiKey;
}

// ============================================================================
// SECURITY: Input Sanitization
// ============================================================================
function sanitizeSearchInput(input: string): string {
  return input
    .replace(/[%_\\]/g, '\\$&')    // Escape SQL wildcards
    .replace(/[^\w\s+-]/g, '')     // Remove special chars
    .slice(0, 100)                 // Limit length
    .trim();
}

// ============================================================================
// VALIDATION: Zod Schema for POST
// ============================================================================
const hybridJobInsertSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().max(10000).optional(),
  company_name: z.string().min(2, 'Company name must be at least 2 characters').max(100),
  company_website: z.string().url().optional().or(z.literal('')).nullable(),
  location: z.string().max(100).optional().nullable(),
  country_code: z.string().length(2).optional().nullable(),
  region: z.enum(['BALKAN', 'EU', 'GLOBAL']).default('BALKAN'),
  work_type: z.enum(['hybrid', 'onsite', 'flexible', 'remote-optional']),
  salary_min: z.number().int().min(0).max(1000000).optional().nullable(),
  salary_max: z.number().int().min(0).max(1000000).optional().nullable(),
  salary_currency: z.string().length(3).default('EUR'),
  experience_level: z.enum(['entry', 'mid', 'senior', 'lead', 'executive']).optional().nullable(),
  employment_type: z.enum(['full-time', 'part-time', 'contract', 'freelance', 'internship']).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  skills: z.array(z.string().max(50)).max(20).optional().nullable(),
  technologies: z.array(z.string().max(50)).max(20).optional().nullable(),
  application_url: z.string().url().optional().or(z.literal('')).nullable(),
  application_email: z.string().email().optional().or(z.literal('')).nullable(),
  external_id: z.string().min(1).max(200),
  source_name: z.string().min(1).max(100),
  source_website: z.string().url().optional().or(z.literal('')).nullable(),
  posted_date: z.string().datetime().optional().nullable(),
  expires_at: z.string().datetime().optional().nullable(),
  quality_score: z.number().int().min(0).max(100).default(50),
});

// ============================================================================
// GET: Fetch hybrid jobs with filtering
// ============================================================================
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // SECURITY: Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || null;
      
    if (isRateLimited(ip)) {
      logger.warn('[hybrid-jobs] Rate limit exceeded', { ip });
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Try again in 1 minute.' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
            'X-RateLimit-Remaining': '0',
            'Cache-Control': 'no-store',
          }
        }
      );
    }
    
    const { searchParams } = new URL(request.url);
    
    // Query parameters with validation
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));
    const country = searchParams.get('country')?.toUpperCase().slice(0, 2) || null;
    const workTypes = searchParams.getAll('workType').filter(wt => 
      ['hybrid', 'onsite', 'flexible', 'remote-optional'].includes(wt)
    );
    const category = searchParams.get('category')?.slice(0, 50) || null;
    const searchRaw = searchParams.get('search');
    const orderBy = searchParams.get('order') || 'posted_date';
    const order = searchParams.get('direction') === 'asc' ? 'asc' : 'desc';

    // SECURITY: Sanitize search input
    const search = searchRaw ? sanitizeSearchInput(searchRaw) : null;

    // Create cache key from filters
    const filters = {
      limit,
      offset,
      country,
      workTypes,
      category,
      search,
      orderBy,
      order
    };
    
    const cacheKey = cacheKeys.hybridJobs(filters);
    
    // Try to get from cache first
    const cached = redisCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120',
          'X-Cache': 'HIT'
        }
      });
    }

    // Build query
    let query = supabase
      .from('hybrid_jobs')
      .select('*', { count: 'exact' })
      .gte('quality_score', 50);

    // Apply filters
    if (country) {
      query = query.eq('country_code', country);
    }

    // Work type filter
    if (workTypes.length > 0) {
      query = query.in('work_type', workTypes);
    } else {
      // Default: show only hybrid and onsite (NOT fully remote)
      query = query.in('work_type', ['hybrid', 'onsite', 'flexible']);
    }

    if (category) {
      query = query.eq('category', category);
    }

    // SECURITY: Use sanitized search input
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,description.ilike.%${search}%,company_name.ilike.%${search}%`
      );
    }

    // Apply ordering
    const validOrderColumns = ['posted_date', 'created_at', 'quality_score', 'view_count', 'salary_max'];
    const orderColumn = validOrderColumns.includes(orderBy) ? orderBy : 'posted_date';
    
    query = query.order(orderColumn, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      logger.error('[hybrid-jobs] Database query failed', { error });
      return NextResponse.json(
        { success: false, error: 'Database query failed' },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    // Prepare response
    const response = {
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
    };

    // Cache the response
    redisCache.set(cacheKey, response, CACHE_TTL.MEDIUM);

    const duration = Date.now() - startTime;
    logger.info('[hybrid-jobs] GET success', {
      duration,
      resultsCount: data?.length || 0,
      cached: false,
      filters: { country, workTypes, category, search: !!search }
    });

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120',
        'X-Cache': 'MISS'
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('[hybrid-jobs] GET failed', {
      duration,
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

// ============================================================================
// POST: Create new hybrid job posting
// ============================================================================
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // SECURITY: Authentication check
    if (!isAuthorized(request)) {
      logger.warn('[hybrid-jobs] Unauthorized POST attempt', {
        ip: request.headers.get('x-forwarded-for'),
        hasAuth: !!request.headers.get('authorization')
      });
      
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401, headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const body = await request.json();

    // VALIDATION: Zod schema validation
    const validated = hybridJobInsertSchema.safeParse(body);
    
    if (!validated.success) {
      logger.warn('[hybrid-jobs] Validation failed', {
        errors: validated.error.flatten().fieldErrors
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validated.error.flatten().fieldErrors
        },
        { status: 422 }
      );
    }

    // Insert to database
    const { data, error } = await supabase
      .from('hybrid_jobs')
      .insert([validated.data])
      .select()
      .single();

    if (error) {
      logger.error('[hybrid-jobs] Insert failed', { error });
      return NextResponse.json(
        { success: false, error: 'Failed to create job posting' },
        { status: 500 }
      );
    }

    // CACHE: Invalidate cache after successful insert
    try {
      const cachePattern = 'hybrid:jobs:*';
      if (redisCache.invalidatePattern) {
        redisCache.invalidatePattern(cachePattern);
        logger.info('[hybrid-jobs] Cache invalidated after insert');
      }
    } catch (cacheErr) {
      logger.warn('[hybrid-jobs] Cache invalidation failed', { error: cacheErr });
      // Don't fail the request if cache clear fails
    }

    const duration = Date.now() - startTime;
    logger.info('[hybrid-jobs] POST success', {
      duration,
      jobId: data?.id,
      source: validated.data.source_name
    });

    return NextResponse.json({
      success: true,
      data: data
    }, { status: 201 });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('[hybrid-jobs] POST failed', {
      duration,
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
