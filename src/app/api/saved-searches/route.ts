// app/api/saved-searches/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SavedSearchParams = {
  q?: string;
  country?: string;
  remote?: boolean;
  sinceDays?: number;
  stack?: string[];
  level?: string[];
  sort?: string;
};

// ── Zod šeme ───────────────────────────────────────────────────────────────────
const SavedSearchParamsSchema = z
  .object({
    q: z.string().trim().min(1).optional(),
    country: z.string().trim().min(1).optional(),
    remote: z.boolean().optional(),
    sinceDays: z.number().int().min(0).max(365).optional(),
    stack: z.array(z.string().trim().min(1)).max(50).optional().default([]),
    level: z.array(z.string().trim().min(1)).max(50).optional().default([]),
    sort: z.string().trim().min(1).optional(),
  })
  .strict();

const BodySchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    params: SavedSearchParamsSchema,
  })
  .strict();

// ── util ───────────────────────────────────────────────────────────────────────
function compactParams<T extends Record<string, unknown>>(obj: T) {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined) continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out as T;
}

function json(status: number, payload: unknown) {
  return NextResponse.json(payload, { status });
}

// ── GET /api/saved-searches ───────────────────────────────────────────────────
export async function GET() {
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr) return json(500, { ok: false, error: authErr.message });
  if (!user) return json(401, { ok: false, error: 'Unauthorized' });

  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return json(500, { ok: false, error: error.message });
  return json(200, { ok: true, items: data ?? [] });
}

// ── POST /api/saved-searches ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr) return json(500, { ok: false, error: authErr.message });
  if (!user) return json(401, { ok: false, error: 'Unauthorized' });

  const raw = await req
    .json()
    .catch(() => null as unknown as { name?: string; params?: SavedSearchParams });

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return json(400, {
      ok: false,
      error: 'Invalid body',
      issues: parsed.error.issues,
    });
  }

  const { name, params } = parsed.data;
  const cleanParams = compactParams(params);

  const { data, error } = await supabase
    .from('saved_searches')
    .insert({ user_id: user.id, name, params: cleanParams })
    .select()
    .single();

  if (error) return json(500, { ok: false, error: error.message });
  return json(200, { ok: true, item: data });
}

// ── DELETE /api/saved-searches?id=... ─────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const supabase = await getServerSupabase();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr) return json(500, { ok: false, error: authErr.message });
  if (!user) return json(401, { ok: false, error: 'Unauthorized' });

  const id = req.nextUrl.searchParams.get('id');
  if (!id || !id.trim()) return json(400, { ok: false, error: 'Missing id' });

  const { error } = await supabase
    .from('saved_searches')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return json(500, { ok: false, error: error.message });
  return json(200, { ok: true });
}
