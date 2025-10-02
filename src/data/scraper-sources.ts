import { ScraperSource } from '@/types/jobs';

// Konfiguracija za 40+ job board sajtova fokusiran na remote rad i Balkan
export const scraperSources: ScraperSource[] = [
  // Global Remote Job Boards
  {
    id: 'remote-co',
    name: 'Remote.co',
    website: 'https://remote.co',
    baseUrl: 'https://remote.co',
    searchEndpoints: ['/remote-jobs/developer/', '/remote-jobs/designer/', '/remote-jobs/marketing/'],
    isActive: true,
    priority: 9,
    rateLimit: {
      requestsPerMinute: 30,
      delayBetweenRequests: 2000
    },
    selectors: {
      jobList: '.job_listing',
      jobTitle: '.job_listing-clickbox h4',
      company: '.job_listing-clickbox .company',
      location: '.job_listing-clickbox .location',
      salary: '.job_listing-clickbox .salary',
      description: '.job_description',
      applicationUrl: '.job_listing-clickbox a',
      postedDate: '.job_listing-clickbox .date'
    },
    searchTerms: ['remote', 'developer', 'designer', 'marketing'],
    maxPages: 5,
    country: ['US', 'UK', 'DE', 'NL'],
    tags: ['remote', 'global', 'english'],
    errorCount: 0,
    successRate: 95.2
  },
  
  {
    id: 'weworkremotely',
    name: 'We Work Remotely',
    website: 'https://weworkremotely.com',
    baseUrl: 'https://weworkremotely.com',
    searchEndpoints: ['/remote-jobs/programming', '/remote-jobs/design', '/remote-jobs/marketing'],
    isActive: true,
    priority: 9,
    rateLimit: {
      requestsPerMinute: 20,
      delayBetweenRequests: 3000
    },
    selectors: {
      jobList: '.jobs li',
      jobTitle: '.title',
      company: '.company',
      location: '.region',
      description: '.description',
      applicationUrl: 'a',
      postedDate: '.date'
    },
    searchTerms: ['programming', 'design', 'marketing'],
    maxPages: 3,
    country: ['GLOBAL'],
    tags: ['remote', 'high-quality', 'curated'],
    errorCount: 0,
    successRate: 92.8
  },

  {
    id: 'remoteworkhub',
    name: 'RemoteWorkHub',
    website: 'https://remoteworkhub.com',
    baseUrl: 'https://remoteworkhub.com',
    searchEndpoints: ['/jobs/europe', '/jobs/tech', '/jobs/startup'],
  isActive: false,
    priority: 7,
    rateLimit: {
      requestsPerMinute: 25,
      delayBetweenRequests: 2500
    },
    selectors: {
      jobList: '.job-card',
      jobTitle: '.job-title',
      company: '.company-name',
      location: '.location',
      salary: '.salary-range',
      description: '.job-description',
      applicationUrl: '.apply-btn',
      postedDate: '.posted-date'
    },
    searchTerms: ['europe', 'tech', 'startup'],
    maxPages: 4,
    country: ['EU'],
    tags: ['europe', 'startup-friendly'],
    errorCount: 2,
    successRate: 88.5
  },

  // Regional European Job Boards
  {
    id: 'jobs-ch',
    name: 'Jobs.ch',
    website: 'https://jobs.ch',
    baseUrl: 'https://jobs.ch',
    searchEndpoints: ['/remote-jobs', '/tech-jobs', '/startup-jobs'],
    isActive: true,
    priority: 7,
    rateLimit: {
      requestsPerMinute: 15,
      delayBetweenRequests: 4000
    },
    selectors: {
      jobList: '.job-result',
      jobTitle: '.job-title a',
      company: '.company-name',
      location: '.location',
      salary: '.salary',
      description: '.job-description',
      applicationUrl: '.job-title a',
      postedDate: '.date-posted'
    },
    searchTerms: ['remote', 'tech', 'startup'],
    maxPages: 3,
    country: ['CH', 'AT', 'DE'],
    tags: ['dach-region', 'high-salary'],
    errorCount: 1,
    successRate: 91.2
  },

  {
    id: 'stepstone-de',
    name: 'StepStone.de',
    website: 'https://stepstone.de',
    baseUrl: 'https://stepstone.de',
    searchEndpoints: ['/remote-jobs', '/it-jobs', '/marketing-jobs'],
      isActive: false,
    priority: 8,
    rateLimit: {
      requestsPerMinute: 10,
      delayBetweenRequests: 6000
    },
    selectors: {
      jobList: '[data-testid="job-item"]',
      jobTitle: '[data-testid="job-title"]',
      company: '[data-testid="company-name"]',
      location: '[data-testid="job-location"]',
      salary: '[data-testid="salary"]',
      description: '.job-description',
      applicationUrl: '[data-testid="apply-button"]',
      postedDate: '[data-testid="posted-date"]'
    },
    searchTerms: ['remote', 'IT', 'marketing'],
    maxPages: 5,
    country: ['DE', 'AT', 'CH'],
    tags: ['german-market', 'corporate'],
    errorCount: 0,
  successRate: 94.1,
  requiresOfficialApi: true
  },

  // Balkan Specific Job Boards
  {
    id: 'infostud',
    name: 'Infostud.com',
    website: 'https://poslovi.infostud.com',
    baseUrl: 'https://poslovi.infostud.com',
    // Dodato: direktan link na REMOTE filter (rad na daljinu)
    searchEndpoints: [
      '/oglasi-za-posao?work_place_type%5B0%5D=remote',
      '/oglasi/it-stručnjaci',
      '/oglasi/marketing',
      '/oglasi/prodaja'
    ],
    isActive: true,
    priority: 9,
    rateLimit: {
      requestsPerMinute: 20,
      delayBetweenRequests: 3000
    },
    selectors: {
      jobList: '.job-ad',
      jobTitle: '.job-ad-title a',
      company: '.company-name',
      location: '.location',
      salary: '.salary',
      description: '.job-description',
      applicationUrl: '.job-ad-title a',
      postedDate: '.date'
    },
    searchTerms: ['IT', 'remote', 'marketing'],
    maxPages: 4,
    country: ['RS'],
    tags: ['serbia', 'local', 'balkans'],
    errorCount: 0,
    successRate: 89.7
  },

  {
    id: 'poslovi-ba',
    name: 'Poslovi.ba',
    website: 'https://poslovi.ba',
    baseUrl: 'https://poslovi.ba',
    searchEndpoints: ['/remote-poslovi', '/it-poslovi', '/marketing-poslovi'],
    isActive: true,
    priority: 8,
    rateLimit: {
      requestsPerMinute: 15,
      delayBetweenRequests: 4000
    },
    selectors: {
      jobList: '.job-listing',
      jobTitle: '.job-title',
      company: '.employer-name',
      location: '.job-location',
      description: '.job-summary',
      applicationUrl: '.apply-link',
      postedDate: '.publish-date'
    },
    searchTerms: ['remote', 'IT', 'marketing'],
    maxPages: 3,
    country: ['BA'],
    tags: ['bosnia', 'balkans', 'local'],
    errorCount: 1,
    successRate: 86.3
  },

  {
    id: 'posao-hr',
    name: 'Posao.hr',
    website: 'https://posao.hr',
    baseUrl: 'https://posao.hr',
    searchEndpoints: ['/remote-rad', '/it-poslovi', '/oglasi'],
    isActive: true,
    priority: 8,
    rateLimit: {
      requestsPerMinute: 18,
      delayBetweenRequests: 3500
    },
    selectors: {
      jobList: '.job-ad-item',
      jobTitle: '.job-title a',
      company: '.company-link',
      location: '.job-location',
      salary: '.salary-info',
      description: '.job-description',
      applicationUrl: '.job-title a',
      postedDate: '.ad-date'
    },
    searchTerms: ['remote', 'IT', 'oglasi'],
    maxPages: 4,
    country: ['HR'],
    tags: ['croatia', 'balkans'],
    errorCount: 0,
    successRate: 91.5
  },

  // Tech-Specific Job Boards
  {
    id: 'stackoverflow-jobs',
    name: 'Stack Overflow Jobs',
    website: 'https://stackoverflow.com/jobs',
    baseUrl: 'https://stackoverflow.com/jobs',
    searchEndpoints: ['/remote-developer-jobs', '/javascript-jobs', '/python-jobs'],
  isActive: false,
    priority: 9,
    rateLimit: {
      requestsPerMinute: 12,
      delayBetweenRequests: 5000
    },
    selectors: {
      jobList: '.listResults .job',
      jobTitle: '.job-title a',
      company: '.employer',
      location: '.location',
      salary: '.salary',
      description: '.job-description',
      applicationUrl: '.job-title a',
      postedDate: '.relativetime'
    },
    searchTerms: ['remote', 'javascript', 'python'],
    maxPages: 3,
    country: ['GLOBAL'],
    tags: ['developers', 'tech', 'high-quality'],
    errorCount: 0,
    successRate: 96.8
  },

  {
    id: 'github-jobs',
    name: 'GitHub Jobs',
    website: 'https://jobs.github.com',
    baseUrl: 'https://jobs.github.com',
    searchEndpoints: ['/positions', '/positions/remote'],
  isActive: false,
    priority: 8,
    rateLimit: {
      requestsPerMinute: 15,
      delayBetweenRequests: 4000
    },
    selectors: {
      jobList: '.job',
      jobTitle: '.title a',
      company: '.company',
      location: '.location',
      description: '.description',
      applicationUrl: '.title a',
      postedDate: '.date'
    },
    searchTerms: ['remote', 'full-time'],
    maxPages: 2,
    country: ['GLOBAL'],
    tags: ['developers', 'github', 'open-source'],
    errorCount: 0,
    successRate: 93.2
  },

  // Freelance & Contract Platforms
  {
    id: 'upwork',
    name: 'Upwork',
    website: 'https://upwork.com',
    baseUrl: 'https://upwork.com',
    searchEndpoints: ['/freelance-jobs/web-development', '/freelance-jobs/design', '/freelance-jobs/marketing'],
    isActive: true,
    priority: 7,
    rateLimit: {
      requestsPerMinute: 8,
      delayBetweenRequests: 7500
    },
    selectors: {
      jobList: '.job-tile',
      jobTitle: '.job-title a',
      company: '.client-name',
      location: '.client-location',
      description: '.job-description',
      applicationUrl: '.job-title a',
      postedDate: '.posted-on'
    },
    searchTerms: ['web-development', 'design', 'marketing'],
    maxPages: 3,
    country: ['GLOBAL'],
    tags: ['freelance', 'contract', 'hourly'],
    errorCount: 2,
    successRate: 84.1
  },

  {
    id: 'toptal',
    name: 'Toptal',
    website: 'https://toptal.com',
    baseUrl: 'https://toptal.com',
    searchEndpoints: ['/freelance-jobs', '/developers'],
    isActive: true,
    priority: 8,
    rateLimit: {
      requestsPerMinute: 5,
      delayBetweenRequests: 12000
    },
    selectors: {
      jobList: '.job-listing',
      jobTitle: '.job-title',
      company: '.client-company',
      location: 'Remote',
      description: '.job-description',
      applicationUrl: '.apply-button',
      postedDate: '.posted-date'
    },
    searchTerms: ['freelance-jobs', 'developers'],
    maxPages: 2,
    country: ['GLOBAL'],
    tags: ['premium', 'top-talent', 'high-rate'],
    errorCount: 0,
    successRate: 97.3
  },

  // Company Career Pages (High-growth startups)
  {
    id: 'notion-careers',
    name: 'Notion Careers',
    website: 'https://notion.so/careers',
    baseUrl: 'https://notion.so/careers',
    searchEndpoints: ['/engineering', '/design', '/marketing'],
    isActive: true,
    priority: 6,
    rateLimit: {
      requestsPerMinute: 10,
      delayBetweenRequests: 6000
    },
    selectors: {
      jobList: '.job-posting',
      jobTitle: '.job-title',
      company: 'Notion',
      location: '.location',
      description: '.job-description',
      applicationUrl: '.apply-link'
    },
    searchTerms: ['engineering', 'design', 'marketing'],
    maxPages: 1,
    country: ['GLOBAL'],
    tags: ['startup', 'remote-first', 'high-growth'],
    errorCount: 0,
    successRate: 88.9
  },

  {
    id: 'stripe-careers',
    name: 'Stripe Careers',
    website: 'https://stripe.com/jobs',
    baseUrl: 'https://stripe.com/jobs',
    searchEndpoints: ['/engineering', '/design', '/business'],
    isActive: true,
    priority: 7,
    rateLimit: {
      requestsPerMinute: 8,
      delayBetweenRequests: 7500
    },
    selectors: {
      jobList: '.job-listing',
      jobTitle: '.job-title a',
      company: 'Stripe',
      location: '.job-location',
      description: '.job-summary',
      applicationUrl: '.job-title a'
    },
    searchTerms: ['engineering', 'design', 'business'],
    maxPages: 1,
    country: ['GLOBAL'],
    tags: ['fintech', 'remote-friendly', 'high-compensation'],
    errorCount: 0,
    successRate: 94.7
  },

  // Additional European Job Boards
  {
    id: 'thelocal-jobs',
    name: 'TheLocal.com Jobs',
    website: 'https://jobs.thelocal.com',
    baseUrl: 'https://jobs.thelocal.com',
    searchEndpoints: ['/sweden', '/germany', '/denmark'],
    isActive: true,
    priority: 6,
    rateLimit: {
      requestsPerMinute: 15,
      delayBetweenRequests: 4000
    },
    selectors: {
      jobList: '.job-item',
      jobTitle: '.job-title',
      company: '.company-name',
      location: '.job-location',
      description: '.job-excerpt',
      applicationUrl: '.job-link'
    },
    searchTerms: ['sweden', 'germany', 'denmark'],
    maxPages: 2,
    country: ['SE', 'DE', 'DK'],
    tags: ['nordic', 'europe', 'english-speaking'],
    errorCount: 1,
    successRate: 82.4
  },

  // Additional 25+ job boards to reach 40+ total...
  {
    id: 'indeed-global',
    name: 'Indeed Global',
    website: 'https://indeed.com',
    baseUrl: 'https://indeed.com',
    searchEndpoints: ['/jobs?q=remote+developer', '/jobs?q=remote+designer', '/jobs?q=remote+marketing'],
      isActive: false,
    priority: 8,
    rateLimit: {
      requestsPerMinute: 20,
      delayBetweenRequests: 3000
    },
    selectors: {
      jobList: '.jobsearch-SerpJobCard',
      jobTitle: '.jobTitle-color-purple',
      company: '.companyName',
      location: '.companyLocation',
      salary: '.salaryText',
      description: '.job-snippet',
      applicationUrl: '.jobTitle-color-purple'
    },
    searchTerms: ['remote+developer', 'remote+designer', 'remote+marketing'],
    maxPages: 5,
    country: ['GLOBAL'],
    tags: ['global', 'volume', 'diverse'],
    errorCount: 3,
  successRate: 87.2,
  requiresOfficialApi: true
  },

  {
    id: 'glassdoor',
    name: 'Glassdoor',
    website: 'https://glassdoor.com',
    baseUrl: 'https://glassdoor.com',
    searchEndpoints: ['/Jobs/remote-jobs.htm', '/Jobs/software-engineer-jobs.htm'],
      isActive: false,
    priority: 7,
    rateLimit: {
      requestsPerMinute: 12,
      delayBetweenRequests: 5000
    },
    selectors: {
      jobList: '.react-job-listing',
      jobTitle: '.jobTitle',
      company: '.employerName',
      location: '.jobLocation',
      salary: '.salaryText',
      description: '.jobDescription',
      applicationUrl: '.jobLink'
    },
    searchTerms: ['remote-jobs', 'software-engineer-jobs'],
    maxPages: 3,
    country: ['GLOBAL'],
    tags: ['company-reviews', 'salary-insights'],
    errorCount: 2,
  successRate: 89.5,
  requiresOfficialApi: true
  },

  {
    id: 'linkedin-jobs',
    name: 'LinkedIn Jobs',
    website: 'https://linkedin.com/jobs',
    baseUrl: 'https://linkedin.com/jobs',
    searchEndpoints: ['/remote-jobs', '/software-engineer-jobs', '/marketing-jobs'],
      isActive: false,
    priority: 9,
    rateLimit: {
      requestsPerMinute: 6,
      delayBetweenRequests: 10000
    },
    selectors: {
      jobList: '.jobs-search-results__list-item',
      jobTitle: '.job-title-link',
      company: '.job-result-card__company-link',
      location: '.job-result-card__location',
      description: '.job-result-card__snippet',
      applicationUrl: '.job-title-link'
    },
    searchTerms: ['remote-jobs', 'software-engineer-jobs', 'marketing-jobs'],
    maxPages: 4,
    country: ['GLOBAL'],
    tags: ['professional-network', 'quality', 'networking'],
    errorCount: 1,
  successRate: 91.8,
  requiresOfficialApi: true
  }
];

// Dodaj još 15+ izvora da dostignemo 40+
export const additionalScraperSources: ScraperSource[] = [
  {
    id: 'angel-list',
    name: 'AngelList',
    website: 'https://angel.co/jobs',
    baseUrl: 'https://angel.co/jobs',
    searchEndpoints: ['/startup-jobs', '/remote-jobs'],
    isActive: true,
    priority: 8,
    rateLimit: { requestsPerMinute: 10, delayBetweenRequests: 6000 },
    selectors: {
      jobList: '.job-listing',
      jobTitle: '.job-title',
      company: '.startup-name',
      location: '.job-location',
      description: '.job-description',
      applicationUrl: '.apply-button'
    },
    searchTerms: ['startup-jobs', 'remote-jobs'],
    maxPages: 3,
    country: ['GLOBAL'],
    tags: ['startups', 'equity', 'early-stage'],
    errorCount: 0,
    successRate: 88.3
  },

  {
    id: 'remote-io',
    name: 'Remote.io',
    website: 'https://remote.io',
    baseUrl: 'https://remote.io',
    searchEndpoints: ['/remote-jobs'],
    isActive: true,
    priority: 7,
    rateLimit: { requestsPerMinute: 15, delayBetweenRequests: 4000 },
    selectors: {
      jobList: '.job-card',
      jobTitle: '.job-title',
      company: '.company-name',
      location: 'Remote',
      description: '.job-summary',
      applicationUrl: '.apply-link'
    },
    searchTerms: ['remote-jobs'],
    maxPages: 2,
    country: ['GLOBAL'],
    tags: ['remote-only', 'curated'],
    errorCount: 0,
    successRate: 92.1
  },

  {
    id: 'flexjobs',
    name: 'FlexJobs',
    website: 'https://flexjobs.com',
    baseUrl: 'https://flexjobs.com',
    searchEndpoints: ['/remote-jobs', '/freelance-jobs'],
    isActive: true,
    priority: 7,
    rateLimit: { requestsPerMinute: 8, delayBetweenRequests: 7500 },
    selectors: {
      jobList: '.job',
      jobTitle: '.job-title a',
      company: '.company',
      location: '.location',
      description: '.job-description',
      applicationUrl: '.job-title a'
    },
    searchTerms: ['remote-jobs', 'freelance-jobs'],
    maxPages: 3,
    country: ['GLOBAL'],
    tags: ['flexible', 'remote', 'part-time'],
    errorCount: 1,
    successRate: 86.7
  },

  // Newly added global remote job boards for expanded coverage
  {
    id: 'remotive',
    name: 'Remotive',
    website: 'https://remotive.com',
    baseUrl: 'https://remotive.com/remote-jobs',
    searchEndpoints: ['/search/{query}', '/software-dev', '/marketing'],
    isActive: true,
    priority: 8,
    rateLimit: { requestsPerMinute: 30, delayBetweenRequests: 2000 },
    selectors: {
      jobList: '.job-tile',
      jobTitle: '.job-tile a',
      company: '.job-tile .company',
      location: '.job-tile .location',
      description: '.job-description',
      applicationUrl: '.job-tile a'
    },
    searchTerms: ['software', 'developer', 'marketing'],
    maxPages: 5,
    country: ['GLOBAL'],
    tags: ['remote-only', 'curated'],
    errorCount: 0,
    successRate: 88.1
  },
  {
    id: 'himalayas',
    name: 'Himalayas',
    website: 'https://himalayas.app',
    baseUrl: 'https://himalayas.app/jobs',
    searchEndpoints: ['?search={query}'],
    isActive: true,
    priority: 7,
    rateLimit: { requestsPerMinute: 20, delayBetweenRequests: 2500 },
    selectors: {
      jobList: 'article[data-job-id]',
      jobTitle: 'h3 a',
      company: '.company a',
      location: '.meta .location',
      description: '.prose',
      applicationUrl: 'h3 a'
    },
    searchTerms: ['software', 'frontend', 'backend'],
    maxPages: 4,
    country: ['GLOBAL'],
    tags: ['remote', 'curated'],
    errorCount: 0,
    successRate: 86.2
  },
  {
    id: 'jobspresso',
    name: 'Jobspresso',
    website: 'https://jobspresso.co',
    baseUrl: 'https://jobspresso.co/remote-work',
    searchEndpoints: ['/search/{query}'],
    isActive: true,
    priority: 6,
    rateLimit: { requestsPerMinute: 18, delayBetweenRequests: 3000 },
    selectors: {
      jobList: '.job_listing',
      jobTitle: '.position h3',
      company: '.company .name',
      location: '.location',
      description: '.job_description',
      applicationUrl: 'a'
    },
    searchTerms: ['developer', 'engineer', 'marketing'],
    maxPages: 4,
    country: ['GLOBAL'],
    tags: ['remote-only'],
    errorCount: 0,
    successRate: 80.4
  },
  {
    id: 'workingnomads',
    name: 'Working Nomads',
    website: 'https://www.workingnomads.com',
    baseUrl: 'https://www.workingnomads.com/jobs',
    searchEndpoints: ['/remote-{query}-jobs'],
    isActive: true,
    priority: 6,
    rateLimit: { requestsPerMinute: 25, delayBetweenRequests: 2400 },
    selectors: {
      jobList: '.jobs-list-item',
      jobTitle: '.title a',
      company: '.company',
      location: '.location',
      description: '.description',
      applicationUrl: '.title a'
    },
    searchTerms: ['developer', 'devops', 'cloud'],
    maxPages: 4,
    country: ['GLOBAL'],
    tags: ['aggregator'],
    errorCount: 0,
    successRate: 78.6
  },
  {
    id: 'europeremote',
    name: 'EuropeRemotely',
    website: 'https://europeremotely.com',
    baseUrl: 'https://europeremotely.com/jobs',
    searchEndpoints: ['?q={query}'],
    isActive: true,
    priority: 5,
    rateLimit: { requestsPerMinute: 15, delayBetweenRequests: 3000 },
    selectors: {
      jobList: '.job',
      jobTitle: '.job h2 a',
      company: '.company',
      location: '.location',
      description: '.details',
      applicationUrl: '.job h2 a'
    },
    searchTerms: ['engineer', 'developer'],
    maxPages: 3,
    country: ['EU'],
    tags: ['europe', 'timezone-aligned'],
    errorCount: 0,
    successRate: 74.5
  },
  {
    id: 'larajobs',
    name: 'LaraJobs',
    website: 'https://larajobs.com',
    baseUrl: 'https://larajobs.com',
    searchEndpoints: ['/jobs/search?query={query}&remote=1'],
    isActive: true,
    priority: 5,
    rateLimit: { requestsPerMinute: 10, delayBetweenRequests: 6000 },
    selectors: {
      jobList: '.job-post',
      jobTitle: '.job-post h2 a',
      company: '.job-post .company',
      location: '.job-post .meta',
      description: '.job-post .description',
      applicationUrl: '.job-post h2 a'
    },
    searchTerms: ['laravel', 'php', 'backend'],
    maxPages: 2,
    country: ['GLOBAL'],
    tags: ['niche', 'php'],
    errorCount: 0,
    successRate: 83.0
  },
  {
    id: 'pythonjobs',
    name: 'Python.org Jobs',
    website: 'https://www.python.org',
    baseUrl: 'https://www.python.org/jobs',
    searchEndpoints: ['?q={query}&remote=1'],
    isActive: true,
    priority: 5,
    rateLimit: { requestsPerMinute: 10, delayBetweenRequests: 6000 },
    selectors: {
      jobList: '.list-recent-jobs li',
      jobTitle: 'h2 a',
      company: '.listing-company-name',
      location: '.listing-location',
      description: '.job-description',
      applicationUrl: 'h2 a'
    },
    searchTerms: ['python', 'django', 'flask'],
    maxPages: 2,
    country: ['GLOBAL'],
    tags: ['niche', 'language-specific'],
    errorCount: 0,
    successRate: 70.1
  },
  {
    id: 'justremote',
    name: 'JustRemote',
    website: 'https://justremote.co',
    baseUrl: 'https://justremote.co/remote-jobs',
    searchEndpoints: ['/search?q={query}'],
    isActive: true,
    priority: 6,
    rateLimit: { requestsPerMinute: 20, delayBetweenRequests: 3000 },
    selectors: {
      jobList: '.job-listing',
      jobTitle: '.job-title a',
      company: '.company-link',
      location: '.job-location',
      description: '.job-excerpt',
      applicationUrl: '.job-title a'
    },
    searchTerms: ['software', 'frontend', 'backend'],
    maxPages: 3,
    country: ['GLOBAL'],
    tags: ['remote-focused'],
    errorCount: 0,
    successRate: 84.6
  },
  {
    id: 'dailyremote',
    name: 'DailyRemote',
    website: 'https://dailyremote.com',
    baseUrl: 'https://dailyremote.com',
    searchEndpoints: ['/remote-jobs/{query}'],
    isActive: true,
    priority: 6,
    rateLimit: { requestsPerMinute: 20, delayBetweenRequests: 3000 },
    selectors: {
      jobList: '.job-card',
      jobTitle: '.job-title a',
      company: '.company',
      location: '.location',
      description: '.description',
      applicationUrl: '.job-title a'
    },
    searchTerms: ['developer', 'design', 'marketing'],
    maxPages: 4,
    country: ['GLOBAL'],
    tags: ['remote-only'],
    errorCount: 0,
    successRate: 79.2
  },
  {
    id: 'ziprecruiter-remote',
    name: 'ZipRecruiter – Remote',
    website: 'https://www.ziprecruiter.com',
    baseUrl: 'https://www.ziprecruiter.com/jobs/search',
    searchEndpoints: ['?search={query}&location=Remote'],
    isActive: false,
    priority: 6,
    rateLimit: { requestsPerMinute: 20, delayBetweenRequests: 3000 },
    selectors: {
      jobList: '.job_result',
      jobTitle: '.job_title a',
      company: '.company_name',
      location: '.location',
      description: '.job_snippet',
      applicationUrl: '.job_title a'
    },
    searchTerms: ['software', 'developer', 'remote'],
    maxPages: 4,
    country: ['US'],
    tags: ['high-volume'],
    errorCount: 0,
    successRate: 72.3,
    requiresOfficialApi: true
  },
  {
    id: 'monster-remote',
    name: 'Monster – Remote',
    website: 'https://www.monster.com',
    baseUrl: 'https://www.monster.com/jobs/search',
    searchEndpoints: ['?q={query}&where=Remote'],
    isActive: false,
    priority: 6,
    rateLimit: { requestsPerMinute: 20, delayBetweenRequests: 3000 },
    selectors: {
      jobList: '.job-cardstyle__JobCardComponent',
      jobTitle: '.job-title a',
      company: '.company-name',
      location: '.job-specs-location',
      description: '.job-description',
      applicationUrl: '.job-title a'
    },
    searchTerms: ['IT', 'technology', 'programming'],
    maxPages: 3,
    country: ['GLOBAL'],
    tags: ['traditional'],
    errorCount: 0,
    successRate: 75.0,
    requiresOfficialApi: true
  },
  // ——— Balkan & EU focused additions ———
  {
    id: 'helloworld-rs',
    name: 'HelloWorld.rs',
    website: 'https://www.helloworld.rs',
    baseUrl: 'https://www.helloworld.rs/oglasi',
    searchEndpoints: ['/pretraga?q={query}', '?remote=1'],
    isActive: true,
    priority: 9,
    rateLimit: { requestsPerMinute: 40, delayBetweenRequests: 1500 },
    selectors: {
      jobList: '.job-listing',
      jobTitle: '.job-title a',
      company: '.company',
      location: '.location',
      description: '.description',
      applicationUrl: '.job-title a',
      postedDate: '.date'
    },
    searchTerms: ['developer', 'programer', 'remote', 'IT'],
    maxPages: 6,
    country: ['RS'],
    tags: ['balkan', 'serbia', 'tech'],
    errorCount: 0,
    successRate: 90.0
  },
  {
    id: 'jobs-rs',
    name: 'Jobs.rs',
    website: 'https://www.jobs.rs',
    baseUrl: 'https://www.jobs.rs/posao',
    searchEndpoints: ['/pretraga?keywords={query}', '?remote=true'],
    isActive: true,
    priority: 9,
    rateLimit: { requestsPerMinute: 35, delayBetweenRequests: 1800 },
    selectors: {
      jobList: '.job-ad',
      jobTitle: '.job-title a',
      company: '.company-name',
      location: '.job-location',
      description: '.job-description',
      applicationUrl: '.job-title a',
      postedDate: '.date'
    },
    searchTerms: ['IT', 'developer', 'remote'],
    maxPages: 6,
    country: ['RS'],
    tags: ['balkan', 'serbia'],
    errorCount: 0,
    successRate: 88.0
  },
  {
    id: 'mojposao-hr',
    name: 'MojPosao.hr',
    website: 'https://www.mojposao.hr',
    baseUrl: 'https://www.mojposao.hr/pretraga',
    searchEndpoints: ['?keywords={query}', '?remote=true'],
    isActive: true,
    priority: 8,
    rateLimit: { requestsPerMinute: 25, delayBetweenRequests: 2400 },
    selectors: {
      jobList: '.job-ad',
      jobTitle: '.job-title a',
      company: '.employer-name',
      location: '.job-location',
      description: '.job-summary',
      applicationUrl: '.job-title a',
      postedDate: '.ad-date'
    },
    searchTerms: ['programer', 'developer', 'remote'],
    maxPages: 4,
    country: ['HR'],
    tags: ['balkan', 'croatia'],
    errorCount: 0,
    successRate: 84.0
  },
  {
    id: 'startit-rs',
    name: 'Startit.rs',
    website: 'https://startit.rs',
    baseUrl: 'https://startit.rs/posao',
    searchEndpoints: ['/pretraga?q={query}', '?remote=1'],
    isActive: true,
    priority: 8,
    rateLimit: { requestsPerMinute: 30, delayBetweenRequests: 2000 },
    selectors: {
      jobList: '.job-listing',
      jobTitle: '.job-title',
      company: '.company-name',
      location: '.job-location',
      description: '.job-description',
      applicationUrl: '.apply-button',
      postedDate: '.posted-date'
    },
    searchTerms: ['developer', 'IT', 'startup', 'remote'],
    maxPages: 3,
    country: ['RS'],
    tags: ['balkan', 'startup'],
    errorCount: 0,
    successRate: 85.0
  },
  {
    id: 'nofluffjobs',
    name: 'No Fluff Jobs – Remote',
    website: 'https://nofluffjobs.com',
    baseUrl: 'https://nofluffjobs.com',
    searchEndpoints: ['/pl/job-offer/feed?criteria=remote', '/remote'],
    isActive: true,
    priority: 8,
    rateLimit: { requestsPerMinute: 20, delayBetweenRequests: 3000 },
    selectors: {
      jobList: 'article[class*="posting"]',
      jobTitle: 'h3 a',
      company: '[class*="company"]',
      location: '[class*="location"]',
      description: '[class*="description"]',
      applicationUrl: 'h3 a'
    },
    searchTerms: ['frontend', 'backend', 'fullstack', 'remote'],
    maxPages: 5,
    country: ['EU'],
    tags: ['cee', 'tech'],
    errorCount: 0,
    successRate: 87.0
  },
  {
    id: 'justjoinit',
    name: 'JustJoin.IT – Remote',
    website: 'https://justjoin.it',
    baseUrl: 'https://justjoin.it',
    searchEndpoints: ['/all/remote', '/all?remote=true'],
    isActive: true,
    priority: 8,
    rateLimit: { requestsPerMinute: 20, delayBetweenRequests: 3000 },
    selectors: {
      jobList: 'a[href^="/offers/"]',
      jobTitle: 'h2, h3',
      company: '[data-test="job-offer-company-name"]',
      location: '[data-test="job-offer-locations"]',
      description: '[data-test="job-offer-description"]',
      applicationUrl: 'a[href^="/offers/"]'
    },
    searchTerms: ['javascript', 'java', 'python', 'remote'],
    maxPages: 5,
    country: ['EU'],
    tags: ['cee', 'tech'],
    errorCount: 0,
    successRate: 86.0
  },
  {
    id: 'remote-europe',
    name: 'Remote Europe',
    website: 'https://remote-europe.com',
    baseUrl: 'https://remote-europe.com/jobs',
    searchEndpoints: ['?search={query}'],
    isActive: true,
    priority: 7,
    rateLimit: { requestsPerMinute: 18, delayBetweenRequests: 3200 },
    selectors: {
      jobList: '.list-item',
      jobTitle: '.list-item h2 a',
      company: '.list-item .company',
      location: '.list-item .location',
      description: '.list-item .desc',
      applicationUrl: '.list-item h2 a'
    },
    searchTerms: ['developer', 'engineer', 'design'],
    maxPages: 4,
    country: ['EU'],
    tags: ['europe', 'remote'],
    errorCount: 0,
    successRate: 80.0
  },
  {
    id: 'eu-remote-jobs',
    name: 'EU Remote Jobs',
    website: 'https://euremotejobs.com',
    baseUrl: 'https://euremotejobs.com/jobs',
    searchEndpoints: ['?search_keywords={query}'],
    isActive: true,
    priority: 7,
    rateLimit: { requestsPerMinute: 18, delayBetweenRequests: 3200 },
    selectors: {
      jobList: 'ul.jobs li',
      jobTitle: 'h3 a',
      company: '.company',
      location: '.location',
      description: '.job-description',
      applicationUrl: 'h3 a'
    },
    searchTerms: ['software', 'remote', 'frontend', 'backend'],
    maxPages: 4,
    country: ['EU'],
    tags: ['europe', 'remote'],
    errorCount: 0,
    successRate: 78.0
  },
  {
    id: 'hubstaff-talent',
    name: 'Hubstaff Talent',
    website: 'https://talent.hubstaff.com',
    baseUrl: 'https://talent.hubstaff.com/search/jobs',
    searchEndpoints: ['?q={query}&remote=true'],
    isActive: true,
    priority: 6,
    rateLimit: { requestsPerMinute: 15, delayBetweenRequests: 3500 },
    selectors: {
      jobList: '.jobs-list .job',
      jobTitle: '.job-title a',
      company: '.company-name',
      location: '.job-location',
      description: '.job-description',
      applicationUrl: '.job-title a'
    },
    searchTerms: ['developer', 'designer', 'marketing'],
    maxPages: 3,
    country: ['GLOBAL'],
    tags: ['freelance', 'remote'],
    errorCount: 0,
    successRate: 76.0
  },
  {
    id: 'powertofly',
    name: 'PowerToFly',
    website: 'https://powertofly.com',
    baseUrl: 'https://powertofly.com/jobs',
    searchEndpoints: ['?query={query}&remote=true'],
    isActive: true,
    priority: 6,
    rateLimit: { requestsPerMinute: 12, delayBetweenRequests: 4000 },
    selectors: {
      jobList: '.jobs-list .job',
      jobTitle: '.job-title a',
      company: '.company',
      location: '.location',
      description: '.description',
      applicationUrl: '.job-title a'
    },
    searchTerms: ['developer', 'engineering', 'remote'],
    maxPages: 3,
    country: ['GLOBAL'],
    tags: ['diversity', 'remote'],
    errorCount: 0,
    successRate: 77.0
  },
  {
    id: 'remoteok',
    name: 'Remote OK',
    website: 'https://remoteok.com',
    baseUrl: 'https://remoteok.com',
    searchEndpoints: ['/remote-{query}-jobs'],
    isActive: true,
    priority: 8,
    rateLimit: { requestsPerMinute: 30, delayBetweenRequests: 2000 },
    selectors: {
      jobList: '.job',
      jobTitle: '.jobTitle',
      company: '.companyLink',
      location: '.location',
      description: '.jobDescription',
      applicationUrl: '.jobTitle'
    },
    searchTerms: ['developer', 'frontend', 'backend', 'fullstack'],
    maxPages: 6,
    country: ['GLOBAL'],
    tags: ['remote', 'tech'],
    errorCount: 0,
    successRate: 88.0
  },

  // Dodatni popularni remote job board sajtovi
  {
    id: 'remoteco-programming',
    name: 'Remote.co Programming',
    website: 'https://remote.co',
    baseUrl: 'https://remote.co/remote-jobs',
    searchEndpoints: ['/programming/', '/software-development/', '/web-development/'],
    isActive: true,
    priority: 8,
    rateLimit: { requestsPerMinute: 25, delayBetweenRequests: 2500 },
    selectors: {
      jobList: '.job_listing',
      jobTitle: '.job_listing-clickbox h4',
      company: '.job_listing-clickbox .company',
      location: '.job_listing-clickbox .location',
      description: '.job_description',
      applicationUrl: '.job_listing-clickbox a'
    },
    searchTerms: ['javascript', 'python', 'react', 'nodejs'],
    maxPages: 4,
    country: ['GLOBAL'],
    tags: ['remote', 'programming'],
    errorCount: 0,
    successRate: 89.0
  },

  {
    id: 'remote-io',
    name: 'Remote.io',
    website: 'https://remote.io',
    baseUrl: 'https://remote.io',
    searchEndpoints: ['/remote-jobs', '/remote-developer-jobs', '/remote-design-jobs'],
    isActive: true,
    priority: 7,
    rateLimit: { requestsPerMinute: 20, delayBetweenRequests: 3000 },
    selectors: {
      jobList: '.job-listing',
      jobTitle: '.job-title',
      company: '.company-name',
      location: '.job-location',
      description: '.job-description',
      applicationUrl: '.apply-link'
    },
    searchTerms: ['remote', 'developer', 'designer'],
    maxPages: 3,
    country: ['GLOBAL'],
    tags: ['remote', 'curated'],
    errorCount: 0,
    successRate: 82.0
  },

  {
    id: 'working-nomads',
    name: 'Working Nomads',
    website: 'https://www.workingnomads.co',
    baseUrl: 'https://www.workingnomads.co',
    searchEndpoints: ['/jobs', '/programming', '/design'],
    isActive: true,
    priority: 7,
    rateLimit: { requestsPerMinute: 15, delayBetweenRequests: 4000 },
    selectors: {
      jobList: '.job-list-item',
      jobTitle: '.job-title',
      company: '.company-name',
      location: '.location',
      description: '.job-description',
      applicationUrl: '.job-link'
    },
    searchTerms: ['programming', 'design', 'marketing'],
    maxPages: 3,
    country: ['GLOBAL'],
    tags: ['nomad', 'remote'],
    errorCount: 0,
    successRate: 80.0
  },

  {
    id: 'himalayas',
    name: 'Himalayas',
    website: 'https://himalayas.app',
    baseUrl: 'https://himalayas.app/jobs',
    searchEndpoints: ['?remote=true', '/engineering', '/design'],
    isActive: true,
    priority: 8,
    rateLimit: { requestsPerMinute: 25, delayBetweenRequests: 2400 },
    selectors: {
      jobList: 'a[href*="/jobs/"]',
      jobTitle: '.job-title',
      company: '.company-name',
      location: '.location',
      description: '.job-description',
      applicationUrl: 'a[href*="/jobs/"]'
    },
    searchTerms: ['engineering', 'design', 'product'],
    maxPages: 4,
    country: ['GLOBAL'],
    tags: ['remote', 'modern'],
    errorCount: 0,
    successRate: 86.0
  },

  {
    id: 'remotehub',
    name: 'RemoteHub',
    website: 'https://remotehub.io',
    baseUrl: 'https://remotehub.io',
    searchEndpoints: ['/remote-jobs', '/remote-developer-jobs'],
    isActive: true,
    priority: 7,
    rateLimit: { requestsPerMinute: 20, delayBetweenRequests: 3000 },
    selectors: {
      jobList: '.job-card',
      jobTitle: '.job-title',
      company: '.company',
      location: '.location',
      description: '.description',
      applicationUrl: '.apply-btn'
    },
    searchTerms: ['developer', 'remote', 'tech'],
    maxPages: 3,
    country: ['GLOBAL'],
    tags: ['remote', 'tech'],
    errorCount: 0,
    successRate: 79.0
  },

  {
    id: 'nodesk',
    name: 'NoDesk',
    website: 'https://nodesk.co',
    baseUrl: 'https://nodesk.co/remote-jobs',
    searchEndpoints: ['/', '/category/programming', '/category/design'],
    isActive: true,
    priority: 6,
    rateLimit: { requestsPerMinute: 15, delayBetweenRequests: 4000 },
    selectors: {
      jobList: '.job-listing',
      jobTitle: '.job-title',
      company: '.company-name',
      location: '.remote-location',
      description: '.job-summary',
      applicationUrl: '.apply-link'
    },
    searchTerms: ['programming', 'design', 'remote'],
    maxPages: 3,
    country: ['GLOBAL'],
    tags: ['remote', 'lifestyle'],
    errorCount: 0,
    successRate: 75.0
  },

  {
    id: 'remotive',
    name: 'Remotive',
    website: 'https://remotive.io',
    baseUrl: 'https://remotive.io/remote-jobs',
    searchEndpoints: ['/software-dev', '/design', '/marketing'],
    isActive: true,
    priority: 8,
    rateLimit: { requestsPerMinute: 20, delayBetweenRequests: 3000 },
    selectors: {
      jobList: '.job-tile',
      jobTitle: '.job-title',
      company: '.company-name',
      location: '.location',
      description: '.job-description',
      applicationUrl: '.apply-button'
    },
    searchTerms: ['software', 'design', 'marketing'],
    maxPages: 4,
    country: ['GLOBAL'],
    tags: ['remote', 'curated'],
    errorCount: 0,
    successRate: 88.0
  },

  {
    id: 'remote-year',
    name: 'Remote Year Jobs',
    website: 'https://remoteyear.com',
    baseUrl: 'https://remoteyear.com/jobs',
    searchEndpoints: ['?remote=true'],
    isActive: true,
    priority: 6,
    rateLimit: { requestsPerMinute: 12, delayBetweenRequests: 5000 },
    selectors: {
      jobList: '.job-listing',
      jobTitle: '.job-title',
      company: '.company',
      location: '.location',
      description: '.description',
      applicationUrl: '.apply-link'
    },
    searchTerms: ['remote', 'nomad'],
    maxPages: 2,
    country: ['GLOBAL'],
    tags: ['nomad', 'travel'],
    errorCount: 0,
    successRate: 72.0
  },

  {
    id: 'remoters-net',
    name: 'Remoters.net',
    website: 'https://remoters.net',
    baseUrl: 'https://remoters.net/jobs',
    searchEndpoints: ['/remote', '/programming', '/design'],
    isActive: true,
    priority: 7,
    rateLimit: { requestsPerMinute: 18, delayBetweenRequests: 3300 },
    selectors: {
      jobList: '.job-item',
      jobTitle: '.job-title',
      company: '.company-name',
      location: '.job-location',
      description: '.job-desc',
      applicationUrl: '.apply-btn'
    },
    searchTerms: ['programming', 'design', 'remote'],
    maxPages: 3,
    country: ['GLOBAL'],
    tags: ['remote', 'international'],
    errorCount: 0,
    successRate: 81.0
  }
];

// Kombinuj sve izvore
export const allScraperSources = [...scraperSources, ...additionalScraperSources];

// Helper funkcije
export function getActiveScraperSources(): ScraperSource[] {
  return allScraperSources.filter(source => source.isActive);
}

export function getScraperSourcesByCountry(countries: string[]): ScraperSource[] {
  return allScraperSources.filter(source => 
    countries.some(country => 
      source.country.includes(country) || source.country.includes('GLOBAL')
    )
  );
}

export function getScraperSourcesByPriority(minPriority: number = 7): ScraperSource[] {
  return allScraperSources
    .filter(source => source.isActive && source.priority >= minPriority)
    .sort((a, b) => b.priority - a.priority);
}
