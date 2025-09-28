// Server-only utility for fetching currency rates to EUR in batch-like fashion
export async function getRatesToEUR(codes: string[]): Promise<Record<string, number>> {
  const uniq = Array.from(new Set(codes.map((c) => (c || '').toUpperCase()).filter(Boolean)));
  const map: Record<string, number> = { EUR: 1 };
  for (const c of uniq) {
    if (c === 'EUR' || c === '€') {
      map['EUR'] = 1;
      continue;
    }
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/fx/latest?base=${encodeURIComponent(c)}&symbols=EUR`,
      { cache: 'no-store' }
    );
    if (!res.ok) continue;
    const json = await res.json();
    const rate = json?.rates?.EUR;
    if (typeof rate === 'number' && rate > 0) map[c] = rate; // 1 unit of c in EUR
  }
  return map;
}

export function toEUR(
  amount: number | null | undefined,
  cur: string | null | undefined,
  rates: Record<string, number>
) {
  if (!amount || !cur) return null;
  const c = cur.replace(/[^A-Z]/gi, '').toUpperCase();
  const r = rates[c];
  return typeof r === 'number' ? Number((amount * r).toFixed(2)) : null;
}
