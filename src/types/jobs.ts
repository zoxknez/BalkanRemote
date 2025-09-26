// Job Scraper System Types

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: {
    min?: number;
    max?: number;
    currency: string;
    period: 'hour' | 'day' | 'month' | 'year';
  };
  description: string;
  requirements: string[];
  benefits: string[];
  tags: string[];
  seniority: 'junior' | 'mid' | 'senior' | 'lead' | 'executive';
  contractType: 'full-time' | 'part-time' | 'contract' | 'freelance';
  remote: boolean;
  remoteType: 'fully-remote' | 'hybrid' | 'on-site' | 'flexible';
  postedDate: Date;
  applicationUrl: string;
  sourceUrl: string;
  sourceSite: string;
  isActive: boolean;
  applicationDeadline?: Date;
  category: JobCategory;
  skills: string[];
  languages: string[];
  experience?: {
    min: number;
    max?: number;
    unit: 'months' | 'years';
  };
  education?: string;
  scrapedAt: Date;
  lastUpdated: Date;
  fingerprint: string; // For duplicate detection
}

export type JobCategory = 
  | 'software-engineering'
  | 'data-science'
  | 'design'
  | 'marketing'
  | 'sales'
  | 'customer-support'
  | 'hr'
  | 'finance'
  | 'operations'
  | 'management'
  | 'other';

export interface ScraperSource {
  id: string;
  name: string;
  website: string;
  baseUrl: string;
  searchEndpoints: string[];
  isActive: boolean;
  priority: number; // 1-10, higher = more important
  rateLimit: {
    requestsPerMinute: number;
    delayBetweenRequests: number;
  };
  selectors: {
    jobList: string;
    jobTitle: string;
    company: string;
    location: string;
    salary?: string;
    description: string;
    applicationUrl: string;
    postedDate?: string;
  };
  searchTerms: string[];
  maxPages: number;
  country: string[];
  tags: string[];
  lastScraped?: Date;
  lastSuccessfulScrape?: Date;
  errorCount: number;
  successRate: number;
}

export interface ScrapeJob {
  id: string;
  sourceId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'retrying';
  startedAt?: Date;
  completedAt?: Date;
  jobsFound: number;
  jobsInserted: number;
  jobsUpdated: number;
  duplicatesSkipped: number;
  errors: ScrapeError[];
  retryCount: number;
  maxRetries: number;
}

export interface ScrapeError {
  timestamp: Date;
  message: string;
  stack?: string;
  url?: string;
  statusCode?: number;
}

export interface ScraperStats {
  totalSources: number;
  activeSources: number;
  totalJobsScraped: number;
  jobsToday: number;
  jobsThisWeek: number;
  lastScrapeTime: Date;
  averageJobsPerSource: number;
  topSources: {
    sourceId: string;
    sourceName: string;
    jobCount: number;
  }[];
}

export interface JobFilter {
  keywords?: string[];
  location?: string;
  remote?: boolean;
  seniority?: string[];
  contractType?: ('full-time' | 'part-time' | 'contract' | 'freelance')[];
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  category?: JobCategory[];
  postedSince?: Date;
  sourceIds?: string[];
  searchTerm?: string; // For UI convenience
}

export interface JobSearchResult {
  jobs: JobPosting[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  facets: {
    categories: { [key: string]: number };
    locations: { [key: string]: number };
    companies: { [key: string]: number };
    seniority: { [key: string]: number };
  };
}
