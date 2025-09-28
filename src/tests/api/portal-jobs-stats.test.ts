import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET as getStats } from '@/app/api/portal-jobs/stats/route'
import * as supa from '@/lib/supabaseClient'

// We mock createSupabaseServer to return a selectable interface.

describe('GET /api/portal-jobs/stats (token gated)', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.resetAllMocks()
    process.env.FEED_STATS_TOKEN = 'secret-token'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
  })

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  interface Row { source_id: string; last_success_at: string | null; last_error_at: string | null; success_count: number; failure_count: number; updated_at: string; metadata?: Record<string, unknown> }
  interface MockQueryBuilder {
    from(table: string): MockQueryBuilder
    select(_cols: string): MockQueryBuilder
    order(_col: string): Promise<{ data: Row[]; error: null }>
  }
  function mockStatsReturn(rows: Row[] = []) {
    const mock: MockQueryBuilder = {
      from() { return this },
      select() { return this },
      order() { return Promise.resolve({ data: rows, error: null }) }
    }
    vi.spyOn(supa, 'createSupabaseServer').mockReturnValue(mock as unknown as ReturnType<typeof supa.createSupabaseServer>)
  }

  it('rejects when token missing', async () => {
    mockStatsReturn([])
    const url = new URL('http://localhost/api/portal-jobs/stats')
    const req = new NextRequest(url.toString(), { method: 'GET' })
    const res = await getStats(req as unknown as Request)
    expect(res.status).toBe(401)
    const json = await res.json()
    expect(json.error).toBe('Unauthorized')
  })

  it('accepts with valid bearer token', async () => {
    const rows = [ { source_id: 'stack', last_success_at: null, last_error_at: null, success_count: 1, failure_count: 0, updated_at: new Date().toISOString(), metadata: {} } ]
    mockStatsReturn(rows)
    const url = new URL('http://localhost/api/portal-jobs/stats')
    const req = new NextRequest(url.toString(), { method: 'GET', headers: { Authorization: 'Bearer secret-token' } })
    const res = await getStats(req as unknown as Request)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data).toHaveLength(1)
  })

  it('rejects with wrong token', async () => {
    mockStatsReturn([])
    const url = new URL('http://localhost/api/portal-jobs/stats')
    const req = new NextRequest(url.toString(), { method: 'GET', headers: { Authorization: 'Bearer nope' } })
    const res = await getStats(req as unknown as Request)
    expect(res.status).toBe(401)
  })
})
