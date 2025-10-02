import { describe, it, expect } from 'vitest'
import { mapEmploymentType, buildStructuredJobPostings } from '../job-schema'

describe('job-schema utilities', () => {
  it('maps employment types correctly', () => {
    expect(mapEmploymentType(null)).toBe('FULL_TIME')
    expect(mapEmploymentType('part-time')).toBe('PART_TIME')
    expect(mapEmploymentType('contract')).toBe('CONTRACTOR')
    expect(mapEmploymentType('freelance')).toBe('CONTRACTOR')
    expect(mapEmploymentType('internship')).toBe('INTERN')
    expect(mapEmploymentType('unknown')).toBe('FULL_TIME')
  })

  it('builds structured postings with salary when present', () => {
    const items = buildStructuredJobPostings([{
      id: '1',
      title: 'Senior Developer',
      company: 'Acme',
      url: 'https://example.com/job/1',
      posted_at: '2025-09-01T00:00:00.000Z',
      type: 'contract',
      salary_min: 60000,
      salary_max: 90000,
      currency: 'EUR'
    }])
    expect(items).toHaveLength(1)
    expect(items[0].employmentType).toBe('CONTRACTOR')
    expect(items[0].baseSalary).toBeDefined()
    expect(items[0].baseSalary!.value.minValue).toBe(60000)
  })
})
