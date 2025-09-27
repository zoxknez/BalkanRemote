import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseClient'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'
export const revalidate = 60 // cache hint

export async function GET() {
  try {
    const supabase = createSupabaseServer()
    const { data, error } = await supabase
      .from('job_feed_stats')
      .select('source_id,last_success_at,last_error_at,success_count,failure_count,updated_at,metadata')
      .order('source_id')

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (err) {
    logger.error('Failed to load job feed stats', err)
    return NextResponse.json({ success: false, error: 'Failed to load stats' }, { status: 500 })
  }
}
