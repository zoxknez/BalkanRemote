import { NextResponse } from 'next/server';
import { ingestOfficialFeeds } from '@/lib/ingest/runOfficial';

export const runtime = 'nodejs';

export async function POST() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { ok: false, error: 'Missing Supabase server env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 500 }
    );
  }
  await ingestOfficialFeeds();
  return NextResponse.json({ ok: true });
}
