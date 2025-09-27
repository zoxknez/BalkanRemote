import { useState, useEffect, useCallback, useRef } from 'react';
import { JobPosting, JobCategory, JobFacetCounts } from '@/types/jobs';
import { logger } from '@/lib/logger';

export interface JobFilters {
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
}

export interface ScraperStats {
  totalJobs: number;
  jobsToday: number;
  jobsThisWeek: number;
  activeSources: number;
  lastScrapeTime: Date;
  topSources: { name: string; jobCount: number }[];
  topCompanies: { name: string; jobCount: number }[];
  categoryBreakdown: { category: string; count: number }[];
}

export const useJobs = (initialFilters: JobFilters = {}) => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobFilters>(initialFilters);
  const [facets, setFacets] = useState<JobFacetCounts | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialFiltersRef = useRef(initialFilters);

  const fetchJobs = useCallback(async (newFilters?: JobFilters, { append } = { append: false }) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    const currentFilters = newFilters || filters;
    const shouldAppend = append || ((currentFilters.offset ?? 0) > 0);
    
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v.toString()));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });

      const query = searchParams.toString();
      const url = query ? `/api/jobs?${query}` : '/api/jobs';

      const response = await fetch(url, { signal: controller.signal });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch jobs');
      }

      if (shouldAppend) {
        setJobs((prev) => {
          const existingIds = new Set(prev.map((job) => job.id));
          const incoming = (data.data.jobs as JobPosting[]).filter((job) => !existingIds.has(job.id));
          return [...prev, ...incoming];
        });
      } else {
        setJobs(data.data.jobs);
      }
      setTotal(data.data.total);
      setFacets(data.data.facets ?? null);

    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') {
        return;
      }
      logger.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      setJobs([]);
      setTotal(0);
      setFacets(null);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters: Partial<JobFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    const shouldAppend = (newFilters.offset ?? 0) > 0;
    fetchJobs(updatedFilters, { append: shouldAppend });
  }, [filters, fetchJobs]);

  const resetFilters = useCallback(() => {
    const baseFilters: JobFilters = {
      ...initialFiltersRef.current,
      offset: 0,
    };
    setFilters(baseFilters);
    fetchJobs(baseFilters);
  }, [fetchJobs]);

  const search = useCallback((keywords: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      updateFilters({ keywords, offset: 0 });
    }, 300);
  }, [updateFilters]);

  const loadMore = useCallback(() => {
    if (!loading && jobs.length < total) {
      updateFilters({ offset: jobs.length });
    }
  }, [loading, jobs.length, total, updateFilters]);

  const refreshJobs = useCallback(() => {
    const baseFilters = { ...filters, offset: 0 };
    setFilters(baseFilters);
    fetchJobs(baseFilters);
  }, [fetchJobs, filters]);

  // Initial load
  useEffect(() => {
    fetchJobs();
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [fetchJobs]);

  return {
    jobs,
    total,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    search,
    loadMore,
    refreshJobs,
    hasMore: jobs.length < total,
    facets
  };
};

export const useScraperStats = () => {
  const [stats, setStats] = useState<ScraperStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scraper/stats');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch stats');
      }

      // Convert date string back to Date object
      const statsData = {
        ...data.data,
        lastScrapeTime: new Date(data.data.lastScrapeTime)
      };

      setStats(statsData);

    } catch (err) {
      logger.error('Error fetching scraper stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerScraping = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scraper/stats', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to start scraping');
      }

      // Refresh stats after a delay to show updated numbers
      setTimeout(() => {
        fetchStats();
      }, 2000);

    } catch (err) {
      logger.error('Error triggering scraping:', err);
      setError(err instanceof Error ? err.message : 'Failed to start scraping');
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
    
    // Auto refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats,
    triggerScraping
  };
};
