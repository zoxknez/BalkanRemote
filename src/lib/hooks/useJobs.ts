'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export type JobRow = {
  stable_key: string;
  source_id: string;
  source_name: string;
  title: string;
  company: string;
  location: string | null;
  posted_at: string;
  apply_url: string;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  salary_min_eur?: number | null;
  salary_max_eur?: number | null;
};

export type JobsResponse = {
  ok: boolean;
  page: number;
  pageSize: number;
  total: number;
  items: JobRow[];
};

export type JobsFilters = {
  q?: string;
  country?: string; // 'RS' | 'HR' | ...
  remote?: boolean; // true = only remote
  page?: number; // 1..N
  pageSize?: number; // 1..50 (API limit)
  sinceDays?: number; // 0..90
  // NEW: filters
  stack?: string[]; // e.g., ['react','node','python']
  level?: ('intern' | 'junior' | 'mid' | 'senior' | 'lead' | 'principal')[];
  sort?: 'posted_desc' | 'posted_asc' | 'salary_desc' | 'salary_eur_desc';
};

const toParams = (f: JobsFilters) => {
  const sp = new URLSearchParams();
  if (f.q) sp.set('q', f.q);
  if (f.country) sp.set('country', f.country.toUpperCase());
  if (f.remote) sp.set('remote', 'true');
  sp.set('page', String(f.page ?? 1));
  sp.set('pageSize', String(f.pageSize ?? 20));
  sp.set('sinceDays', String(f.sinceDays ?? 30));
  if (f.stack && f.stack.length) sp.set('stack', f.stack.join(','));
  if (f.level && f.level.length) sp.set('level', f.level.join(','));
  if (f.sort) sp.set('sort', f.sort);
  return sp.toString();
};

export function useJobs(initial: JobsFilters = {}) {
  const [filters, setFilters] = useState<JobsFilters>({
    q: '',
    country: '',
    remote: true,
    page: 1,
    pageSize: 20,
    sinceDays: 30,
    ...initial,
  });
  const [data, setData] = useState<JobsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const key = useMemo(() => `/api/jobs?${toParams(filters)}`, [filters]);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(key, { cache: 'no-store' });
      const json = (await res.json()) as JobsResponse;
      if (!json.ok) throw new Error('Request failed');
      setData(json);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load jobs';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    filters,
    setFilters,
    data,
    items: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? (filters.page ?? 1),
    pageSize: data?.pageSize ?? (filters.pageSize ?? 20),
    loading,
    error,
    refetch,
  };
}
