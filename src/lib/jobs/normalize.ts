export const toISO = (d: string | number | Date) => new Date(d).toISOString();

export function parseSalaryLoose(input?: string | null) {
  if (!input) return { min: null as number | null, max: null as number | null, cur: null as string | null };
  const sym = input.match(/(€|eur|rsd|usd|\$|£)/i)?.[0] || null;
  const cur = sym ? sym.toUpperCase() : null;
  const nums = (input.match(/\d[\d.,]*/g) || []).map((x) => Number(x.replace(/[.,](?=\d{3}\b)/g, '')));
  if (!nums.length) return { min: null as number | null, max: null as number | null, cur };
  const [a, b] = nums;
  return { min: b ? Math.min(a, b) : a, max: b || a, cur };
}
