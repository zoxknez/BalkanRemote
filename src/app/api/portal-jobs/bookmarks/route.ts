import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabaseClient'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Row = { listing: unknown | null }
export async function GET() {
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
    const jobs = ((data as Row[] | null) || []).map(r => r.listing).filter((x): x is NonNullable<typeof x> => Boolean(x))
    return NextResponse.json({ success: true, data: { jobs, total: jobs.length } })
  } catch (err) {
    return NextResponse.json({ success: true, data: { jobs: [], total: 0 }, notice: (err as Error).message })
  }
}
