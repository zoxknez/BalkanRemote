import { useState, useEffect, useCallback } from 'react';
import { JobPosting, JobCategory } from '@/types/jobs';

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

  const fetchJobs = useCallback(async (newFilters?: JobFilters) => {
    setLoading(true);
    setError(null);

    const currentFilters = newFilters || filters;
    
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

      const response = await fetch(`/api/jobs?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch jobs');
      }

      setJobs(data.data.jobs);
      setTotal(data.data.total);

    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      setJobs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters: Partial<JobFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchJobs(updatedFilters);
  }, [filters, fetchJobs]);

  const resetFilters = useCallback(() => {
    const emptyFilters = { limit: 20, offset: 0 };
    setFilters(emptyFilters);
    fetchJobs(emptyFilters);
  }, [fetchJobs]);

  const search = useCallback((keywords: string) => {
    updateFilters({ keywords, offset: 0 });
  }, [updateFilters]);

  const loadMore = useCallback(() => {
    if (!loading && jobs.length < total) {
      updateFilters({ offset: jobs.length });
    }
  }, [loading, jobs.length, total, updateFilters]);

  const refreshJobs = useCallback(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Initial load
  useEffect(() => {
    fetchJobs();
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
    hasMore: jobs.length < total
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
      console.error('Error fetching scraper stats:', err);
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
      console.error('Error triggering scraping:', err);
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
