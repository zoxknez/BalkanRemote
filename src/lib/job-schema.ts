import type { PortalJobRecord } from '@/types/jobs'

interface StructuredJobSalaryValue {
  '@type': 'QuantitativeValue'
  minValue: number
  maxValue?: number
  unitText: 'YEAR'
}

interface StructuredJobSalary {
  '@type': 'MonetaryAmount'
  currency: string
  value: StructuredJobSalaryValue
}

interface StructuredJobPostingBase {
  '@context': 'https://schema.org/'
  '@type': 'JobPosting'
  title: string
  datePosted: string
  hiringOrganization: { '@type': 'Organization'; name: string }
  employmentType: string
  applicantLocationRequirements: { '@type': 'Country'; name: string }
  jobLocationType: 'TELECOMMUTE'
  directApply: true
  url: string
  baseSalary?: StructuredJobSalary
}

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

export function buildStructuredJobPostings(rows: Array<Pick<PortalJobRecord, 'id' | 'title' | 'company' | 'url' | 'posted_at' | 'type' | 'salary_min' | 'salary_max' | 'currency'>>): StructuredJobPostingBase[] {
  return rows.map(j => {
    const base: StructuredJobPostingBase = {
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