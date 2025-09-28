import { NextResponse } from 'next/server';
import { supabase } from '@/lib/telemetry/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const LEVEL_KEYWORDS: Record<string, string[]> = {
  intern: ['intern', 'internship', 'praksa'],
  junior: ['junior', 'entry', 'grad', 'mladji', 'mlađi'],
  mid: ['mid', 'middle', 'intermediate', 'medior'],
  senior: ['senior', 'sr.', 'sr ', 'sen.', 'iskusan'],
  lead: ['lead', 'tech lead', 'team lead', 'lead engineer'],
  principal: ['principal', 'staff', 'architect'],
};

function buildOrIlike(field: string, needles: string[]) {
  const parts = needles
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => `${field}.ilike.%${s.replaceAll(',', ' ')}%`);
  return parts.length ? parts.join(',') : null;
}

function countryToName(iso: string) {
  const map: Record<string, string> = {
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
  return map[iso] || iso;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const q = (searchParams.get('q') || '').trim();
  const country = (searchParams.get('country') || '').trim().toUpperCase();
  const remote = searchParams.get('remote');
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') || 20)));
  const sinceDays = Math.min(90, Math.max(0, Number(searchParams.get('sinceDays') || 30)));

  // NEW: stack (CSV) and level (CSV: intern,junior,mid,senior,lead,principal)
  const stackCsv = (searchParams.get('stack') || '').trim();
  const levelCsv = (searchParams.get('level') || '').trim();

  const stack = stackCsv ? stackCsv.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const levels = levelCsv ? levelCsv.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) : [];

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('jobs_public_v')
    .select('*', { count: 'exact' })
    .gte('posted_at', new Date(Date.now() - sinceDays * 864e5).toISOString())
    .order('posted_at', { ascending: false });

  // Basic text search across title/company
  if (q) {
    // OR group over title/company
    const orExpr = buildOrIlike('title', [q]);
    const orExpr2 = buildOrIlike('company', [q]);
    if (orExpr && orExpr2) query = query.or(`${orExpr},${orExpr2}`);
    else if (orExpr) query = query.or(orExpr);
    else if (orExpr2) query = query.or(orExpr2);
  }

  if (remote === 'true') query = query.eq('remote', true);

  if (country) {
    // Heuristic via 'location' (string), match ISO or English name
    query = query.or(`location.ilike.%${country}%,location.ilike.%${countryToName(country)}%`);
  }

  // NEW: stack → match in title/company
  if (stack.length) {
    const orTitle = buildOrIlike('title', stack);
    const orCompany = buildOrIlike('company', stack);
    if (orTitle && orCompany) query = query.or(`${orTitle},${orCompany}`);
    else if (orTitle) query = query.or(orTitle);
    else if (orCompany) query = query.or(orCompany);
  }

  // NEW: level → map to keyword set and OR over title
  if (levels.length) {
    const need: string[] = [];
    for (const lvl of levels) {
      const kws = LEVEL_KEYWORDS[lvl];
      if (kws) need.push(...kws);
    }
    const orTitle = need.length ? buildOrIlike('title', need) : null;
    if (orTitle) query = query.or(orTitle);
  }

  // Sorting
  const sort = (searchParams.get('sort') || 'posted_desc').toLowerCase();
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
    // posted_desc default
    query = query.order('posted_at', { ascending: false }).order('stable_key', { ascending: true });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    page,
    pageSize,
    total: count ?? 0,
    items: data,
  });
}
