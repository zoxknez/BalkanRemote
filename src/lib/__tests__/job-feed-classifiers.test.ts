import { describe, it, expect } from 'vitest'
import { detectContractType, detectExperienceLevel } from '@/lib/job-feed-classifiers'

describe('job-feed-classifiers', () => {
  it('detects contract types', () => {
    expect(detectContractType('Great Internship opportunity')).toBe('internship')
    expect(detectContractType('Freelance gig for designer')).toBe('freelance')
    expect(detectContractType('Part-time support role')).toBe('part-time')
    expect(detectContractType('12 month CONTRACT dev')).toBe('contract')
    expect(detectContractType('Software Engineer')).toBe('full-time')
  })

  it('detects experience levels', () => {
    expect(detectExperienceLevel('Senior Typescript Engineer')).toBe('senior')
    expect(detectExperienceLevel('Lead Platform Architect')).toBe('senior')
    expect(detectExperienceLevel('Junior QA')).toBe('entry')
    expect(detectExperienceLevel('Intern Android Developer')).toBe('entry')
    expect(detectExperienceLevel('Mid React dev')).toBe('mid')
    expect(detectExperienceLevel('Software Engineer')).toBeNull()
  })
})
