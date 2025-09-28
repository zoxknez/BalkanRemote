"use client";

import { useJobs } from '@/lib/hooks/useJobs';
import type { JobRow } from '@/lib/hooks/useJobs';
import { useEffect, useMemo, useState } from 'react';

const COUNTRIES = ['', 'RS', 'HR', 'BA', 'SI', 'ME', 'MK', 'AL', 'RO', 'BG', 'HU', 'PL', 'DE', 'AT', 'CH', 'IT'];
const LEVELS = ['intern','junior','mid','senior','lead','principal'] as const;
type SortKey = 'posted_desc'|'posted_asc'|'salary_desc'|'salary_eur_desc';

export default function OfficialJobsPage() {
  const {
    filters, setFilters, items, total, page, pageSize, loading, error, refetch,
  } = useJobs({ remote: true, sinceDays: 30, pageSize: 20 });

  const [sort, setSort] = useState<SortKey>('posted_desc');

  // Local state to support fetching and showing all pages
  const [allItems, setAllItems] = useState<JobRow[] | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);

  // Simple keys to satisfy exhaustive-deps without complex expressions
  const stackKey = useMemo(() => (filters.stack ?? []).join(','), [filters.stack]);
  const levelKey = useMemo(() => (filters.level ?? []).join(','), [filters.level]);

  const canPrev = !allItems && page > 1 && !loading;
  const canNext = !allItems && !loading && page * pageSize < total;

  const csvHref = useMemo(() => {
    const p = new URLSearchParams({
      page: String(allItems ? 1 : page),
      pageSize: String(allItems ? Math.min(Math.max(total, 50), 1000) : pageSize),
      sinceDays: String(filters.sinceDays ?? 30),
    });
    if (filters.q) p.set('q', filters.q);
    if (filters.country) p.set('country', filters.country);
    if (filters.remote) p.set('remote', 'true');
    if (filters.stack?.length) p.set('stack', filters.stack.join(','));
    if (filters.level?.length) p.set('level', filters.level.join(','));
    if (sort) p.set('sort', sort);
    return `/api/jobs/export?${p.toString()}`;
  }, [filters, sort, page, pageSize, allItems, total]);

  // Reset aggregated results if filters or sorting change
  useEffect(() => {
    setAllItems(null);
  }, [filters.q, filters.country, filters.remote, filters.sinceDays, sort, stackKey, levelKey]);

  async function loadAllJobs() {
    try {
      setLoadingAll(true);
      setAllItems(null);
      const acc: JobRow[] = [];
      const pageSizeAll = 50; // API max
      let currentPage = 1;
      let totalCount = 0;
      // Helper to build params based on current filters/sort
      const buildParams = (p: number) => {
        const sp = new URLSearchParams();
        if (filters.q) sp.set('q', filters.q);
        if (filters.country) sp.set('country', (filters.country || '').toUpperCase());
        if (filters.remote) sp.set('remote', 'true');
        sp.set('page', String(p));
        sp.set('pageSize', String(pageSizeAll));
        sp.set('sinceDays', String(filters.sinceDays ?? 30));
        if (filters.stack?.length) sp.set('stack', filters.stack.join(','));
        if (filters.level?.length) sp.set('level', filters.level.join(','));
        if (sort) sp.set('sort', sort);
        return sp.toString();
      };
      // First page to determine total
      {
        const res = await fetch(`/api/jobs?${buildParams(currentPage)}`, { cache: 'no-store' });
        const json = await res.json();
        if (!json?.ok) throw new Error(json?.error || 'Neuspešan upit');
        acc.push(...(json.items as JobRow[]));
        totalCount = Number(json.total || 0);
      }
      const pages = Math.ceil(totalCount / pageSizeAll);
      for (currentPage = 2; currentPage <= pages; currentPage++) {
        const res = await fetch(`/api/jobs?${buildParams(currentPage)}`, { cache: 'no-store' });
        const json = await res.json();
        if (!json?.ok) throw new Error(json?.error || `Greška pri učitavanju stranice ${currentPage}`);
        acc.push(...(json.items as JobRow[]));
      }
      setAllItems(acc);
    } catch (e) {
      console.error('Load all failed:', e);
      alert('Greška pri učitavanju svih oglasa. Pokušaj ponovo.');
    } finally {
      setLoadingAll(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2">Remote poslovi (Official feeds)</h1>
      <p className="text-sm text-gray-500 mb-6">
        Izvor: Remotive, RemoteOK, We Work Remotely (RSS/JSON). Dedup i normalizacija preko Supabase-a.
      </p>

  <div className="flex flex-wrap items-center gap-3 mb-6">
        <input
          className="border rounded px-3 py-2 min-w-[220px]"
          placeholder="Pretraga (npr. React, Python)"
          value={filters.q ?? ''}
          onChange={(e) => setFilters(f => ({ ...f, q: e.target.value }))}
        />
        <input
          className="border rounded px-3 py-2 min-w-[260px]"
          placeholder="Tech stack (CSV, npr. react,node,python)"
          value={(filters.stack ?? []).join(',')}
          onChange={(e) => {
            const val = e.target.value;
            const arr = val.split(',').map(s => s.trim()).filter(Boolean);
            setFilters(f => ({ ...f, stack: arr, page: 1 }));
          }}
        />
        <select
          className="border rounded px-3 py-2"
          value={(filters.country ?? '').toUpperCase()}
          onChange={(e) => setFilters(f => ({ ...f, country: e.target.value.toUpperCase(), page: 1 }))}
        >
          {COUNTRIES.map(c => <option key={c || 'any'} value={c}>{c ? c : 'Bilo koja država'}</option>)}
        </select>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!filters.remote}
            onChange={(e) => setFilters(f => ({ ...f, remote: e.target.checked, page: 1 }))}
          />
          Remote only
        </label>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {LEVELS.map(lvl => {
            const active = (filters.level ?? []).includes(lvl);
            return (
              <label key={lvl} className={`px-2 py-1 border rounded cursor-pointer ${active ? 'bg-black text-white' : ''}`}>
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={active}
                  onChange={(e) => {
                    setFilters(f => {
                      const curr = new Set(f.level ?? []);
                      if (e.target.checked) curr.add(lvl);
                      else curr.delete(lvl);
                      return { ...f, level: Array.from(curr), page: 1 };
                    });
                  }}
                />
                {lvl}
              </label>
            );
          })}
        </div>
                    <button
                      className="rounded px-3 py-2 border"
                      onClick={loadAllJobs}
                      disabled={loadingAll || loading}
                      title="Učitaj sve stranice (može potrajati)"
                    >
                      {loadingAll ? 'Učitavam sve…' : 'Učitaj sve'}
                    </button>
                    {allItems && (
                      <button
                        className="rounded px-3 py-2 border"
                        onClick={() => setAllItems(null)}
                        title="Vrati se na paginaciju"
                      >
                        Vrati paginaciju
                      </button>
                    )}
        <label className="inline-flex items-center gap-2 text-sm">
          Od poslednjih:
          <select
            className="border rounded px-2 py-1"
            value={String(filters.sinceDays ?? 30)}
            onChange={(e) => setFilters(f => ({ ...f, sinceDays: Number(e.target.value), page: 1 }))}
          >
            {[7,14,30,60,90].map(v => <option key={v} value={v}>{v} dana</option>)}
          </select>
        </label>
        <select
          className="border rounded px-3 py-2"
          value={sort}
          onChange={(e) => {
            const next = e.target.value as SortKey;
            setSort(next);
            setFilters(f => ({ ...f, sort: next, page: 1 }));
          }}
        >
          <option value="posted_desc">Najnovije</option>
          <option value="posted_asc">Najstarije</option>
          <option value="salary_desc">Najviša plata (originalna valuta)</option>
          <option value="salary_eur_desc">Najviša plata (EUR)</option>
        </select>
        <button
          className="rounded px-4 py-2 bg-black text-white disabled:opacity-50"
          onClick={() => refetch()}
          disabled={loading}
        >
          {loading ? 'Učitavanje…' : 'Primeni filtere'}
        </button>
        <a
          className="ml-auto underline text-sm"
          href={csvHref}
          target="_blank"
          rel="noreferrer"
        >
          Export CSV
        </a>
        <button
          className="rounded px-3 py-2 border"
          onClick={async () => {
            const name = prompt('Naziv pretrage (npr. "React Senior EU"):');
            if (!name) return;
            const payload = {
              name,
              params: {
                q: filters.q ?? '',
                country: filters.country ?? '',
                remote: !!filters.remote,
                sinceDays: filters.sinceDays ?? 30,
                stack: filters.stack ?? [],
                level: filters.level ?? [],
                sort
              }
            };
            const res = await fetch('/api/saved-searches', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (!json.ok) alert('Greška: ' + (json.error || ''));
            else alert('Sačuvano ✅');
          }}
        >
          Sačuvaj pretragu
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <SavedSearches onLoad={(p: SavedSearchParams) => {
        setFilters(f => ({
          ...f,
          q: p.q ?? '',
          country: p.country ?? '',
          remote: !!p.remote,
          sinceDays: p.sinceDays ?? 30,
          stack: Array.isArray(p.stack) ? p.stack : [],
          level: Array.isArray(p.level) ? (p.level as (typeof LEVELS[number])[]) : [],
          page: 1,
        }));
        setSort((p.sort as SortKey) ?? 'posted_desc');
        void refetch();
      }} />

      <div className="text-sm text-gray-600 mb-2">
        Prikazano: { (allItems ? allItems.length : items.length) } / { total }
      </div>
      <ul className="space-y-3">
        {(allItems ?? items).map(j => (
          <li key={j.stable_key} className="border rounded p-4">
            <div className="text-xs text-gray-500">{j.source_name}</div>
            <a href={j.apply_url} target="_blank" rel="noreferrer" className="text-lg font-medium hover:underline">
              {j.title}
            </a>
            <div className="text-sm">
              {j.company}{j.location ? ` — ${j.location}` : ''}
            </div>
            <div className="text-xs text-gray-500">
              {new Date(j.posted_at).toLocaleString()}
              {renderSalary(j.salary_min, j.salary_max, j.salary_currency, j.salary_min_eur, j.salary_max_eur)}
            </div>
          </li>
        ))}
      </ul>

      {!allItems && (
      <div className="flex items-center gap-3 mt-6">
        <button
          className="border rounded px-3 py-1"
          onClick={() => setFilters(f => ({ ...f, page: Math.max(1, (f.page ?? 1) - 1) }))}
          disabled={!canPrev}
        >
          ← Prethodna
        </button>
        <span className="text-sm text-gray-600">
          Strana {page} · {total} ukupno
        </span>
        <button
          className="border rounded px-3 py-1"
          onClick={() => setFilters(f => ({ ...f, page: (f.page ?? 1) + 1 }))}
          disabled={!canNext}
        >
          Sledeća →
        </button>
      </div>
      )}
    </div>
  );
}

function renderSalary(min?: number | null, max?: number | null, cur?: string | null, minEur?: number | null, maxEur?: number | null) {
  if (!min && !max) return null;
  const unit = cur ? ` ${cur}` : '';
  const range = min && max && min !== max ? `${min}–${max}${unit}` : `${min ?? max}${unit}`;
  const eur = (minEur || maxEur) ? ` (€ ${minEur && maxEur && minEur !== maxEur ? `${minEur}–${maxEur}` : (minEur ?? maxEur)})` : '';
  return <span> • {range}{eur}</span>;
}

type SavedSearchParams = {
  q?: string;
  country?: string;
  remote?: boolean;
  sinceDays?: number;
  stack?: string[];
  level?: string[];
  sort?: string;
};
type Saved = { id: string; name: string; params: SavedSearchParams; created_at: string };

function SavedSearches({ onLoad }: { onLoad: (p: SavedSearchParams) => void }) {
  const [items, setItems] = useState<Saved[]>([]);
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/saved-searches', { cache: 'no-store' });
      if (res.status === 401) { setItems([]); return; }
      const json = await res.json();
      if (!json.ok) setErr(json.error || 'Error');
      else setItems(json.items || []);
    })();
  }, []);

  if (err) return null;
  if (!items.length) return null;

  return (
    <div className="mt-3 text-sm">
      <div className="mb-1 text-gray-600">Sačuvane pretrage:</div>
      <div className="flex flex-wrap gap-2">
        {items.map(s => (
          <button
            key={s.id}
            className="border rounded px-2 py-1 hover:bg-gray-50"
            onClick={() => onLoad(s.params)}
            title={new Date(s.created_at).toLocaleString()}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
