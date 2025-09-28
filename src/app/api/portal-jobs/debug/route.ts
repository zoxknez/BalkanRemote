import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseClient'
import type { PortalJobRecord } from '@/types/jobs'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const hasUrlPub = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const hasUrlSrv = Boolean(process.env.SUPABASE_URL)
  const hasAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const hasService = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)

  const envInfo = {
    hasUrlPub,
    hasUrlSrv,
    hasAnon,
    hasService,
    effectiveUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || null,
  }

  // If no service key we cannot query securely – return env only
  if (!hasService || !(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL)) {
    return NextResponse.json({
      success: true,
      note: 'Supabase service credentials missing – cannot query job_portal_listings',
      env: envInfo,
      counts: { job_portal_listings: 0 },
      sample: [],
    }, { status: 200 })
  }

  try {
    const supabase = createSupabaseServer()
    const { count, error } = await supabase
      .schema('public')
      .from('job_portal_listings')
      .select('id', { count: 'exact', head: true })
    if (error) {
      return NextResponse.json({
        success: true,
        env: envInfo,
        counts: { job_portal_listings: 0 },
        sample: [],
        notice: `Count error: ${error.message}`,
      })
    }
    const { data: sampleData, error: sampleErr } = await supabase
      .schema('public')
      .from('job_portal_listings')
      .select('*')
      .order('posted_at', { ascending: false })
      .limit(5)
    if (sampleErr) {
      return NextResponse.json({
        success: true,
        env: envInfo,
        counts: { job_portal_listings: count || 0 },
        sample: [],
        notice: `Sample error: ${sampleErr.message}`,
      })
    }
    const slimSample = (sampleData as PortalJobRecord[] | null || []).map(r => ({
      id: r.id,
      title: r.title,
      company: r.company,
      is_remote: r.is_remote,
      posted_at: r.posted_at,
      created_at: r.created_at,
      type: r.type,
      experience_level: r.experience_level,
      category: r.category,
    }))
    return NextResponse.json({
      success: true,
      env: envInfo,
      counts: { job_portal_listings: count || 0 },
      sample: slimSample,
    })
  } catch (err) {
    return NextResponse.json({
      success: true,
      env: envInfo,
      counts: { job_portal_listings: 0 },
      sample: [],
      notice: `Unhandled error: ${err instanceof Error ? err.message : String(err)}`,
    })
  }
}
