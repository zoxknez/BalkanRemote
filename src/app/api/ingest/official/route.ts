import { NextResponse } from 'next/server';
import { ingestOfficialFeeds } from '@/lib/ingest/runOfficial';
import { assertAdminToken } from '@/lib/auth/adminToken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ ok: false, error: 'Supabase env missing' }, { status: 500 });
    }
    assertAdminToken(req);
    await ingestOfficialFeeds();
    return NextResponse.json({ ok: true });
  } catch (e) {
    const err = e as { message?: string; status?: number };
    const status = err?.status ?? 500;
    return NextResponse.json({ ok: false, error: String(err?.message || e) }, { status });
  }
}
