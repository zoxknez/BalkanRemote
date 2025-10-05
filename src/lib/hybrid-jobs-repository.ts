import { createClient } from '@supabase/supabase-js';
import { JobPosting } from '@/types/jobs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface HybridJob {
  id: string;
  title: string;
  description?: string;
  company_name: string;
  company_website?: string;
  location?: string;
  country_code?: string;
  region?: string;
  work_type: 'hybrid' | 'onsite' | 'flexible' | 'remote-optional';
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  experience_level?: string;
  employment_type?: string;
  category?: string;
  skills?: string[];
  technologies?: string[];
  application_url?: string;
  application_email?: string;
  external_id?: string;
  source_name: string;
  source_website?: string;
  scraped_at?: string;
  posted_date?: string;
  expires_at?: string;
  is_verified?: boolean;
  quality_score?: number;
  view_count?: number;
  bookmark_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface HybridJobFilters {
  country?: string;
  workType?: string;
  category?: string;
  search?: string;
  salaryMin?: number;
  location?: string;
  experienceLevel?: string;
  employmentType?: string;
  sourceName?: string;
}

export interface HybridJobStats {
  total: number;
  byWorkType: { [key: string]: number };
  byCountry: { [key: string]: number };
  byCategory: { [key: string]: number };
  averageQualityScore: number;
}

export class HybridJobsRepository {
  
  async getJobs(
    filters: HybridJobFilters = {},
    limit = 20,
    offset = 0,
    orderBy = 'posted_date',
    order: 'asc' | 'desc' = 'desc'
  ): Promise<{ jobs: HybridJob[]; total: number }> {
    let query = supabase
      .from('hybrid_jobs_public')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.country) {
      query = query.eq('country_code', filters.country.toUpperCase());
    }

    if (filters.workType) {
      query = query.eq('work_type', filters.workType);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
    }

    if (filters.salaryMin) {
      query = query.gte('salary_min', filters.salaryMin);
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters.experienceLevel) {
      query = query.eq('experience_level', filters.experienceLevel);
    }

    if (filters.employmentType) {
      query = query.eq('employment_type', filters.employmentType);
    }

    if (filters.sourceName) {
      query = query.eq('source_name', filters.sourceName);
    }

    // Apply ordering and pagination
    query = query
      .order(orderBy, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch hybrid jobs: ${error.message}`);
    }

    return {
      jobs: data || [],
      total: count || 0
    };
  }

  async getJobById(id: string): Promise<HybridJob | null> {
    const { data, error } = await supabase
      .from('hybrid_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Not found
        return null;
      }
      throw new Error(`Failed to fetch job: ${error.message}`);
    }

    // Increment view count
    await this.incrementViewCount(id);

    return data;
  }

  async createJob(job: Omit<HybridJob, 'id' | 'created_at' | 'updated_at'>): Promise<HybridJob> {
    const { data, error } = await supabase
      .from('hybrid_jobs')
      .insert([{
        ...job,
        quality_score: job.quality_score || 50,
        scraped_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }

    return data;
  }

  async createJobsFromScraper(jobs: JobPosting[], sourceName: string): Promise<{ created: number; skipped: number }> {
    const hybridJobs = jobs
      .filter(job => job.remoteType !== 'fully-remote')
      .map(job => this.convertJobPostingToHybridJob(job, sourceName));

    let created = 0;
    let skipped = 0;

    for (const job of hybridJobs) {
      try {
        // Check if job already exists
        const existing = await this.findByExternalId(job.external_id!, sourceName);
        
        if (existing) {
          skipped++;
          continue;
        }

        await this.createJob(job);
        created++;
      } catch (error) {
        console.error(`Failed to create job: ${error}`);
        skipped++;
      }
    }

    return { created, skipped };
  }

  private convertJobPostingToHybridJob(job: JobPosting, sourceName: string): Omit<HybridJob, 'id' | 'created_at' | 'updated_at'> {
    // Parse salary from salary object if available
    const salaryMin = job.salary?.min;
    const salaryMax = job.salary?.max;
    const salaryCurrency = job.salary?.currency || 'EUR';
    
    return {
      title: job.title,
      description: job.description,
      company_name: job.company,
      location: job.location,
      country_code: this.extractCountryCode(job.location),
      region: 'BALKAN',
      work_type: this.mapRemoteTypeToWorkType(job.remoteType),
      salary_min: salaryMin,
      salary_max: salaryMax,
      salary_currency: salaryCurrency,
      experience_level: job.seniority,
      employment_type: job.contractType,
      category: job.category,
      skills: job.skills,
      technologies: [], // JobPosting doesn't have technologies field
      application_url: job.applicationUrl,
      external_id: job.id,
      source_name: sourceName,
      posted_date: job.postedDate?.toISOString(),
      quality_score: this.calculateQualityScore(job)
    };
  }

  private parseSalary(salary?: string): { min?: number; max?: number; currency?: string } {
    if (!salary) return {};
    
    // Simple salary parsing - can be enhanced
    const numbers = salary.match(/\d+/g);
    const currency = salary.match(/[A-Z]{3}|€|$|£/)?.[0] || 'EUR';
    
    if (numbers && numbers.length >= 2) {
      return {
        min: parseInt(numbers[0]),
        max: parseInt(numbers[1]),
        currency: currency === '€' ? 'EUR' : currency
      };
    } else if (numbers && numbers.length === 1) {
      return {
        max: parseInt(numbers[0]),
        currency: currency === '€' ? 'EUR' : currency
      };
    }
    
    return { currency: currency === '€' ? 'EUR' : currency };
  }

  private mapRemoteTypeToWorkType(remoteType: string): 'hybrid' | 'onsite' | 'flexible' | 'remote-optional' {
    switch (remoteType) {
      case 'hybrid': return 'hybrid';
      case 'on-site': return 'onsite';
      case 'flexible': return 'flexible';
      default: return 'onsite';
    }
  }

  private extractCountryCode(location?: string): string | undefined {
    if (!location) return undefined;
    
    const countryMappings: { [key: string]: string } = {
      'serbia': 'RS',
      'srbija': 'RS',
      'beograd': 'RS',
      'novi sad': 'RS',
      'croatia': 'HR',
      'hrvatska': 'HR',
      'zagreb': 'HR',
      'split': 'HR',
      'bosnia': 'BA',
      'bosna': 'BA',
      'sarajevo': 'BA',
      'montenegro': 'ME',
      'crna gora': 'ME',
      'podgorica': 'ME',
      'slovenia': 'SI',
      'slovenija': 'SI',
      'ljubljana': 'SI'
    };

    const locationLower = location.toLowerCase();
    for (const [key, code] of Object.entries(countryMappings)) {
      if (locationLower.includes(key)) {
        return code;
      }
    }

    return undefined;
  }

  private calculateQualityScore(job: JobPosting): number {
    let score = 50; // Base score

    // Title quality
    if (job.title && job.title.length > 10) score += 10;
    
    // Description quality
    if (job.description && job.description.length > 100) score += 15;
    
    // Company information
    if (job.company && job.company.length > 3) score += 10;
    
    // Location specificity
    if (job.location) score += 10;
    
    // Salary information
    if (job.salary && (job.salary.min || job.salary.max)) score += 10;
    
    // Skills
    if (job.skills && job.skills.length > 0) score += 5;

    return Math.min(score, 100);
  }

  async findByExternalId(externalId: string, sourceName: string): Promise<HybridJob | null> {
    const { data, error } = await supabase
      .from('hybrid_jobs')
      .select('*')
      .eq('external_id', externalId)
      .eq('source_name', sourceName)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to find job: ${error.message}`);
    }

    return data;
  }

  async incrementViewCount(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_hybrid_job_views', { job_id: id });
    
    if (error) {
      console.error(`Failed to increment view count: ${error.message}`);
    }
  }

  async toggleBookmark(id: string, increment = true): Promise<void> {
    const { error } = await supabase.rpc('toggle_hybrid_job_bookmark', { 
      job_id: id, 
      increment 
    });
    
    if (error) {
      console.error(`Failed to toggle bookmark: ${error.message}`);
    }
  }

  async getStats(filters: HybridJobFilters = {}): Promise<HybridJobStats> {
    let query = supabase.from('hybrid_jobs').select('work_type, country_code, category, quality_score');

    // Apply same filters as getJobs for consistency
    if (filters.country) {
      query = query.eq('country_code', filters.country.toUpperCase());
    }
    if (filters.workType) {
      query = query.eq('work_type', filters.workType);
    }
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch stats: ${error.message}`);
    }

    const jobs = data || [];
    
    const byWorkType: { [key: string]: number } = {};
    const byCountry: { [key: string]: number } = {};
    const byCategory: { [key: string]: number } = {};
    let totalQualityScore = 0;

    jobs.forEach(job => {
      byWorkType[job.work_type] = (byWorkType[job.work_type] || 0) + 1;
      if (job.country_code) {
        byCountry[job.country_code] = (byCountry[job.country_code] || 0) + 1;
      }
      if (job.category) {
        byCategory[job.category] = (byCategory[job.category] || 0) + 1;
      }
      totalQualityScore += job.quality_score || 0;
    });

    return {
      total: jobs.length,
      byWorkType,
      byCountry,
      byCategory,
      averageQualityScore: jobs.length > 0 ? totalQualityScore / jobs.length : 0
    };
  }

  async deleteExpiredJobs(): Promise<number> {
    const { data, error } = await supabase
      .from('hybrid_jobs')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) {
      throw new Error(`Failed to delete expired jobs: ${error.message}`);
    }

    return data?.length || 0;
  }

  async getDistinctValues(column: 'country_code' | 'work_type' | 'category' | 'source_name'): Promise<string[]> {
    const { data, error } = await supabase
      .from('hybrid_jobs')
      .select(column)
      .not(column, 'is', null);

    if (error) {
      throw new Error(`Failed to get distinct values: ${error.message}`);
    }

    const uniqueValues = [...new Set(data?.map(item => {
      const record = item as Record<string, unknown>;
      return record[column];
    }).filter(Boolean) as string[])];
    return uniqueValues.sort();
  }
}

export const hybridJobsRepository = new HybridJobsRepository();