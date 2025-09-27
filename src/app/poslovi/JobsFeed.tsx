'use client';

import { useMemo } from 'react';
import { RefreshCw, AlertCircle, Loader2, Filter, RotateCcw } from 'lucide-react';

import { useJobs } from '@/hooks/useJobs';
import { JobCard } from '@/components/job-card';
import { mockJobs } from '@/data/mock-data-new';
import type { Job } from '@/types';
import type { JobPosting, JobCategory } from '@/types/jobs';

const skeletonItems = Array.from({ length: 6 }, (_, index) => index);

const seniorityMap: Record<JobPosting['seniority'], Job['experienceLevel']> = {
  junior: 'entry',
  mid: 'mid',
  senior: 'senior',
  lead: 'lead',
  executive: 'lead',
};

function normalizeJob(posting: JobPosting): Job {
  const postedAt = new Date(posting.postedDate);
  const applicationDeadline = posting.applicationDeadline
    ? new Date(posting.applicationDeadline)
    : undefined;

  return {
    id: posting.id,
    title: posting.title,
    company: posting.company,
    location: posting.location,
    companyLogo: undefined,
    type: posting.contractType,
    category: posting.category,
    description: posting.description,
    requirements: posting.requirements,
    benefits: posting.benefits,
    salaryMin: posting.salary?.min,
    salaryMax: posting.salary?.max,
    currency: posting.salary?.currency?.toUpperCase() ?? 'USD',
    isRemote: posting.remote,
    experienceLevel: seniorityMap[posting.seniority] ?? 'mid',
    postedAt: Number.isNaN(postedAt.getTime()) ? new Date() : postedAt,
    deadline:
      applicationDeadline && !Number.isNaN(applicationDeadline.getTime())
        ? applicationDeadline
        : undefined,
    url: posting.applicationUrl || posting.sourceUrl,
    featured: posting.tags.includes('featured') || posting.remoteType === 'fully-remote',
    tags: posting.tags,
  };
}

function JobCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-gray-200" />
          <div>
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-24 rounded bg-gray-100" />
          </div>
        </div>
        <div className="h-3 w-20 rounded bg-gray-100" />
      </div>
      <div className="mt-4 flex gap-4">
        <div className="h-3 w-24 rounded bg-gray-100" />
        <div className="h-3 w-28 rounded bg-gray-100" />
        <div className="h-3 w-16 rounded bg-gray-100" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-full rounded bg-gray-100" />
        <div className="h-3 w-5/6 rounded bg-gray-100" />
        <div className="h-3 w-2/3 rounded bg-gray-100" />
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-gray-200" />
        <div className="h-9 w-24 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}

const contractOptions: JobPosting['contractType'][] = ['full-time', 'part-time', 'contract', 'freelance'];
const seniorityOptions: JobPosting['seniority'][] = ['junior', 'mid', 'senior', 'lead'];
const categoryOptions: { label: string; value: JobCategory }[] = [
  { label: 'Inženjering', value: 'software-engineering' },
  { label: 'Data/AI', value: 'data-science' },
  { label: 'Dizajn', value: 'design' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Prodaja', value: 'sales' },
  { label: 'Customer Support', value: 'customer-support' },
  { label: 'Proizvod/PM', value: 'management' },
  { label: 'HR & Talent', value: 'hr' },
  { label: 'Finansije', value: 'finance' },
  { label: 'Operacije', value: 'operations' },
  { label: 'Ostalo', value: 'other' },
];

export function JobsFeed() {
  const {
    jobs,
    loading,
    error,
    total,
    refreshJobs,
    loadMore,
    hasMore,
    filters,
    updateFilters,
    resetFilters,
    facets,
  } = useJobs({ limit: 12, offset: 0, remote: true });

  const normalizedJobs = useMemo(() => jobs.map(normalizeJob), [jobs]);

  const fallbackJobs = useMemo(() => {
    if (normalizedJobs.length > 0 || loading) {
      return [] as Job[];
    }

    return mockJobs.slice(0, 6);
  }, [normalizedJobs.length, loading]);

  const visibleJobs = normalizedJobs.length > 0 ? normalizedJobs : fallbackJobs;
  const visibleCount = visibleJobs.length;
  const totalCount = normalizedJobs.length > 0 ? total : visibleCount;
  const showFallbackNotice = !loading && normalizedJobs.length === 0;
  const showSkeletonOnly = loading && visibleJobs.length === 0;
  const selectedContracts = filters.contractType ?? [];
  const selectedSeniorities = filters.seniority ?? [];
  const selectedCategory = filters.category;
  const isRemoteOnly = filters.remote === true;
  const facetCounts = facets ?? null;
  const remoteCount = facetCounts
    ? (facetCounts.remoteType['fully-remote'] ?? 0) +
      (facetCounts.remoteType['flexible'] ?? 0) +
      (facetCounts.remoteType['hybrid'] ?? 0)
    : null;

  const toggleContract = (contract: Job['type']) => {
    const next = selectedContracts.includes(contract)
      ? selectedContracts.filter((value) => value !== contract)
      : [...selectedContracts, contract];
    updateFilters({ contractType: next.length > 0 ? next : undefined, offset: 0 });
  };

  const toggleSeniority = (seniority: JobPosting['seniority']) => {
    const next = selectedSeniorities.includes(seniority)
      ? selectedSeniorities.filter((value) => value !== seniority)
      : [...selectedSeniorities, seniority];
    updateFilters({ seniority: next.length > 0 ? next : undefined, offset: 0 });
  };

  const toggleCategory = (category: JobCategory) => {
    updateFilters({ category: selectedCategory === category ? undefined : category, offset: 0 });
  };

  const toggleRemote = () => {
    updateFilters({ remote: isRemoteOnly ? undefined : true, offset: 0 });
  };

  return (
    <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Sveže remote pozicije</h2>
          <p className="text-sm text-gray-600">
            Real-time feed sa novim oglasima. Trenutno prikazujemo{' '}
            <span className="font-semibold text-gray-900" data-testid="jobs-results-count">
              {totalCount}
            </span>{' '}
            rezultata.
          </p>
        </div>
        <button
          type="button"
          onClick={refreshJobs}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Osveži oglase
        </button>
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>Privremeni problem sa učitavanjem oglasa. Pokušaćemo opet sa demo setom.</p>
        </div>
      )}

      {showFallbackNotice && (
        <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50/60 p-3 text-sm text-indigo-900">
          Scraper još nije vratio aktivne oglase, pa prikazujemo odabrane primere iz demo baze. Očekujte automatsko ažuriranje čim stignu pravi podaci.
        </div>
      )}

      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
            <Filter className="h-3.5 w-3.5" />
            Filteri
          </span>
          <button
            type="button"
            onClick={toggleRemote}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              isRemoteOnly
                ? 'border-blue-200 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-700'
            }`}
            data-testid="jobs-filter-remote"
          >
            Remote only
            {remoteCount !== null && (
              <span className="ml-1 text-[11px] text-blue-600/80">({remoteCount})</span>
            )}
          </button>
          <button
            type="button"
            onClick={resetFilters}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 transition hover:border-rose-200 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Resetuj filtere
          </button>
        </div>

        <div className="flex flex-wrap gap-2" data-testid="jobs-filter-contract">
          {contractOptions.map((option) => {
            const isActive = selectedContracts.includes(option);
            const count = facetCounts ? facetCounts.contractType[option] : null;
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleContract(option)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  isActive
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-200 hover:text-emerald-700'
                }`}
              >
                {option === 'full-time' && 'Full-time'}
                {option === 'part-time' && 'Part-time'}
                {option === 'contract' && 'Contract'}
                {option === 'freelance' && 'Freelance'}
                {count !== null && (
                  <span className="ml-1 text-[11px] text-emerald-700/80">({count})</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2" data-testid="jobs-filter-seniority">
          {seniorityOptions.map((option) => {
            const isActive = selectedSeniorities.includes(option);
            const labelMap: Record<JobPosting['seniority'], string> = {
              junior: 'Junior',
              mid: 'Mid',
              senior: 'Senior',
              lead: 'Lead',
              executive: 'Executive',
            };
            const count = facetCounts ? facetCounts.seniority[option] : null;

            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleSeniority(option)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  isActive
                    ? 'border-purple-200 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-purple-200 hover:text-purple-700'
                }`}
              >
                {labelMap[option]}
                {count !== null && (
                  <span className="ml-1 text-[11px] text-purple-700/80">({count})</span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2" data-testid="jobs-filter-category">
          {categoryOptions.map(({ label, value }) => {
            const isActive = selectedCategory === value;
            const count = facetCounts ? facetCounts.category[value] : null;
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleCategory(value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  isActive
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-indigo-200 hover:text-indigo-700'
                }`}
              >
                {label}
                {count !== null && (
                  <span className="ml-1 text-[11px] text-indigo-700/80">({count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        {showSkeletonOnly
          ? skeletonItems.map((item) => <JobCardSkeleton key={item} />)
          : (
            <>
              {visibleJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
              {loading && visibleJobs.length > 0 &&
                skeletonItems.slice(0, 2).map((item) => <JobCardSkeleton key={`loader-${item}`} />)}
            </>
            )}
      </div>

      {!loading && visibleJobs.length === 0 && (
        <p className="mt-6 text-sm text-gray-500">Trenutno nema dostupnih oglasa. Probajte da osvežite za nekoliko minuta.</p>
      )}

      {normalizedJobs.length > 0 && hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
            data-testid="jobs-load-more"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Loader2 className="h-4 w-4" />}
            Učitaj još
          </button>
        </div>
      )}
    </section>
  );
}
