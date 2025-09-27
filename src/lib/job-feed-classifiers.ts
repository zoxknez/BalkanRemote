// Job feed classifier helpers extracted for testability
import type { PortalJobContractType, PortalJobInsert } from '@/types/jobs'

export function detectContractType(input: string | undefined): PortalJobContractType | null {
  if (!input) return null
  const normalized = input.toLowerCase()
  if (normalized.includes('intern')) return 'internship'
  if (normalized.includes('contract')) return 'contract'
  if (normalized.includes('freelance') || normalized.includes('gig')) return 'freelance'
  if (normalized.includes('part-time') || normalized.includes('part time')) return 'part-time'
  return 'full-time'
}

export function detectExperienceLevel(input: string | undefined): PortalJobInsert['experience_level'] {
  if (!input) return null
  const normalized = input.toLowerCase()
  if (normalized.includes('senior') || normalized.includes('lead')) return 'senior'
  if (normalized.includes('junior')) return 'entry'
  if (normalized.includes('intern')) return 'entry'
  if (normalized.includes('mid') || normalized.includes('intermediate')) return 'mid'
  return null
}

export function coerceDate(value: string | undefined): string {
  if (!value) {
    return new Date().toISOString()
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString()
  }
  return date.toISOString()
}
