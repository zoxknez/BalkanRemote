// Server-only utility for fetching currency rates to EUR in batch-like fashion
// Ingestion may run outside Next.js runtime, so we avoid relying on internal routes.
// We use a public FX API by default, configurable via FX_BASE_URL env.
// Defaults: https://api.exchangerate.host (free, no key)
export async function getRatesToEUR(codes: string[]): Promise<Record<string, number>> {
  const uniq = Array.from(new Set(codes.map((c) => (c || '').toUpperCase()).filter(Boolean)));
  const map: Record<string, number> = { EUR: 1 };
  if (uniq.length === 0) return map;

  const FX_BASE = process.env.FX_BASE_URL?.replace(/\/$/, '') || 'https://api.exchangerate.host';

  for (const c of uniq) {
    const cur = c.replace(/[^A-Z]/gi, '').toUpperCase();
    if (!cur || cur === 'EUR') { map['EUR'] = 1; continue; }
    try {
      const res = await fetch(`${FX_BASE}/latest?base=${encodeURIComponent(cur)}&symbols=EUR`, { cache: 'no-store' });
      if (!res.ok) continue;
      const json = await res.json();
      const rate = json?.rates?.EUR;
      if (typeof rate === 'number' && rate > 0) map[cur] = rate; // 1 unit of cur in EUR
    } catch {
      // ignore individual rate failures; we’ll just skip EUR conversion for that currency
    }
  }
  return map;
}

export function toEUR(
  amount: number | null | undefined,
  cur: string | null | undefined,
  rates: Record<string, number>
) {
  if (amount == null || !isFinite(Number(amount)) || !cur) return null;
  const c = cur.replace(/[^A-Z]/gi, '').toUpperCase();
  const r = rates[c];
  return typeof r === 'number' ? Number((amount * r).toFixed(2)) : null;
}
