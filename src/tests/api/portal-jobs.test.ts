import { describe, it, expect, vi } from 'vitest'
import { NextRequest } from 'next/server'
import * as repo from '@/lib/job-portal-repository'
import { GET as getPortalJobs } from '@/app/api/portal-jobs/route'

// Lightweight integration-style test by mocking repository layer only.

describe('GET /api/portal-jobs', () => {
  it('returns jobs, facets and pagination metadata', async () => {
    const spy = vi.spyOn(repo, 'fetchPortalJobs').mockResolvedValue({
      rows: [
        {
          id: '1', title: 'Backend Engineer', company: 'Acme', url: 'https://example.com', posted_at: '2025-09-01T00:00:00.000Z',
          type: 'full-time', location: null, salary_min: null, salary_max: null, currency: null, source_id: 'src', external_id: 'ext',
          category: 'engineering', company_logo: null, description: null, requirements: null, benefits: null, is_remote: true, remote_type: 'fully-remote', experience_level: 'senior', deadline: null, source_url: 'https://example.com', featured: false, tags: [], metadata: {}
        }
      ],
      total: 1,
      globalFacets: {
        contractType: { 'full-time': 1 },
        experienceLevel: { senior: 1 },
        category: { engineering: 1 }
      }
    } as any)

    const url = new URL('http://localhost/api/portal-jobs?limit=10')
    const req = new NextRequest(url.toString(), { method: 'GET', headers: { 'x-forwarded-for': '1.2.3.4' } })
    const res = await getPortalJobs(req)
    const json = await res.json()

    expect(json.success).toBe(true)
    expect(json.data.jobs).toHaveLength(1)
    expect(json.data.facets.contractType['full-time']).toBe(1)
    expect(spy).toHaveBeenCalledOnce()
  })

  it('applies rate limit (simulated)', async () => {
    // We invoke 61 times with same IP to exceed default 60 / 60s.
    vi.spyOn(repo, 'fetchPortalJobs').mockResolvedValue({ rows: [], total: 0, globalFacets: { contractType: {}, experienceLevel: {}, category: {} } } as any)
    const url = new URL('http://localhost/api/portal-jobs?limit=1')
    let lastStatus = 200
    for (let i = 0; i < 61; i++) {
      const req = new NextRequest(url.toString(), { method: 'GET', headers: { 'x-forwarded-for': '9.9.9.9' } })
      const res = await getPortalJobs(req)
      lastStatus = res.status
    }
    expect(lastStatus).toBe(429)
  })
})