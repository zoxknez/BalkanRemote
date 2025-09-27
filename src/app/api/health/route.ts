import { NextResponse } from 'next/server';

import { logger } from '@/lib/logger';

const SUPABASE_HEALTH_PATH = '/auth/v1/health';

export async function GET() {
  const startedAt = Date.now();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    logger.error('Health check failed: Supabase environment variables are missing');
    return NextResponse.json(
      {
        status: 'error',
        supabase: 'missing-config',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }

  let supabaseStatus: 'ok' | 'degraded' | 'error' = 'ok';

  try {
    const healthUrl = new URL(SUPABASE_HEALTH_PATH, supabaseUrl).toString();
    const response = await fetch(healthUrl, {
      headers: {
        apikey: supabaseKey,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      supabaseStatus = 'degraded';
      logger.warn('Supabase health endpoint returned non-ok status', response.status);
    }
  } catch (error) {
    supabaseStatus = 'error';
    logger.error('Health check failed while calling Supabase', error);
  }

  const durationMs = Date.now() - startedAt;

  const statusCode = supabaseStatus === 'ok' ? 200 : supabaseStatus === 'degraded' ? 503 : 500;

  return NextResponse.json(
    {
      status: supabaseStatus === 'ok' ? 'ok' : 'degraded',
      supabase: supabaseStatus,
      region: process.env.VERCEL_REGION ?? 'local',
      durationMs,
      timestamp: new Date().toISOString(),
    },
    { status: statusCode },
  );
}
