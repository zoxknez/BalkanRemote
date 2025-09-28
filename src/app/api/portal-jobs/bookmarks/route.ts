import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseClient'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseServer()
    const { data: userRes } = await supabase.auth.getUser()
    const userId = userRes.user?.id
    if (!userId) {
      return NextResponse.json({ success: true, data: { jobs: [], total: 0 } })
    }
    const { data, error } = await supabase
      .schema('public')
      .from('job_portal_bookmarks')
      .select('listing:job_portal_listings(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw error
    const jobs = (data || []).map(r => (r as any).listing).filter(Boolean)
    return NextResponse.json({ success: true, data: { jobs, total: jobs.length } })
  } catch (err) {
    return NextResponse.json({ success: true, data: { jobs: [], total: 0 }, notice: (err as Error).message })
  }
}
