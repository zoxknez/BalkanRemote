import { NextRequest, NextResponse } from 'next/server'
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
      .from('hybrid_job_bookmarks')
      .select('listing:hybrid_jobs(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) throw error

    const jobs = ((data as Row[] | null) || [])
      .map(r => r.listing)
      .filter((x): x is NonNullable<typeof x> => Boolean(x))

    return NextResponse.json({ 
      success: true, 
      data: { jobs, total: jobs.length } 
    })
  } catch (err) {
    return NextResponse.json({ 
      success: true, 
      data: { jobs: [], total: 0 }, 
      notice: (err as Error).message 
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseServer()
    const { data: userRes } = await supabase.auth.getUser()
    const userId = userRes.user?.id

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId } = await request.json()

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Job ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .schema('public')
      .from('hybrid_job_bookmarks')
      .insert({
        user_id: userId,
        job_id: jobId
      })

    if (error) {
      // If it's a duplicate key error, that's OK
      if (error.code === '23505') {
        return NextResponse.json({ success: true, message: 'Already bookmarked' })
      }
      throw error
    }

    return NextResponse.json({ success: true, message: 'Bookmarked successfully' })
  } catch (err) {
    return NextResponse.json({ 
      success: false, 
      error: (err as Error).message 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseServer()
    const { data: userRes } = await supabase.auth.getUser()
    const userId = userRes.user?.id

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'Job ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .schema('public')
      .from('hybrid_job_bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('job_id', jobId)

    if (error) throw error

    return NextResponse.json({ success: true, message: 'Bookmark removed successfully' })
  } catch (err) {
    return NextResponse.json({ 
      success: false, 
      error: (err as Error).message 
    }, { status: 500 })
  }
}

