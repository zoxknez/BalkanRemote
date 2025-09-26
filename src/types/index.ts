export interface Job {
  id: string
  title: string
  company: string
  companyLogo?: string
  location: string
  type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship'
  category: string
  description: string
  requirements: string[]
  benefits: string[]
  salaryMin?: number
  salaryMax?: number
  currency: string
  isRemote: boolean
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead'
  postedAt: Date
  deadline?: Date
  url: string
  featured: boolean
  tags: string[]
}

export interface Company {
  id: string
  name: string
  logo?: string
  description: string
  website: string
  linkedin?: string
  size: string
  industry: string
  location: string
  foundedYear?: number
  isHiring: boolean
  openPositions: number
  benefits: string[]
  techStack: string[]
  rating?: number
  reviewCount?: number
}

export interface Resource {
  id: string
  title: string
  description: string
  url: string
  category: 'sajt' | 'alat' | 'kurs' | 'blog' | 'podcast' | 'knjiga' | 'newsletter'
  type: 'besplatno' | 'placeno' | 'freemium'
  rating?: number
  tags: string[]
  language: 'sr' | 'en' | 'mix'
  featured?: boolean
  author?: string
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  timeToComplete?: string
}

export interface Tool {
  id: string
  name: string
  description: string
  url: string
  category: 'komunikacija' | 'produktivnost' | 'design' | 'development' | 'project-management' | 'time-tracking' | 'finance' | 'marketing' | 'security' | 'analytics' | 'ai-tools' | 'storage' | 'automation'
  pricing: 'besplatno' | 'placeno' | 'freemium'
  rating?: number
  features: string[]
  platforms?: string[]
  userCount?: string
  pros?: string[]
  cons?: string[]
  alternatives?: string[]
  lastUpdated?: string
}
