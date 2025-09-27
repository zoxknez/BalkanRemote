import type { PortalJobRecord } from '@/types/jobs'

export function mapEmploymentType(raw: string | null | undefined): string {
  if (!raw) return 'FULL_TIME'
  switch (raw) {
    case 'part-time': return 'PART_TIME'
    case 'contract': return 'CONTRACTOR'
    case 'freelance': return 'CONTRACTOR'
    case 'internship': return 'INTERN'
    default: return 'FULL_TIME'
  }
}

export function buildStructuredJobPostings(rows: Array<Pick<PortalJobRecord, 'id' | 'title' | 'company' | 'url' | 'posted_at' | 'type' | 'salary_min' | 'salary_max' | 'currency'>>): any[] {
  return rows.map(j => {
    const base: Record<string, any> = {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: j.title,
      datePosted: j.posted_at,
      hiringOrganization: { '@type': 'Organization', name: j.company },
      employmentType: mapEmploymentType(j.type),
      applicantLocationRequirements: { '@type': 'Country', name: 'Remote' },
      jobLocationType: 'TELECOMMUTE',
      directApply: true,
      url: j.url,
    }
    if (j.salary_min && j.currency) {
      base.baseSalary = {
        '@type': 'MonetaryAmount',
        currency: j.currency,
        value: {
          '@type': 'QuantitativeValue',
          minValue: j.salary_min,
          maxValue: j.salary_max || undefined,
          unitText: 'YEAR'
        }
      }
    }
    return base
  })
}