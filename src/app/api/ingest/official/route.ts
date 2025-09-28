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

// Allow Vercel Cron to trigger a GET without admin token. Gate by Vercel env + header.
export async function GET(req: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ ok: false, error: 'Supabase env missing' }, { status: 500 });
    }
    const isVercel = !!process.env.VERCEL;
    const hasCronHeader = !!req.headers.get('x-vercel-cron');
    if (!isVercel || !hasCronHeader) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    await ingestOfficialFeeds();
    return NextResponse.json({ ok: true, via: 'cron' });
  } catch (e) {
    const err = e as { message?: string; status?: number };
    const status = err?.status ?? 500;
    return NextResponse.json({ ok: false, error: String(err?.message || e) }, { status });
  }
}
