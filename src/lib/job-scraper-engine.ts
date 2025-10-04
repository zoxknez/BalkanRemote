import { JobPosting, ScraperSource, ScrapeJob, JobCategory, JobFacetCounts } from '@/types/jobs';

const CONTRACT_TYPES: JobPosting['contractType'][] = ['full-time', 'part-time', 'contract', 'freelance'];
const SENIORITY_LEVELS: JobPosting['seniority'][] = ['junior', 'mid', 'senior', 'lead', 'executive'];
const REMOTE_TYPES: JobPosting['remoteType'][] = ['fully-remote', 'hybrid', 'on-site', 'flexible'];
const JOB_CATEGORIES: JobCategory[] = [
  'software-engineering',
  'data-science',
  'design',
  'marketing',
  'sales',
  'customer-support',
  'hr-people',
  'finance',
  'operations',
  'management',
  'all',
];
import { allScraperSources } from '@/data/scraper-sources';
import crypto from 'crypto';
import { logger } from './logger';
import { upsertScrapedJobs } from './scraped-jobs-repository';

export class JobScraperEngine {
  private activeScrapeJobs: Map<string, ScrapeJob> = new Map();
  private scrapedJobs: JobPosting[] = [];
  private lastScrapeTime: Date = new Date();
  private schedulerEnabled: boolean;
  private scheduledInterval?: NodeJS.Timeout;
  private initialScheduleTimeout?: NodeJS.Timeout;

  constructor() {
    // Initialize scraper engine
    this.schedulerEnabled = this.determineSchedulerEnabled();
    if (this.schedulerEnabled) {
      this.setupScheduledScraping();
    } else {
      logger.info(
        'ℹ️ JobScraperEngine scheduled scraping disabled. Set SCRAPER_SCHEDULE_ENABLED=true to enable.'
      );
    }
  }

  /**
   * Main scraping method - scrapes all active sources
   */
  public async scrapeAllSources(): Promise<void> {
    logger.info('🚀 Starting scheduled scraping of all sources...');
    const activeSources = allScraperSources.filter(source => source.isActive);
    
    const scrapePromises = activeSources.map(source => 
      this.scrapeSource(source).catch(error => {
        logger.error(`❌ Failed to scrape ${source.name}:`, error);
        return null;
      })
    );

    await Promise.allSettled(scrapePromises);
    this.lastScrapeTime = new Date();
    logger.info('✅ Completed scraping all sources');
  }

  /**
   * Scrape a single source
   */
  public async scrapeSource(source: ScraperSource): Promise<ScrapeJob> {
    const scrapeJob: ScrapeJob = {
      id: crypto.randomUUID(),
      sourceId: source.id,
      status: 'running',
      startedAt: new Date(),
      jobsFound: 0,
      jobsInserted: 0,
      jobsUpdated: 0,
      duplicatesSkipped: 0,
      errors: [],
      retryCount: 0,
      maxRetries: 3
    };

    this.activeScrapeJobs.set(scrapeJob.id, scrapeJob);

    try {
      logger.info(`🔍 Scraping ${source.name}...`);
      
      const scrapedJobs = await this.performScraping(source);
      
      // Process and deduplicate jobs
      const processedJobs = this.processScrapedJobs(scrapedJobs, source);
      const { inserted, updated, duplicates } = await this.saveJobs(processedJobs);

      scrapeJob.jobsFound = scrapedJobs.length;
      scrapeJob.jobsInserted = inserted;
      scrapeJob.jobsUpdated = updated;
      scrapeJob.duplicatesSkipped = duplicates;
      scrapeJob.status = 'completed';
      scrapeJob.completedAt = new Date();

      // Update source stats
      source.lastScraped = new Date();
      source.lastSuccessfulScrape = new Date();
      source.errorCount = 0;
      source.successRate = this.calculateSuccessRate(source);

      logger.info(
        `✅ ${source.name}: Found ${scrapedJobs.length}, Inserted ${inserted}, Updated ${updated}, Skipped ${duplicates}`
      );

    } catch (error) {
      scrapeJob.status = 'failed';
      scrapeJob.errors.push({
        timestamp: new Date(),
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });

      source.errorCount++;
      source.successRate = this.calculateSuccessRate(source);

  logger.error(`❌ Failed to scrape ${source.name}:`, error);

      // Retry logic
      if (scrapeJob.retryCount < scrapeJob.maxRetries) {
        scrapeJob.retryCount++;
        scrapeJob.status = 'retrying';
        setTimeout(() => this.scrapeSource(source), 30000); // Retry after 30 seconds
      }
    }

    return scrapeJob;
  }

  /**
   * Actual scraping logic - this would use Puppeteer/Playwright in production
   */
  private async performScraping(source: ScraperSource): Promise<Partial<JobPosting>[]> {
    const jobs: Partial<JobPosting>[] = [];

    // Apply rate limiting
    await this.delay(source.rateLimit.delayBetweenRequests);

    try {
      // In production, this would use Puppeteer/Playwright
      // For now, we'll simulate scraping with mock data
      const mockJobs = await this.simulateScraping(source);
      jobs.push(...mockJobs);

    } catch (error) {
      throw new Error(`Failed to scrape ${source.name}: ${error}`);
    }

    return jobs;
  }

  /**
   * Simulate scraping - replace with actual Puppeteer/Playwright logic
   */
  private async simulateScraping(source: ScraperSource): Promise<Partial<JobPosting>[]> {
    // Mock data generator for testing
    const mockJobs: Partial<JobPosting>[] = [];
    const jobCount = Math.floor(Math.random() * 20) + 5; // 5-25 jobs per source

    for (let i = 0; i < jobCount; i++) {
      const mockJob: Partial<JobPosting> = {
        title: this.generateMockJobTitle(),
        company: this.generateMockCompany(source),
        location: this.generateMockLocation(source),
        description: this.generateMockDescription(),
        requirements: this.generateMockRequirements(),
        benefits: this.generateMockBenefits(),
        salary: this.generateMockSalary(),
        tags: this.generateMockTags(),
        seniority: this.generateMockSeniority(),
        contractType: this.generateMockContractType(),
        remote: Math.random() > 0.3, // 70% remote jobs
        remoteType: this.generateMockRemoteType(),
        applicationUrl: `${source.baseUrl}/job/${i}`,
        sourceUrl: `${source.baseUrl}/job/${i}`,
        sourceSite: source.name,
        postedDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Last 7 days
        category: this.generateMockCategory(),
        skills: this.generateMockSkills(),
        languages: ['English'],
        scrapedAt: new Date()
      };

      mockJobs.push(mockJob);
    }

    return mockJobs;
  }

  /**
   * Process scraped jobs and add metadata
   */
  private processScrapedJobs(scrapedJobs: Partial<JobPosting>[], source: ScraperSource): JobPosting[] {
    return scrapedJobs.map(job => {
      const processedJob: JobPosting = {
        id: crypto.randomUUID(),
        title: job.title || 'Untitled Position',
        company: job.company || 'Unknown Company',
        location: job.location || 'Remote',
        salary: job.salary,
        description: job.description || '',
        requirements: job.requirements || [],
        benefits: job.benefits || [],
        tags: [...(job.tags || []), ...source.tags],
        seniority: job.seniority || 'mid',
        contractType: job.contractType || 'full-time',
        remote: job.remote ?? true,
        remoteType: job.remoteType || 'fully-remote',
        postedDate: job.postedDate || new Date(),
        applicationUrl: job.applicationUrl || source.baseUrl,
        sourceUrl: job.sourceUrl || source.baseUrl,
        sourceSite: source.name,
        isActive: true,
        applicationDeadline: job.applicationDeadline,
        category: job.category || 'other',
        skills: job.skills || [],
        languages: job.languages || ['English'],
        experience: job.experience,
        education: job.education,
        scrapedAt: new Date(),
        lastUpdated: new Date(),
        fingerprint: this.generateFingerprint(job, source)
      };

      return processedJob;
    });
  }

  /**
   * Generate unique fingerprint for duplicate detection
   */
  private generateFingerprint(job: Partial<JobPosting>, source: ScraperSource): string {
    const content = `${job.title}-${job.company}-${source.id}`.toLowerCase().replace(/\s+/g, '');
    return crypto.createHash('md5').update(content).digest('hex');
  }

  /**
   * Save jobs to storage and handle duplicates
   */
  private async saveJobs(jobs: JobPosting[]): Promise<{ inserted: number; updated: number; duplicates: number }> {
    let inserted = 0;
    let updated = 0;
    let duplicates = 0;

    for (const job of jobs) {
      const existingJobIndex = this.scrapedJobs.findIndex(existing => 
        existing.fingerprint === job.fingerprint
      );

      if (existingJobIndex !== -1) {
        // Update existing job
        const existingJob = this.scrapedJobs[existingJobIndex];
        if (this.jobHasChanged(existingJob, job)) {
          this.scrapedJobs[existingJobIndex] = { ...job, id: existingJob.id };
          updated++;
        } else {
          duplicates++;
        }
      } else {
        // Insert new job
        this.scrapedJobs.push(job);
        inserted++;
      }
    }

    // Persist to Supabase if envs are present
    try {
      const hasSupabase = Boolean((process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) && process.env.SUPABASE_SERVICE_ROLE_KEY)
      if (hasSupabase && jobs.length) {
        const rows = jobs.map(j => ({
          source_id: j.sourceSite,
          source_name: j.sourceSite,
          external_id: j.fingerprint,
          title: j.title,
          company: j.company,
          location: j.location,
          type: j.contractType,
          category: j.category,
          description: j.description,
          requirements: j.requirements,
          benefits: j.benefits,
          salary_min: j.salary?.min ?? null,
          salary_max: j.salary?.max ?? null,
          currency: j.salary?.currency ?? null,
          is_remote: !!j.remote,
          remote_type: j.remoteType,
          experience_level: j.seniority,
          posted_at: j.postedDate.toISOString(),
          deadline: j.applicationDeadline ? j.applicationDeadline.toISOString() : null,
          url: j.applicationUrl,
          source_url: j.sourceUrl,
          featured: false,
          tags: j.tags,
          metadata: { skills: j.skills, languages: j.languages },
        }))
        await upsertScrapedJobs(rows)
      }
    } catch (e) {
      logger.warn('Persist scraped jobs failed (non-fatal):', e)
    }

    return { inserted, updated, duplicates };
  }

  /**
   * Check if job has meaningful changes
   */
  private jobHasChanged(existing: JobPosting, updated: JobPosting): boolean {
    return existing.title !== updated.title ||
           existing.description !== updated.description ||
           existing.salary?.min !== updated.salary?.min ||
           existing.salary?.max !== updated.salary?.max;
  }

  /**
   * Setup scheduled scraping
   */
  private determineSchedulerEnabled(): boolean {
    if (process.env.SCRAPER_SCHEDULE_ENABLED) {
      return process.env.SCRAPER_SCHEDULE_ENABLED === 'true';
    }

    return process.env.NODE_ENV === 'production';
  }

  private buildFacetCounts(jobs: JobPosting[]): JobFacetCounts {
    const facets: JobFacetCounts = {
      contractType: CONTRACT_TYPES.reduce((acc, type) => {
        acc[type] = 0;
        return acc;
      }, {} as Record<JobPosting['contractType'], number>),
      seniority: SENIORITY_LEVELS.reduce((acc, level) => {
        acc[level] = 0;
        return acc;
      }, {} as Record<JobPosting['seniority'], number>),
      category: JOB_CATEGORIES.reduce((acc, category) => {
        acc[category] = 0;
        return acc;
      }, {} as Record<JobCategory, number>),
      remoteType: REMOTE_TYPES.reduce((acc, type) => {
        acc[type] = 0;
        return acc;
      }, {} as Record<JobPosting['remoteType'], number>),
    };

    for (const job of jobs) {
      facets.contractType[job.contractType] = (facets.contractType[job.contractType] ?? 0) + 1;
      facets.seniority[job.seniority] = (facets.seniority[job.seniority] ?? 0) + 1;
      facets.category[job.category] = (facets.category[job.category] ?? 0) + 1;
      facets.remoteType[job.remoteType] = (facets.remoteType[job.remoteType] ?? 0) + 1;
    }

    return facets;
  }

  private setupScheduledScraping(): void {
    if (!this.schedulerEnabled) {
      return;
    }

    if (!this.scheduledInterval) {
      this.scheduledInterval = setInterval(() => {
  this.scrapeAllSources().catch(error => logger.error(error));
      }, 12 * 60 * 60 * 1000);
    }

    if (!this.initialScheduleTimeout) {
      this.initialScheduleTimeout = setTimeout(() => {
  this.scrapeAllSources().catch(error => logger.error(error));
      }, 30000);
    }
  }

  public enableScheduledScraping(): void {
    if (this.schedulerEnabled) {
      return;
    }

    this.schedulerEnabled = true;
    this.setupScheduledScraping();
  }

  public disableScheduledScraping(): void {
    this.schedulerEnabled = false;

    if (this.scheduledInterval) {
      clearInterval(this.scheduledInterval);
      this.scheduledInterval = undefined;
    }

    if (this.initialScheduleTimeout) {
      clearTimeout(this.initialScheduleTimeout);
      this.initialScheduleTimeout = undefined;
    }
  }

  /**
   * Get scraped jobs with filtering
   */
  public getJobs(filters?: {
    limit?: number;
    offset?: number;
    keywords?: string;
    category?: JobCategory;
    remote?: boolean;
    location?: string;
    minSalary?: number;
    maxSalary?: number;
    seniority?: string[];
    contractType?: string[];
    sourceSite?: string[];
  }): { jobs: JobPosting[]; total: number; facets: JobFacetCounts } {
    let filteredJobs = [...this.scrapedJobs];

    // Apply filters
    if (filters?.keywords) {
      const keywords = filters.keywords.toLowerCase();
      filteredJobs = filteredJobs.filter(job =>
        job.title.toLowerCase().includes(keywords) ||
        job.description.toLowerCase().includes(keywords) ||
        job.skills.some(skill => skill.toLowerCase().includes(keywords)) ||
        job.company.toLowerCase().includes(keywords)
      );
    }

    if (filters?.category) {
      filteredJobs = filteredJobs.filter(job => job.category === filters.category);
    }

    if (filters?.remote !== undefined) {
      filteredJobs = filteredJobs.filter(job => job.remote === filters.remote);
    }

    if (filters?.location) {
      filteredJobs = filteredJobs.filter(job =>
        job.location.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters?.minSalary) {
      filteredJobs = filteredJobs.filter(job =>
        job.salary?.min && job.salary.min >= filters.minSalary!
      );
    }

    if (filters?.maxSalary) {
      filteredJobs = filteredJobs.filter(job =>
        job.salary?.max && job.salary.max <= filters.maxSalary!
      );
    }

    if (filters?.seniority && filters.seniority.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        filters.seniority!.includes(job.seniority)
      );
    }

    if (filters?.contractType && filters.contractType.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        filters.contractType!.includes(job.contractType)
      );
    }

    if (filters?.sourceSite && filters.sourceSite.length > 0) {
      filteredJobs = filteredJobs.filter(job => 
        filters.sourceSite!.includes(job.sourceSite)
      );
    }

    // Sort by posted date (newest first)
    filteredJobs.sort((a, b) => b.postedDate.getTime() - a.postedDate.getTime());

    const total = filteredJobs.length;
    const facets = this.buildFacetCounts(filteredJobs);
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 20;

    return {
      jobs: filteredJobs.slice(offset, offset + limit),
      total,
      facets
    };
  }

  /**
   * Get scraper statistics
   */
  public getStats(): {
    totalJobs: number;
    jobsToday: number;
    jobsThisWeek: number;
    activeSources: number;
    lastScrapeTime: Date;
    topSources: { name: string; jobCount: number }[];
    topCompanies: { name: string; jobCount: number }[];
    categoryBreakdown: { category: string; count: number }[];
  } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const jobsToday = this.scrapedJobs.filter(job => job.scrapedAt >= today).length;
    const jobsThisWeek = this.scrapedJobs.filter(job => job.scrapedAt >= weekAgo).length;

    // Calculate top sources
    const sourceStats = new Map<string, number>();
    this.scrapedJobs.forEach(job => {
      const count = sourceStats.get(job.sourceSite) || 0;
      sourceStats.set(job.sourceSite, count + 1);
    });

    const topSources = Array.from(sourceStats.entries())
      .map(([name, jobCount]) => ({ name, jobCount }))
      .sort((a, b) => b.jobCount - a.jobCount)
      .slice(0, 10);

    // Calculate top companies
    const companyStats = new Map<string, number>();
    this.scrapedJobs.forEach(job => {
      const count = companyStats.get(job.company) || 0;
      companyStats.set(job.company, count + 1);
    });

    const topCompanies = Array.from(companyStats.entries())
      .map(([name, jobCount]) => ({ name, jobCount }))
      .sort((a, b) => b.jobCount - a.jobCount)
      .slice(0, 10);

    // Category breakdown
    const categoryStats = new Map<string, number>();
    this.scrapedJobs.forEach(job => {
      const count = categoryStats.get(job.category) || 0;
      categoryStats.set(job.category, count + 1);
    });

    const categoryBreakdown = Array.from(categoryStats.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalJobs: this.scrapedJobs.length,
      jobsToday,
      jobsThisWeek,
      activeSources: allScraperSources.filter(s => s.isActive).length,
      lastScrapeTime: this.lastScrapeTime,
      topSources,
      topCompanies,
      categoryBreakdown
    };
  }

  // Mock data generators
  private generateMockJobTitle(): string {
    const titles = [
      'Senior Full Stack Developer', 'React Frontend Developer', 'Python Backend Engineer',
      'UI/UX Designer', 'Product Manager', 'DevOps Engineer', 'Data Scientist',
      'Marketing Manager', 'Sales Development Representative', 'Customer Success Manager',
      'Technical Writer', 'QA Engineer', 'Blockchain Developer', 'Mobile App Developer',
      'AI/ML Engineer', 'Cybersecurity Specialist', 'Cloud Architect', 'Scrum Master',
      'Business Analyst', 'Project Manager', 'Content Manager', 'Social Media Manager'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  private generateMockCompany(source: ScraperSource): string {
    const globalCompanies = [
      'TechCorp Global', 'InnovateLab', 'DataDriven Inc', 'CloudFirst', 'StartupXYZ',
      'DigitalAgency', 'RemoteTeam Co', 'ScaleUp Ltd', 'FutureTech', 'AgileDev',
      'SoftwareHouse', 'DevStudio', 'TechVision', 'CodeCraft', 'ByteWorks'
    ];

    const balkanCompanies = [
      'Nordeus', 'Vega IT', 'Symphony', 'Levi9', 'Execom', 'Axilis',
      'Asseco SEE', 'Infobip', 'Rimac Technology', 'Include', 'Orion Innovation',
      'Crnogorski Telekom', 'M:tel', 'Comtrade', 'Saga Technology'
    ];

    const companies = source.country.includes('RS') || source.country.includes('HR') || source.country.includes('BA')
      ? [...balkanCompanies, ...globalCompanies.slice(0, 5)]
      : globalCompanies;

    return companies[Math.floor(Math.random() * companies.length)];
  }

  private generateMockLocation(source: ScraperSource): string {
    if (source.country.includes('RS')) return Math.random() > 0.5 ? 'Belgrade, Serbia (Remote)' : 'Novi Sad, Serbia (Remote)';
    if (source.country.includes('HR')) return Math.random() > 0.5 ? 'Zagreb, Croatia (Remote)' : 'Split, Croatia (Remote)';
    if (source.country.includes('BA')) return 'Sarajevo, Bosnia (Remote)';
    if (source.country.includes('DE')) return 'Berlin, Germany (Remote)';
    if (source.country.includes('CH')) return 'Zurich, Switzerland (Remote)';
    return 'Remote (Worldwide)';
  }

  private generateMockDescription(): string {
    const descriptions = [
      'Join our dynamic team and work on cutting-edge projects using the latest technologies. We offer a collaborative environment with opportunities for growth.',
      'We are seeking a passionate professional to contribute to our innovative products. Work remotely with a talented international team.',
      'Exciting opportunity to work with modern tech stack and make a real impact. We value work-life balance and offer competitive benefits.',
      'Be part of our mission to transform the industry with technology. We offer flexible work arrangements and professional development opportunities.'
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private generateMockRequirements(): string[] {
    const allRequirements = [
      '3+ years of professional experience',
      'Strong problem-solving skills',
      'Experience with modern frameworks',
      'Excellent English communication',
      'Bachelor\'s degree preferred',
      'Experience with cloud platforms',
      'Knowledge of database systems',
      'Agile/Scrum methodology experience',
      'Version control (Git) proficiency',
      'Strong analytical skills'
    ];
    return allRequirements.slice(0, Math.floor(Math.random() * 4) + 3);
  }

  private generateMockBenefits(): string[] {
    const allBenefits = [
      'Competitive salary', 'Health insurance', 'Remote work', 'Flexible hours',
      'Professional development budget', 'Annual company retreat', 'Stock options',
      '25 vacation days', 'Modern equipment', 'Gym membership', 'Team building events',
      'Conference attendance', 'Learning stipend', 'Mental health support'
    ];
    return allBenefits.slice(0, Math.floor(Math.random() * 5) + 3);
  }

  private generateMockSalary() {
    if (Math.random() > 0.4) return undefined; // 60% of jobs have salary info
    
    const ranges = [
      { min: 40000, max: 60000 }, // Junior
      { min: 60000, max: 90000 }, // Mid
      { min: 90000, max: 130000 }, // Senior
      { min: 120000, max: 180000 } // Lead
    ];
    
    const range = ranges[Math.floor(Math.random() * ranges.length)];
    
    return {
      min: range.min,
      max: range.max,
      currency: 'EUR',
      period: 'year' as const
    };
  }

  private generateMockTags(): string[] {
    const allTags = ['remote', 'javascript', 'react', 'python', 'aws', 'docker', 'agile', 'typescript', 'nodejs', 'kubernetes'];
    return allTags.slice(0, Math.floor(Math.random() * 6) + 3);
  }

  private generateMockSeniority(): JobPosting['seniority'] {
    const levels = ['junior', 'mid', 'senior', 'lead', 'executive'];
    const weights = [0.15, 0.35, 0.35, 0.12, 0.03]; // Distribution weights
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random <= sum) {
        return levels[i] as JobPosting['seniority'];
      }
    }
    
    return 'mid';
  }

  private generateMockContractType(): JobPosting['contractType'] {
    const types = ['full-time', 'part-time', 'contract', 'freelance'];
    const weights = [0.7, 0.1, 0.15, 0.05]; // Most are full-time
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random <= sum) {
        return types[i] as JobPosting['contractType'];
      }
    }
    
    return 'full-time';
  }

  private generateMockRemoteType(): JobPosting['remoteType'] {
    const types = ['fully-remote', 'hybrid', 'on-site', 'flexible'];
    const weights = [0.6, 0.25, 0.05, 0.1]; // Most are fully remote
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random <= sum) {
        return types[i] as JobPosting['remoteType'];
      }
    }
    
    return 'fully-remote';
  }

  private generateMockCategory(): JobCategory {
    const categories = [
      'software-engineering', 'data-science', 'design', 'marketing', 'sales',
      'customer-support', 'hr', 'finance', 'operations', 'management', 'other'
    ];
    const weights = [0.4, 0.15, 0.12, 0.1, 0.08, 0.05, 0.03, 0.03, 0.02, 0.01, 0.01];
    const random = Math.random();
    let sum = 0;
    
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (random <= sum) {
        return categories[i] as JobCategory;
      }
    }
    
    return 'software-engineering';
  }

  private generateMockSkills(): string[] {
    const techSkills = [
      'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js', 'Python',
      'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Flutter',
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'MongoDB', 'PostgreSQL',
      'MySQL', 'Redis', 'Git', 'Jenkins', 'Terraform', 'Ansible'
    ];
    
    const softSkills = [
      'Communication', 'Problem Solving', 'Team Collaboration', 'Leadership',
      'Time Management', 'Adaptability', 'Critical Thinking', 'Creativity'
    ];
    
    const selectedTech = techSkills.slice(0, Math.floor(Math.random() * 8) + 3);
    const selectedSoft = softSkills.slice(0, Math.floor(Math.random() * 3) + 1);
    
    return [...selectedTech, ...selectedSoft];
  }

  private calculateSuccessRate(source: ScraperSource): number {
    // Simplified success rate calculation based on error count
    const totalAttempts = Math.max(1, (source.lastScraped ? 1 : 0) + source.errorCount);
    const successfulAttempts = Math.max(0, totalAttempts - source.errorCount);
    return (successfulAttempts / totalAttempts) * 100;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Public API methods
   */
  public async manualScrapeSource(sourceId: string): Promise<ScrapeJob | null> {
    const source = allScraperSources.find(s => s.id === sourceId);
    if (!source) {
  logger.error(`Source ${sourceId} not found`);
      return null;
    }
    
    return await this.scrapeSource(source);
  }

  public getActiveScrapeJobs(): ScrapeJob[] {
    return Array.from(this.activeScrapeJobs.values());
  }

  public isScheduledScrapingEnabled(): boolean {
    return this.schedulerEnabled;
  }

  public getSources(): ScraperSource[] {
    return allScraperSources;
  }

  public getSourceById(id: string): ScraperSource | undefined {
    return allScraperSources.find(s => s.id === id);
  }
}

declare global {
  var __jobScraperEngine: JobScraperEngine | undefined;
}

const jobScraperEngine = globalThis.__jobScraperEngine ?? new JobScraperEngine();

globalThis.__jobScraperEngine = jobScraperEngine;

export { jobScraperEngine };
