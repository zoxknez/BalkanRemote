import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'
import { GET as suggest } from '@/app/api/portal-jobs/suggest/route'
import * as supa from '@/lib/supabaseClient'

describe('GET /api/portal-jobs/suggest', () => {
  const originalEnv = { ...process.env }
  beforeEach(() => {
    vi.resetAllMocks()
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
  })
  afterEach(() => { process.env = { ...originalEnv } })

  it('returns empty for short query', async () => {
    const url = new URL('http://localhost/api/portal-jobs/suggest?q=a')
    const req = new NextRequest(url.toString())
    const res = await suggest(req)
    const json = await res.json()
    expect(json.suggestions).toHaveLength(0)
  })

  it('returns merged distinct results', async () => {
    // mock supabase client shape used
    const mock = {
      from() { return this },
      select() { return this },
      ilike() { return this },
      limit() { return Promise.resolve({ data: [ { title: 'React Developer' } ], error: null }) },
    }
    // companies call will reuse same chain; second promise resolves similarly
    let callCount = 0
    vi.spyOn(mock as any, 'limit').mockImplementation(() => {
      callCount += 1
      if (callCount === 1) return Promise.resolve({ data: [ { title: 'React Developer' } ], error: null })
      return Promise.resolve({ data: [ { company: 'Reactive Labs' } ], error: null })
    })
    vi.spyOn(supa, 'createSupabaseServer').mockReturnValue(mock as any)
    const url = new URL('http://localhost/api/portal-jobs/suggest?q=react')
    const req = new NextRequest(url.toString())
    const res = await suggest(req)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.suggestions.length).toBeGreaterThanOrEqual(1)
    expect(json.suggestions.some((s: string) => s.toLowerCase().includes('react'))).toBe(true)
  })
})
