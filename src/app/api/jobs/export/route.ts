import { supabase } from '@/lib/telemetry/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function qp(url: string, k: string) {
  return new URL(url).searchParams.get(k);
}

function countryToName(iso: string) {
  const m: Record<string, string> = {
    RS: 'Serbia',
    HR: 'Croatia',
    BA: 'Bosnia',
    SI: 'Slovenia',
    ME: 'Montenegro',
    MK: 'Macedonia',
    AL: 'Albania',
    RO: 'Romania',
    BG: 'Bulgaria',
    HU: 'Hungary',
    PL: 'Poland',
    DE: 'Germany',
    AT: 'Austria',
    CH: 'Switzerland',
    IT: 'Italy',
  };
  return m[iso] || iso;
}

function buildOrIlike(field: string, needles: string[]) {
  const parts = needles.map((s) => s.trim()).filter(Boolean).map((s) => `${field}.ilike.%${s}%`);
  return parts.length ? parts.join(',') : null;
}

export async function GET(req: Request) {
  const q = (qp(req.url, 'q') || '').trim();
  const country = (qp(req.url, 'country') || '').trim().toUpperCase();
  const remote = qp(req.url, 'remote');
  const sinceDays = Math.min(90, Math.max(0, Number(qp(req.url, 'sinceDays') || 30)));
  const stackCsv = (qp(req.url, 'stack') || '').trim();
  const levelCsv = (qp(req.url, 'level') || '').trim();
  const sort = (qp(req.url, 'sort') || 'posted_desc').toLowerCase();

  const stack = stackCsv ? stackCsv.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const levels = levelCsv ? levelCsv.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) : [];

  let query = supabase
    .from('jobs_public_v')
    .select('*')
    .gte('posted_at', new Date(Date.now() - sinceDays * 864e5).toISOString())
    .limit(1000);

  if (q) {
    const o1 = buildOrIlike('title', [q]);
    const o2 = buildOrIlike('company', [q]);
    if (o1 && o2) query = query.or(`${o1},${o2}`);
    else if (o1) query = query.or(o1);
    else if (o2) query = query.or(o2);
  }
  if (remote === 'true') query = query.eq('remote', true);
  if (country) query = query.or(`location.ilike.%${country}%,location.ilike.%${countryToName(country)}%`);
  if (stack.length) {
    const o1 = buildOrIlike('title', stack);
    const o2 = buildOrIlike('company', stack);
    if (o1 && o2) query = query.or(`${o1},${o2}`);
    else if (o1) query = query.or(o1);
    else if (o2) query = query.or(o2);
  }
  if (levels.length) {
    const orTitle = buildOrIlike('title', levels);
    if (orTitle) query = query.or(orTitle);
  }

  // Sorting
  if (sort === 'posted_asc') {
    query = query.order('posted_at', { ascending: true }).order('stable_key', { ascending: true });
  } else if (sort === 'salary_desc') {
    query = query
      .order('salary_max', { ascending: false })
      .order('salary_min', { ascending: false })
      .order('posted_at', { ascending: false })
      .order('stable_key', { ascending: true });
  } else if (sort === 'salary_eur_desc') {
    query = query
      .order('salary_max_eur', { ascending: false })
      .order('salary_min_eur', { ascending: false })
      .order('posted_at', { ascending: false })
      .order('stable_key', { ascending: true });
  } else {
    query = query.order('posted_at', { ascending: false }).order('stable_key', { ascending: true });
  }

  const { data, error } = await query;
  if (error)
    return new Response(`error,${error.message}\n`, {
      status: 500,
      headers: { 'content-type': 'text/csv; charset=utf-8' },
    });

  // CSV escaping helper
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };

  const header = [
    'stable_key',
    'source_name',
    'title',
    'company',
    'location',
    'posted_at',
    'apply_url',
    'salary_min',
    'salary_max',
    'salary_currency',
    'salary_min_eur',
    'salary_max_eur',
  ];
  const lines = [header.join(',')];
  for (const j of data ?? []) {
    const row = [
      j.stable_key,
      j.source_name,
      j.title,
      j.company,
      j.location || '',
      j.posted_at,
      j.apply_url,
      j.salary_min ?? '',
      j.salary_max ?? '',
      j.salary_currency ?? '',
      j.salary_min_eur ?? '',
      j.salary_max_eur ?? '',
    ].map(esc);
    lines.push(row.join(','));
  }
  const body = lines.join('\n');

  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="jobs_export.csv"`,
    },
  });
}
