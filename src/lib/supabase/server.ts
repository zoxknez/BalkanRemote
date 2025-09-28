import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function getServerSupabase() {
  const cookieStore = await cookies();
  const all = cookieStore.getAll().map(c => ({ name: c.name, value: c.value }));
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => all,
        setAll: () => { /* no-op in route context */ },
      },
    }
  );
}
