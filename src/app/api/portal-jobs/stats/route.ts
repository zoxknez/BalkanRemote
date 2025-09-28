import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseClient'
import { logger } from '@/lib/logger'

function isAuthorized(request: Request): boolean {
  const token = process.env.FEED_STATS_TOKEN
  if (!token) return true // public if no token configured
  const header = request.headers.get('authorization') || ''
  const [scheme, value] = header.split(' ')
  return scheme === 'Bearer' && value === token
}

export const runtime = 'nodejs'
export const revalidate = 60 // cache hint

export async function GET(request: Request) {
  // Graceful fallback for build environments without Supabase credentials
  const hasSupabaseCreds = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  if (!hasSupabaseCreds) {
    const res = NextResponse.json({ success: true, data: [] })
    // Short cache to avoid bursts while staying fresh
    res.headers.set('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=60')
    res.headers.set('X-Notice', 'Supabase credentials missing; returning empty stats')
    return res
  }
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = createSupabaseServer()
    const { data, error } = await supabase
      .from('job_feed_stats')
      .select('source_id,last_success_at,last_error_at,success_count,failure_count,updated_at,metadata')
      .order('source_id')

    if (error) throw error

  const res = NextResponse.json({ success: true, data })
  res.headers.set('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120')
  return res
  } catch (err) {
    const anyErr = err as any
    const message = typeof anyErr?.message === 'string' ? anyErr.message : String(err)
    const code = typeof anyErr?.code === 'string' ? anyErr.code : undefined
    // Graceful fallback if table doesn't exist yet
    if (
      /relation\s+"?job_feed_stats"?\s+does not exist/i.test(message)
      || /table\s+job_feed_stats\s+does not exist/i.test(message)
      || /Could not find the table 'public\.job_feed_stats' in the schema cache/i.test(message)
      || code === 'PGRST205'
    ) {
      const res = NextResponse.json({ success: true, data: [] })
      res.headers.set('X-Notice', 'job_feed_stats table missing; returning empty stats')
      res.headers.set('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=60')
      return res
    }
    logger.error('Failed to load job feed stats', err)
    const res = NextResponse.json({ success: true, data: [] })
    res.headers.set('X-Error', 'stats-error')
    res.headers.set('Cache-Control', 'public, max-age=15, s-maxage=30, stale-while-revalidate=60')
    return res
  }
}
